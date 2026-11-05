// @vitest-environment jsdom
import { act, cleanup, render, renderHook, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CONFIG from "@/config/config.json";
import { AudioProvider, useAudio } from "@/contexts/audio-context";
import { AudioCardPlayer } from "@/components/audio-player/audio-card-player";
import { AudioPlayer } from "@/components/audio-player/audio-player";

// Integration test: the real AudioProvider, players and localStorage work together.
// Only the browser's media playback is faked, because jsdom cannot play audio.

const STORAGE_KEY = CONFIG.localstorageKey.audioTime;

type FakeMediaState = { paused: boolean; currentTime: number; duration: number };

const mediaStates = new WeakMap<HTMLMediaElement, FakeMediaState>();
let lastPlayedElement: HTMLMediaElement | null = null;

function getState(element: HTMLMediaElement): FakeMediaState {
  let state = mediaStates.get(element);
  if (!state) {
    state = { paused: true, currentTime: 0, duration: Number.NaN };
    mediaStates.set(element, state);
  }
  return state;
}

function installFakeMediaPlayback() {
  const prototype = window.HTMLMediaElement.prototype;

  vi.spyOn(prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    getState(this).paused = false;
    lastPlayedElement = this;
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  vi.spyOn(prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    getState(this).paused = true;
    this.dispatchEvent(new Event("pause"));
  });
  vi.spyOn(prototype, "load").mockImplementation(() => {});

  vi.spyOn(prototype, "paused", "get").mockImplementation(function (this: HTMLMediaElement) {
    return getState(this).paused;
  });
  vi.spyOn(prototype, "duration", "get").mockImplementation(function (this: HTMLMediaElement) {
    return getState(this).duration;
  });
  vi.spyOn(prototype, "currentTime", "get").mockImplementation(function (this: HTMLMediaElement) {
    return getState(this).currentTime;
  });
  vi.spyOn(prototype, "currentTime", "set").mockImplementation(function (this: HTMLMediaElement, value: number) {
    getState(this).currentTime = value;
  });
}

// Simulates the browser reaching a point in the file, as `timeupdate` would.
function moveAudioTo(seconds: number) {
  const audio = lastPlayedElement!;
  act(() => {
    getState(audio).currentTime = seconds;
    audio.dispatchEvent(new Event("timeupdate"));
  });
}

// Simulates the browser reading the file's length, as it does after loading.
function loadAudioWithDuration(seconds: number) {
  const audio = lastPlayedElement!;
  act(() => {
    getState(audio).duration = seconds;
    audio.dispatchEvent(new Event("loadedmetadata"));
  });
}

// Fires a media event on the playing element, as the browser would.
function fireAudioEvent(eventName: string) {
  const audio = lastPlayedElement!;
  act(() => {
    audio.dispatchEvent(new Event(eventName));
  });
}

function renderPlayers(trackIds: string[]) {
  const players = [];
  for (const trackId of trackIds) {
    players.push(
      <AudioCardPlayer
        key={trackId}
        id={trackId}
        audioSrc={`https://assets.ctfassets.net/${trackId}.mp3`}
        duration="10:00"
      />
    );
  }

  const { container } = render(<AudioProvider>{players}</AudioProvider>);

  function playerFor(trackId: string) {
    const playerElement = container.querySelector<HTMLElement>(`[data-audio-track-id="${trackId}"]`);
    return within(playerElement!);
  }

  return { playerFor };
}

function readSavedProgress(): Record<string, number> {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
}

beforeEach(() => {
  installFakeMediaPlayback();
  localStorage.clear();
  lastPlayedElement = null;
});

afterEach(() => {
  // Unmount while the fake is still installed: unmounting pauses the audio,
  // and jsdom's real pause() only logs "Not implemented".
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("audio playback", () => {
  it("plays and pauses a lecture from its Play button", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    expect(playerFor("lecture-a").getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(lastPlayedElement?.src).toBe("https://assets.ctfassets.net/lecture-a.mp3");

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Pause" }));
    expect(playerFor("lecture-a").getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("resumes the same lecture without reloading it when Play is pressed again", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Pause" }));
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));

    expect(playerFor("lecture-a").getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(window.HTMLMediaElement.prototype.load).toHaveBeenCalledTimes(1);
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  });

  it("stays on Play when the browser blocks playback", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    // Browsers reject play() (e.g. autoplay rules) without firing a "play" event.
    vi.mocked(window.HTMLMediaElement.prototype.play).mockImplementationOnce(() =>
      Promise.reject(new DOMException("Playback blocked", "NotAllowedError"))
    );
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));

    expect(playerFor("lecture-a").getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(expect.any(DOMException));
  });

  it("plays one lecture at a time", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a", "lecture-b"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    await user.click(playerFor("lecture-b").getByRole("button", { name: "Play" }));

    expect(playerFor("lecture-a").getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(playerFor("lecture-b").getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(lastPlayedElement?.src).toBe("https://assets.ctfassets.net/lecture-b.mp3");
  });

  it("shows the playing position on the lecture's own player only", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a", "lecture-b"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    moveAudioTo(75);

    expect(playerFor("lecture-a").getByText("1:15")).toBeInTheDocument();
    expect(playerFor("lecture-b").getByText("0:00")).toBeInTheDocument();
  });

  it("resumes a lecture from the position saved in localStorage", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ "lecture-a": 120 }));
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    const audio = lastPlayedElement!;
    act(() => {
      getState(audio).duration = 600;
      audio.dispatchEvent(new Event("loadedmetadata"));
    });

    expect(audio.currentTime).toBe(120);
    expect(playerFor("lecture-a").getByText("2:00")).toBeInTheDocument();
  });

  it("saves the position every 3 seconds while playing and forgets it when the lecture ends", async () => {
    // Fake only the interval timer, so user-event's own timeouts still run.
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    moveAudioTo(42);
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(readSavedProgress()).toEqual({ "lecture-a": 42 });

    act(() => {
      lastPlayedElement!.dispatchEvent(new Event("ended"));
    });

    expect(readSavedProgress()).toEqual({});
  });

  it("does not save a position while paused", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    moveAudioTo(42);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Pause" }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(readSavedProgress()).toEqual({});
  });
});

describe("skip buttons", () => {
  it("skip 15 seconds back and forward in the playing lecture", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    loadAudioWithDuration(600);
    moveAudioTo(100);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Skip forward 15 seconds" }));
    expect(lastPlayedElement!.currentTime).toBe(115);
    expect(playerFor("lecture-a").getByText("1:55")).toBeInTheDocument();

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Skip back 15 seconds" }));
    expect(lastPlayedElement!.currentTime).toBe(100);
  });

  it("stop at the start and at the end of the lecture", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    loadAudioWithDuration(600);

    moveAudioTo(5);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Skip back 15 seconds" }));
    expect(lastPlayedElement!.currentTime).toBe(0);

    moveAudioTo(590);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Skip forward 15 seconds" }));
    expect(lastPlayedElement!.currentTime).toBe(600);
  });

  it("start a lecture that is not playing yet, instead of skipping", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a", "lecture-b"]);

    await user.click(playerFor("lecture-a").getByRole("button", { name: "Skip forward 15 seconds" }));
    expect(playerFor("lecture-a").getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(lastPlayedElement!.currentTime).toBe(0);

    await user.click(playerFor("lecture-b").getByRole("button", { name: "Skip back 15 seconds" }));
    expect(playerFor("lecture-b").getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(lastPlayedElement?.src).toBe("https://assets.ctfassets.net/lecture-b.mp3");
  });
});

describe("progress slider", () => {
  it("moves the playing lecture to the chosen position", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    loadAudioWithDuration(600);
    moveAudioTo(100);

    // Keyboard keys work the same way as dragging: Home is the start, End the end.
    playerFor("lecture-a").getByRole("slider").focus();
    await user.keyboard("{End}");
    expect(lastPlayedElement!.currentTime).toBe(600);

    await user.keyboard("{Home}");
    expect(lastPlayedElement!.currentTime).toBe(0);
  });

  it("starts a lecture that is not playing when its slider is used", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a", "lecture-b"]);

    playerFor("lecture-b").getByRole("slider").focus();
    await user.keyboard("{End}");

    expect(playerFor("lecture-b").getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(lastPlayedElement?.src).toBe("https://assets.ctfassets.net/lecture-b.mp3");
  });
});

describe("loading and errors", () => {
  it("shows a loading spinner while the audio buffers, then the Pause button again", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a", "lecture-b"]);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));

    fireAudioEvent("waiting");
    expect(playerFor("lecture-a").getByRole("button", { name: "Loading" })).toBeInTheDocument();
    // Only the lecture that is buffering shows the spinner.
    expect(playerFor("lecture-b").getByRole("button", { name: "Play" })).toBeInTheDocument();

    fireAudioEvent("canplay");
    expect(playerFor("lecture-a").getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("returns to Play when the audio fails to load", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    fireAudioEvent("waiting");

    fireAudioEvent("error");

    expect(playerFor("lecture-a").getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith("Audio error:", expect.any(Event));
  });

  it("goes back to the start when the lecture ends", async () => {
    const user = userEvent.setup();
    const { playerFor } = renderPlayers(["lecture-a"]);
    await user.click(playerFor("lecture-a").getByRole("button", { name: "Play" }));
    loadAudioWithDuration(600);
    moveAudioTo(600);

    act(() => {
      getState(lastPlayedElement!).paused = true;
    });
    fireAudioEvent("ended");

    expect(lastPlayedElement!.currentTime).toBe(0);
    expect(playerFor("lecture-a").getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(playerFor("lecture-a").getByText("0:00")).toBeInTheDocument();
  });
});

describe("useAudio controls not used by the current UI", () => {
  // toggle, pause and seek are part of the hook's API (e.g. for a future
  // mini-player) but no component calls them yet, so test them through the hook.
  function renderAudioHook() {
    return renderHook(() => useAudio(), {
      wrapper: ({ children }) => <AudioProvider>{children}</AudioProvider>,
    });
  }

  const track = { id: "lecture-a", src: "https://assets.ctfassets.net/lecture-a.mp3" };

  it("toggle and pause control the current lecture, and do nothing with none", () => {
    const { result } = renderAudioHook();

    act(() => result.current.toggle());
    expect(lastPlayedElement).toBeNull();

    act(() => result.current.playTrack(track));
    expect(result.current.isPlaying).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isPlaying).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.isPlaying).toBe(true);

    act(() => result.current.pause());
    expect(result.current.isPlaying).toBe(false);
  });

  it("seek moves the shown time, within the lecture, without moving the audio", () => {
    const { result } = renderAudioHook();
    act(() => result.current.playTrack(track));
    loadAudioWithDuration(600);

    act(() => result.current.seek(700));
    expect(result.current.currentTime).toBe(600);

    act(() => result.current.seek(-5));
    expect(result.current.currentTime).toBe(0);
    expect(lastPlayedElement!.currentTime).toBe(0);
  });

  it("learns the lecture length from durationchange and canplay, and stops loading on canplaythrough", () => {
    const { result } = renderAudioHook();
    act(() => result.current.playTrack(track));
    const audio = lastPlayedElement!;

    act(() => {
      getState(audio).duration = 600;
      audio.dispatchEvent(new Event("durationchange"));
    });
    expect(result.current.duration).toBe(600);
    expect(result.current.isLoaded).toBe(true);

    act(() => {
      getState(audio).duration = 610;
      audio.dispatchEvent(new Event("canplay"));
    });
    expect(result.current.duration).toBe(610);

    fireAudioEvent("waiting");
    expect(result.current.isBuffering).toBe(true);
    fireAudioEvent("canplaythrough");
    expect(result.current.isBuffering).toBe(false);
  });

  it("logs and stays paused when toggle cannot start playback", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderAudioHook();
    act(() => result.current.playTrack(track));
    act(() => result.current.pause());

    vi.mocked(window.HTMLMediaElement.prototype.play).mockImplementationOnce(() =>
      Promise.reject(new DOMException("Playback blocked", "NotAllowedError"))
    );
    await act(async () => result.current.toggle());

    expect(result.current.isPlaying).toBe(false);
    expect(consoleError).toHaveBeenCalledWith("Audio play failed:", expect.any(DOMException));
  });

  it("throws a clear error when used outside AudioProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAudio())).toThrow("useAudio must be used within an AudioProvider");
  });
});

describe("AudioPlayer parts", () => {
  it("throw a clear error when used outside AudioPlayer.Root", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(
        <AudioProvider>
          <AudioPlayer.PlayPause />
        </AudioProvider>
      )
    ).toThrow("AudioPlayer components must be used within AudioPlayer.Root");
  });
});

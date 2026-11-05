// @vitest-environment jsdom
import { act, cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CONFIG from "@/config/config.json";
import { AudioProvider } from "@/contexts/audio-context";
import { AudioCardPlayer } from "@/components/audio-player/audio-card-player";

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

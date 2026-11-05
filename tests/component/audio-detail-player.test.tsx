// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAudio } from "@/contexts/audio-context";
import { AudioDetailPlayer } from "@/components/audio-player/audio-detail-player";

// Component test: the shared audio context is replaced by a fake, so each test
// sets exactly the playback state it needs. Real playback is covered by
// tests/integration/audio-playback.test.tsx.
vi.mock("@/contexts/audio-context", () => ({ useAudio: vi.fn() }));
vi.mock("sonner", () => ({ toast: vi.fn() }));

const mockedUseAudio = vi.mocked(useAudio);

const LECTURE_ID = "lecture-1";
const AUDIO_URL = "https://assets.ctfassets.net/audio.mp4";

type AudioState = ReturnType<typeof useAudio>;

function fakeAudioState(overrides: Partial<AudioState> = {}): AudioState {
  return {
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    isBuffering: false,
    playTrack: vi.fn(),
    toggle: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
    seekImmediate: vi.fn(),
    skipBackward: vi.fn(),
    skipForward: vi.fn(),
    ...overrides,
  };
}

// The state when this page's lecture is the one loaded in the player.
function playingThisLecture(overrides: Partial<AudioState> = {}): AudioState {
  return fakeAudioState({
    currentTrack: { id: LECTURE_ID, src: AUDIO_URL },
    isPlaying: true,
    duration: 1493,
    ...overrides,
  });
}

function renderPlayer() {
  render(
    <AudioDetailPlayer
      id={LECTURE_ID}
      audioSrc={AUDIO_URL}
      downloadSrc={`/api/download?url=${AUDIO_URL}`}
      duration="24:53"
      title="Mauritius - Islamic Finance Hub"
    />
  );
}

beforeEach(() => {
  mockedUseAudio.mockReturnValue(fakeAudioState());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AudioDetailPlayer", () => {
  it("shows the lecture ready to play, at 0:00 of its length", () => {
    renderPlayer();

    expect(screen.getByText("Now Playing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(screen.getByText("24:53")).toBeInTheDocument();
  });

  it("asks the player to play this lecture when Play is pressed", async () => {
    const audioState = fakeAudioState();
    mockedUseAudio.mockReturnValue(audioState);
    const user = userEvent.setup();
    renderPlayer();

    await user.click(screen.getByRole("button", { name: "Play" }));

    expect(audioState.playTrack).toHaveBeenCalledWith(expect.objectContaining({ id: LECTURE_ID, src: AUDIO_URL }));
  });

  it("shows Pause and the current position while this lecture plays", () => {
    mockedUseAudio.mockReturnValue(playingThisLecture({ currentTime: 75 }));

    renderPlayer();

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByText("1:15")).toBeInTheDocument();
  });

  it("ignores the position of a different lecture that is playing elsewhere", () => {
    mockedUseAudio.mockReturnValue(
      fakeAudioState({ currentTrack: { id: "other-lecture", src: "other.mp3" }, isPlaying: true, currentTime: 75 })
    );

    renderPlayer();

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("shows a loading state while this lecture buffers", () => {
    mockedUseAudio.mockReturnValue(playingThisLecture({ isBuffering: true }));

    renderPlayer();

    expect(screen.getByRole("button", { name: "Loading" })).toBeInTheDocument();
  });

  it("skips 15 seconds back and forward in this lecture", async () => {
    const audioState = playingThisLecture();
    mockedUseAudio.mockReturnValue(audioState);
    const user = userEvent.setup();
    renderPlayer();

    await user.click(screen.getByRole("button", { name: "Skip back 15 seconds" }));
    await user.click(screen.getByRole("button", { name: "Skip forward 15 seconds" }));

    expect(audioState.skipBackward).toHaveBeenCalledWith(15);
    expect(audioState.skipForward).toHaveBeenCalledWith(15);
  });

  it("offers the download and confirms it with a toast", async () => {
    const user = userEvent.setup();
    renderPlayer();

    const downloadLink = screen.getByRole("link", { name: /Download Audio/ });
    expect(downloadLink).toHaveAttribute("href", `/api/download?url=${AUDIO_URL}`);

    // jsdom cannot follow a download link; stop the navigation and keep the click handler.
    downloadLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(downloadLink);

    expect(toast).toHaveBeenCalledWith(
      "Mauritius - Islamic Finance Hub",
      expect.objectContaining({ description: "Download started. Check your download folder" })
    );
  });
});

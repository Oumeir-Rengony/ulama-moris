// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioCard } from "@/components/audio-card";

// The player has its own tests; stub it so this test only covers what the card
// itself renders.
vi.mock("@/components/audio-player", () => ({
  AudioCardPlayer: () => <div data-testid="audio-player" />,
}));
vi.mock("sonner", () => ({ toast: vi.fn() }));

type AudioCardProps = Parameters<typeof AudioCard>[0];

function renderCard(overrides: Partial<AudioCardProps> = {}) {
  const props: AudioCardProps = {
    id: "lecture-1",
    title: "Mauritius - Islamic Finance Hub",
    slug: "mauritius-islamic-finance-hub",
    description: "<p>An overview of Islamic finance.</p>",
    author: "Mufti Houzeifa Mamoojee",
    masjid: "belle rose sunnee mosque",
    duration: "24:53",
    date: "2026-10-30T00:00:00.000+04:00",
    audioSrc: "https://assets.ctfassets.net/audio.mp4",
    downloadSrc: "/api/download?url=https://assets.ctfassets.net/audio.mp4",
    category: ["Finance"] as unknown as AudioCardProps["category"],
    whatsAppLink: "whatsapp://send?text=https://ulama-moris.org/audio/mauritius-islamic-finance-hub",
    ...overrides,
  };
  return render(<AudioCard {...props} />);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("AudioCard", () => {
  it("links the title to the lecture page and shows its details", () => {
    renderCard();

    const titleLink = screen.getByRole("link", { name: "Mauritius - Islamic Finance Hub" });
    expect(titleLink).toHaveAttribute("href", "/audio/mauritius-islamic-finance-hub");
    expect(screen.getByText("Mufti Houzeifa Mamoojee")).toBeInTheDocument();
    expect(screen.getByText("Belle Rose Sunnee Mosque")).toBeInTheDocument();
    expect(screen.getByText("30 October 2026")).toBeInTheDocument();
    expect(screen.getByText("An overview of Islamic finance.")).toBeInTheDocument();
    expect(screen.getByTestId("audio-player")).toBeInTheDocument();
  });

  it("points Download and Share at the given links", () => {
    renderCard();

    expect(screen.getByRole("link", { name: /Download/ })).toHaveAttribute(
      "href",
      "/api/download?url=https://assets.ctfassets.net/audio.mp4"
    );
    expect(screen.getByRole("link", { name: /Share/ })).toHaveAttribute(
      "href",
      "whatsapp://send?text=https://ulama-moris.org/audio/mauritius-islamic-finance-hub"
    );
  });

  it("confirms with a toast when a download starts", async () => {
    const user = userEvent.setup();
    renderCard();

    const downloadLink = screen.getByRole("link", { name: /Download/ });
    // jsdom cannot follow a download link; stop the navigation and keep the click handler.
    downloadLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(downloadLink);

    expect(toast).toHaveBeenCalledWith(
      "Mauritius - Islamic Finance Hub",
      expect.objectContaining({ description: "Download started. Check your download folder" })
    );
  });

  it("shows a pill for each category", () => {
    renderCard({ category: ["Finance", "Fiqh"] as unknown as AudioCardProps["category"] });

    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("Fiqh")).toBeInTheDocument();
  });

  it("renders no header and no stray '0' when there are no categories", () => {
    renderCard({ category: [] as unknown as AudioCardProps["category"] });

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});

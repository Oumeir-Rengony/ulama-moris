// @vitest-environment jsdom
import { Suspense } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AudioList } from "@/components/audio-list";

const routerPush = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
  useSearchParams: () => currentSearchParams,
  usePathname: () => "/",
}));

// The card has its own tests; a stub keeps this test about the list.
vi.mock("@/components/audio-card", () => ({
  AudioCard: ({ title }: { title: string }) => <article>{title}</article>,
}));

function makeLectures(count: number) {
  const items = [];
  for (let index = 1; index <= count; index++) {
    items.push({
      sys: { id: `lecture-${index}` },
      title: `Lecture ${index}`,
      slug: `lecture-${index}`,
      audio: { url: "https://assets.ctfassets.net/audio.mp4", sys: { id: "asset", publishedAt: "2026-11-01" } },
    });
  }
  return items;
}

// AudioList reads its data with use(), so it renders inside <Suspense>.
async function renderList(options: { total: number; itemsOnPage: number; currentPage?: number; searchQuery?: string }) {
  const audioListPromise = Promise.resolve({ total: options.total, items: makeLectures(options.itemsOnPage) });

  // React only retries a suspended render inside an async act().
  await act(async () => {
    render(
      <Suspense fallback={<p>Loading</p>}>
        <AudioList
          audioListPromise={audioListPromise}
          currentPage={options.currentPage ?? 1}
          searchQuery={options.searchQuery ?? ""}
          region="local"
          isMobile={true}
        />
      </Suspense>
    );
  });

  await screen.findByRole("heading", { name: "Latest Lectures" });
}

afterEach(() => {
  routerPush.mockReset();
  currentSearchParams = new URLSearchParams();
});

describe("AudioList", () => {
  it("shows the active search term in the search box", async () => {
    await renderList({ total: 1, itemsOnPage: 1, searchQuery: "sabr" });

    expect(screen.getByPlaceholderText("Search lectures...")).toHaveValue("sabr");
  });

  it("shows the lectures and how many of the total are on this page", async () => {
    // The mobile page size is 6 (config.json).
    await renderList({ total: 20, itemsOnPage: 6 });

    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByText("Showing 1-6 of 20 lectures")).toBeInTheDocument();
  });

  it("hides the count and shows the empty state when nothing matches", async () => {
    await renderList({ total: 0, itemsOnPage: 0 });

    expect(screen.getByText("No lectures found")).toBeInTheDocument();
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("updates the URL with the search term after the user stops typing", async () => {
    const user = userEvent.setup();
    await renderList({ total: 1, itemsOnPage: 1 });

    await user.type(screen.getByPlaceholderText("Search lectures..."), "sabr");

    expect(routerPush).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/?search=sabr", { scroll: false });
    });
    expect(routerPush).toHaveBeenCalledTimes(1);
  });

  it("searches straight away when the user leaves the search box", async () => {
    const user = userEvent.setup();
    await renderList({ total: 1, itemsOnPage: 1 });

    await user.type(screen.getByPlaceholderText("Search lectures..."), "sabr");
    await user.tab();

    expect(routerPush).toHaveBeenCalledWith("/?search=sabr", { scroll: false });
  });

  it("goes back to page 1 when the search changes", async () => {
    currentSearchParams = new URLSearchParams("page=5");
    const user = userEvent.setup();
    await renderList({ total: 40, itemsOnPage: 6, currentPage: 5 });

    await user.type(screen.getByPlaceholderText("Search lectures..."), "sabr");
    await user.tab();

    expect(routerPush).toHaveBeenCalledWith("/?search=sabr", { scroll: false });
  });

  it("removes the search parameter when the search box is cleared", async () => {
    currentSearchParams = new URLSearchParams("search=sabr");
    const user = userEvent.setup();
    await renderList({ total: 1, itemsOnPage: 1, searchQuery: "sabr" });

    await user.clear(screen.getByPlaceholderText("Search lectures..."));
    await user.tab();

    expect(routerPush).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("goes back to page 1 when the region changes", async () => {
    currentSearchParams = new URLSearchParams("page=3");
    const user = userEvent.setup();
    await renderList({ total: 40, itemsOnPage: 6, currentPage: 3 });

    await user.click(screen.getByRole("button", { name: "Guest" }));

    expect(routerPush).toHaveBeenCalledWith("/?type=international", { scroll: false });
  });

  it("switches region through the URL, keeping other parameters", async () => {
    currentSearchParams = new URLSearchParams("search=sabr");
    const user = userEvent.setup();
    await renderList({ total: 1, itemsOnPage: 1 });

    await user.click(screen.getByRole("button", { name: "Guest" }));

    expect(routerPush).toHaveBeenCalledWith("/?search=sabr&type=international", { scroll: false });
  });

  it("goes to another page through the URL", async () => {
    const user = userEvent.setup();
    await renderList({ total: 20, itemsOnPage: 6 });

    await user.click(screen.getByRole("button", { name: "2" }));
    expect(routerPush).toHaveBeenCalledWith("/?page=2#lectures");

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(routerPush).toHaveBeenCalledWith("/?page=2#lectures");
  });

  it("disables Previous on the first page and Next on the last", async () => {
    await renderList({ total: 20, itemsOnPage: 2, currentPage: 4 });

    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("does not navigate when the current page is clicked", async () => {
    const user = userEvent.setup();
    await renderList({ total: 20, itemsOnPage: 6 });

    await user.click(screen.getByRole("button", { name: "1" }));

    expect(routerPush).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });
});

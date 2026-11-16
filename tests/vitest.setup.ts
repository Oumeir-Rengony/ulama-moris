// Adds DOM matchers such as toBeInTheDocument() to expect().
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// cacheLife() and cacheTag() throw unless they run inside a Next.js server with
// cacheComponents on. Vitest calls the services as plain functions, so the cache
// calls do nothing here. A test file can still mock "next/cache" itself.
vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/cache")>();
  return { ...actual, cacheLife: vi.fn(), cacheTag: vi.fn() };
});

const isDomTest = typeof window !== "undefined";

// jsdom has no ResizeObserver, which Radix UI components (e.g. the audio Slider)
// need. jsdom has no layout either, so an observer that never fires is enough.
const hasResizeObserver = typeof globalThis.ResizeObserver !== "undefined";
if (isDomTest && !hasResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// React Testing Library only cleans up automatically when Vitest globals are on.
// They are off here, so unmount rendered components after each DOM test.
afterEach(async () => {
  if (!isDomTest) {
    return;
  }

  const { cleanup } = await import("@testing-library/react");
  cleanup();
});

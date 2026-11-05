// Adds DOM matchers such as toBeInTheDocument() to expect().
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

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

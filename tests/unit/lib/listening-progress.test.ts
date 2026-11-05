// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CONFIG from "@/config/config.json";
import { getTrackProgress, removeProgress, saveProgress } from "@/lib/listening-progress";

const STORAGE_KEY = CONFIG.localstorageKey.audioTime;

function storedProgress(): unknown {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("listening progress", () => {
  it("returns 0 for a lecture that was never played", () => {
    expect(getTrackProgress("lecture-a")).toBe(0);
  });

  it("saves and reads back a position per lecture", () => {
    saveProgress("lecture-a", 42);
    saveProgress("lecture-b", 300);

    expect(getTrackProgress("lecture-a")).toBe(42);
    expect(getTrackProgress("lecture-b")).toBe(300);
    expect(storedProgress()).toEqual({ "lecture-a": 42, "lecture-b": 300 });
  });

  it("forgets one lecture and keeps the others", () => {
    saveProgress("lecture-a", 42);
    saveProgress("lecture-b", 300);

    removeProgress("lecture-a");

    expect(storedProgress()).toEqual({ "lecture-b": 300 });
  });

  it("treats corrupted saved data as empty and replaces it on the next save", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    expect(getTrackProgress("lecture-a")).toBe(0);

    saveProgress("lecture-a", 42);
    expect(storedProgress()).toEqual({ "lecture-a": 42 });
  });

  it("treats saved data that is valid JSON but not an object as empty", () => {
    localStorage.setItem(STORAGE_KEY, "null");
    expect(getTrackProgress("lecture-a")).toBe(0);

    localStorage.setItem(STORAGE_KEY, "[1,2]");
    expect(getTrackProgress("lecture-a")).toBe(0);
  });

  it("ignores a saved position that is not a number", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ "lecture-a": "42" }));

    expect(getTrackProgress("lecture-a")).toBe(0);
  });

  it("does not throw when the browser refuses to save (e.g. storage full or private mode)", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(() => saveProgress("lecture-a", 42)).not.toThrow();
    expect(() => removeProgress("lecture-a")).not.toThrow();
    expect(consoleWarn).toHaveBeenCalled();
  });

  it("returns 0 when the browser blocks reading storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });

    expect(getTrackProgress("lecture-a")).toBe(0);
  });
});

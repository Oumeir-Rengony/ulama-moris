import { describe, expect, it } from "vitest";
import { getPageNumbers } from "@/lib/pagination";

describe("getPageNumbers", () => {
  it("shows every page when there are 5 or fewer", () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
    expect(getPageNumbers(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("shows the first four pages near the start of a long list", () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, "...", 10]);
    expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, "...", 10]);
  });

  it("shows the last four pages near the end of a long list", () => {
    expect(getPageNumbers(8, 10)).toEqual([1, "...", 7, 8, 9, 10]);
    expect(getPageNumbers(10, 10)).toEqual([1, "...", 7, 8, 9, 10]);
  });

  it("shows the pages around the current one in the middle of a long list", () => {
    expect(getPageNumbers(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
  });

  it("switches between the start and end layouts correctly on the shortest long list", () => {
    expect(getPageNumbers(3, 6)).toEqual([1, 2, 3, 4, "...", 6]);
    expect(getPageNumbers(4, 6)).toEqual([1, "...", 3, 4, 5, 6]);
    expect(getPageNumbers(4, 7)).toEqual([1, "...", 3, 4, 5, "...", 7]);
  });

  it("shows the last pages when the current page is past the end", () => {
    expect(getPageNumbers(99, 10)).toEqual([1, "...", 7, 8, 9, 10]);
  });

  it("shows no pages when there are none", () => {
    expect(getPageNumbers(1, 0)).toEqual([]);
  });
});

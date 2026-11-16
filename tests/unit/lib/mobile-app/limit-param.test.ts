import { describe, expect, it } from "vitest";
import { parseLimitParam } from "@/lib/mobile-app/limit-param";

describe("parseLimitParam", () => {
  it("reads a positive whole number within the cap", () => {
    expect(parseLimitParam("20", 10, 50)).toBe(20);
  });

  it("caps a limit above the maximum", () => {
    expect(parseLimitParam("500", 10, 50)).toBe(50);
  });

  it("falls back to the default when missing or not a positive whole number", () => {
    expect(parseLimitParam(null, 10, 50)).toBe(10);
    expect(parseLimitParam("", 10, 50)).toBe(10);
    expect(parseLimitParam("0", 10, 50)).toBe(10);
    expect(parseLimitParam("-5", 10, 50)).toBe(10);
    expect(parseLimitParam("2.5", 10, 50)).toBe(10);
  });
});

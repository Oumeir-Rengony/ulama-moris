import { describe, expect, it } from "vitest";
import { parseDateParam, parsePageParam } from "@/lib/search-params";

describe("parsePageParam", () => {
  it("reads a positive whole page number", () => {
    expect(parsePageParam("1")).toBe(1);
    expect(parsePageParam("12")).toBe(12);
  });

  it("falls back to page 1 when the parameter is missing", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("")).toBe(1);
  });

  it("falls back to page 1 for values that are not a positive whole number", () => {
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-3")).toBe(1);
    expect(parsePageParam("2.5")).toBe(1);
    expect(parsePageParam("1e400")).toBe(1);
  });

  it("falls back to page 1 when the parameter is repeated (?page=2&page=3)", () => {
    expect(parsePageParam(["2", "3"])).toBe(1);
  });
});

describe("parseDateParam", () => {
  it("keeps a valid date", () => {
    expect(parseDateParam("2026-11-05")).toBe("2026-11-05");
  });

  it("returns an empty string for a missing, repeated or invalid date", () => {
    expect(parseDateParam(undefined)).toBe("");
    expect(parseDateParam("")).toBe("");
    expect(parseDateParam(["2026-11-05", "2026-11-06"])).toBe("");
    expect(parseDateParam("not-a-date")).toBe("");
  });

  it("rejects impossible dates instead of rolling them over", () => {
    expect(parseDateParam("2026-13-45")).toBe("");
    expect(parseDateParam("2026-02-30")).toBe("");
  });

  it("only accepts the YYYY-MM-DD format", () => {
    expect(parseDateParam("05/11/2026")).toBe("");
    expect(parseDateParam("2026-11-05T10:00:00Z")).toBe("");
  });
});

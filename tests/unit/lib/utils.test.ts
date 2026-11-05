import { describe, expect, it } from "vitest";
import {
  arrayify,
  cleanDescription,
  createQueryString,
  formatTime,
  toISODuration,
  toTitleCase,
} from "@/lib/utils";

describe("toISODuration", () => {
  it("converts MM:SS and HH:MM:SS to an ISO 8601 duration", () => {
    expect(toISODuration("24:53")).toBe("PT24M53S");
    expect(toISODuration("1:05:00")).toBe("PT1H5M");
  });

  it("writes a zero-length duration as PT0S, not the invalid PT", () => {
    expect(toISODuration("0:00")).toBe("PT0S");
    expect(toISODuration("0:00:00")).toBe("PT0S");
  });

  it("returns undefined for an empty or malformed duration instead of throwing", () => {
    expect(toISODuration("")).toBeUndefined();
    expect(toISODuration("45")).toBeUndefined();
    expect(toISODuration("1:2:3:4")).toBeUndefined();
    expect(toISODuration("ab:cd")).toBeUndefined();
  });
});

describe("formatTime", () => {
  it("formats seconds as M:SS, or H:MM:SS from one hour", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65.9)).toBe("1:05");
    expect(formatTime(3725)).toBe("1:02:05");
  });

  it("shows 0:00 for values that are not a finite number", () => {
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe("0:00");
  });
});

describe("cleanDescription", () => {
  it("treats the rich-text editor's empty paragraphs as no description", () => {
    expect(cleanDescription(undefined)).toBe("");
    expect(cleanDescription("<p></p>")).toBe("");
    expect(cleanDescription("<p><br></p>")).toBe("");
  });

  it("treats paragraphs with only spaces, line breaks or &nbsp; as no description", () => {
    expect(cleanDescription("<p> </p>")).toBe("");
    expect(cleanDescription("<p><br/></p>")).toBe("");
    expect(cleanDescription("<p><br /></p>")).toBe("");
    expect(cleanDescription("<p>&nbsp;</p><p></p>")).toBe("");
  });

  it("keeps a real description unchanged", () => {
    expect(cleanDescription("<p>On patience</p>")).toBe("<p>On patience</p>");
  });
});

describe("createQueryString", () => {
  it("sets and replaces values while keeping other parameters", () => {
    const current = new URLSearchParams("page=2&type=local");

    expect(createQueryString(current, { page: "3", search: "sabr" })).toBe("page=3&type=local&search=sabr");
  });

  it("removes a parameter whose new value is null", () => {
    const current = new URLSearchParams("page=2&search=sabr");

    expect(createQueryString(current, { search: null })).toBe("page=2");
  });
});

describe("arrayify", () => {
  it("wraps a single string and keeps only the strings of an array", () => {
    expect(arrayify("Fiqh")).toEqual(["Fiqh"]);
    expect(arrayify(["Fiqh", 3 as unknown as string, "Seerah"])).toEqual(["Fiqh", "Seerah"]);
  });

  it("returns an empty array for missing input", () => {
    expect(arrayify(undefined)).toEqual([]);
    expect(arrayify("")).toEqual([]);
  });
});

describe("toTitleCase", () => {
  it("capitalises the first letter of each word", () => {
    expect(toTitleCase("MASJID al qiblah")).toBe("Masjid Al Qiblah");
  });

  it("returns empty input unchanged", () => {
    expect(toTitleCase("")).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import { getOgTitleFontSize } from "@/lib/og/title-font-size";

function titleOfLength(length: number): string {
  return "a".repeat(length);
}

describe("getOgTitleFontSize", () => {
  it("steps the font size down as the title gets longer", () => {
    expect(getOgTitleFontSize(titleOfLength(60))).toBe(72);
    expect(getOgTitleFontSize(titleOfLength(61))).toBe(60);

    expect(getOgTitleFontSize(titleOfLength(100))).toBe(60);
    expect(getOgTitleFontSize(titleOfLength(101))).toBe(48);

    expect(getOgTitleFontSize(titleOfLength(160))).toBe(48);
    expect(getOgTitleFontSize(titleOfLength(161))).toBe(40);

    expect(getOgTitleFontSize(titleOfLength(240))).toBe(40);
    expect(getOgTitleFontSize(titleOfLength(241))).toBe(36);
  });
});

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import CONFIG from "@/config/config.json";

dayjs.extend(customParseFormat);

// Helpers for reading URL query parameters on pages. A parameter can be missing,
// repeated (?page=1&page=2 arrives as an array) or typed by hand, so each helper
// falls back to a safe default instead of passing bad input on to Contentful.

type SearchParamValue = string | string[] | undefined;

// A positive whole page number, or 1.
export function parsePageParam(value: SearchParamValue): number {
  if (typeof value !== "string") {
    return 1;
  }

  const requestedPage = Number(value);
  const isValidPage = Number.isSafeInteger(requestedPage) && requestedPage > 0;
  if (!isValidPage) {
    return 1;
  }

  return requestedPage;
}

// The date exactly as given when it is a real YYYY-MM-DD date, or "" for no date filter.
// Parsing is strict: dayjs on its own would turn "2026-13-45" into 14 Feb 2027.
export function parseDateParam(value: SearchParamValue): string {
  if (typeof value !== "string" || value === "") {
    return "";
  }

  const isStrictlyValid = dayjs(value, CONFIG.filter.calendarFormat, true).isValid();
  if (!isStrictlyValid) {
    return "";
  }

  return value;
}

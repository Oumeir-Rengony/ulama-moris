// A positive whole number of items per page, capped at `maxLimit`, or `defaultLimit`.
// The cap keeps one request from asking Contentful for the whole library.
export function parseLimitParam(value: string | null, defaultLimit: number, maxLimit: number): number {
  if (value === null) {
    return defaultLimit;
  }

  const requestedLimit = Number(value);
  const isValidLimit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0;
  if (!isValidLimit) {
    return defaultLimit;
  }

  if (requestedLimit > maxLimit) {
    return maxLimit;
  }

  return requestedLimit;
}

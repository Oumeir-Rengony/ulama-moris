import { expect, test, type Locator } from "@playwright/test";

// Plays real audio from Contentful in a real browser.

// The card shows "elapsed / total"; the elapsed time is the first M:SS value.
function elapsedTime(card: Locator): Locator {
  return card.locator("span").filter({ hasText: /^\d+:\d{2}(:\d{2})?$/ }).first();
}

function toSeconds(time: string): number {
  const parts = time.split(":").map(Number);
  let seconds = 0;
  for (const part of parts) {
    seconds = seconds * 60 + part;
  }
  return seconds;
}

test("a lecture plays, pauses and resumes where it stopped", async ({ page }) => {
  await page.goto("/");
  const card = page.locator("#audio-list article").first();
  await expect(card).toBeVisible();

  await card.getByRole("button", { name: "Play" }).click();
  await expect(card.getByRole("button", { name: "Pause" })).toBeVisible();
  // Playback has started once the elapsed time moves past 0:02.
  await expect(async () => {
    const seconds = toSeconds(await elapsedTime(card).innerText());
    expect(seconds).toBeGreaterThanOrEqual(2);
  }).toPass({ timeout: 30_000 });

  await card.getByRole("button", { name: "Pause" }).click();
  await expect(card.getByRole("button", { name: "Play" })).toBeVisible();
  const pausedAt = toSeconds(await elapsedTime(card).innerText());

  await card.getByRole("button", { name: "Play" }).click();
  await expect(card.getByRole("button", { name: "Pause" })).toBeVisible();
  const resumedAt = toSeconds(await elapsedTime(card).innerText());

  expect(resumedAt).toBeGreaterThanOrEqual(pausedAt);
});

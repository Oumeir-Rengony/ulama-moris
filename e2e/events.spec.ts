import { expect, test } from "@playwright/test";

test("the events page lists events by year and opens one", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByRole("heading", { level: 1, name: "Events" })).toBeVisible();

  // Each year heading is an h2, e.g. "2026" (or "Other events" for undated ones).
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(/^(\d{4}|Other events)$/);

  const firstEvent = page.locator("main ul li a").first();
  const eventTitle = (await firstEvent.getByRole("heading").innerText()).trim();
  await firstEvent.click();

  await expect(page).toHaveURL(/\/events\/[^/?#]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(eventTitle);
  await expect(page.getByRole("heading", { name: "Lectures from this event" })).toBeVisible();
  await expect(page.locator("main article").first()).toBeVisible();
});

test("event lecture pages can be paged through when there is more than one", async ({ page }) => {
  await page.goto("/events");
  const eventLinks = page.locator("main ul li a");
  const eventCount = await eventLinks.count();

  // Find an event with enough lectures to have a second page.
  for (let index = 0; index < eventCount; index++) {
    const lectureCountText = await eventLinks.nth(index).getByText(/^\d+ lectures?$/).innerText();
    const lectureCount = Number.parseInt(lectureCountText, 10);
    if (lectureCount <= 8) {
      continue;
    }

    await eventLinks.nth(index).click();
    await page.getByRole("link", { name: "Next" }).click();

    await expect(page).toHaveURL(/[?&]page=2/);
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();
    await expect(page.locator("main article").first()).toBeVisible();
    return;
  }

  test.skip(true, "No event currently has more than one page of lectures");
});

test("an unknown event returns 404", async ({ page }) => {
  const response = await page.goto("/events/e2e-event-that-does-not-exist");

  expect(response?.status()).toBe(404);
});

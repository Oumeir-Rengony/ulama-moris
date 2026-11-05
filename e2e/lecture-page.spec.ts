import { expect, test } from "@playwright/test";

test("opening a lecture shows its page, player and more lectures", async ({ page }) => {
  await page.goto("/");
  const card = page.locator("#audio-list article").first();
  const cardTitle = (await card.getByRole("heading").innerText()).trim();

  // exact: the Download and Share links also include the title, for screen readers.
  await card.getByRole("link", { name: cardTitle, exact: true }).click();

  await expect(page).toHaveURL(/\/audio\/[^/?#]+$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(cardTitle);
  await expect(page.getByText("Now Playing")).toBeVisible();
  await expect(page.getByRole("button", { name: "Play" })).toBeVisible();

  const moreLectures = page.locator("section", { has: page.getByRole("heading", { name: "More Lectures" }) });
  await expect(moreLectures.getByRole("link").first()).toBeVisible();
});

test("a lecture page has a PNG social preview image", async ({ page, request }) => {
  await page.goto("/");
  const firstLectureHref = await page.locator("#audio-list article h3").first().locator("..").getAttribute("href");
  await page.goto(firstLectureHref!);

  const imageUrl = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(imageUrl).toBeTruthy();

  // The tag holds the production URL; fetch the same path from the server under test.
  const imagePath = new URL(imageUrl!).pathname + new URL(imageUrl!).search;
  const response = await request.get(imagePath);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("an unknown lecture shows a not-found message", async ({ page }) => {
  await page.goto("/audio/e2e-lecture-that-does-not-exist");

  await expect(page.getByRole("heading", { name: "Audio Not Found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible();
});

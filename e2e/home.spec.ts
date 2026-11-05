import { expect, test, type Page } from "@playwright/test";

// Lectures come from live Contentful, so these tests check structure and
// behaviour, never a specific lecture title.

async function openHome(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: "Latest Lectures" })).toBeVisible();
}

function lectureCards(page: Page) {
  return page.locator("#audio-list article");
}

// A word from the first card's title that is long enough to search for.
async function pickSearchTerm(page: Page): Promise<string> {
  const firstTitle = await lectureCards(page).first().getByRole("heading").innerText();
  const words = firstTitle.split(/\s+/);

  for (const word of words) {
    const lettersOnly = word.replace(/[^\p{L}]/gu, "");
    if (lettersOnly.length >= 4) {
      return lettersOnly;
    }
  }
  return words[0];
}

test("home page lists lectures", async ({ page }) => {
  await openHome(page);

  await expect(lectureCards(page).first()).toBeVisible();
  await expect(page.getByText(/^Showing \d+-\d+ of \d+ lectures$/)).toBeVisible();
});

test("search filters the list through the URL and survives a reload", async ({ page }) => {
  await openHome(page);
  const searchTerm = await pickSearchTerm(page);
  const searchBox = page.getByPlaceholder("Search lectures...");

  await searchBox.fill(searchTerm);
  await expect(page).toHaveURL(new RegExp(`[?&]search=${encodeURIComponent(searchTerm)}`));
  // The term comes from a lecture title, so at least that lecture matches.
  await expect(lectureCards(page).first()).toBeVisible();

  await page.reload();
  await expect(searchBox).toHaveValue(searchTerm);
});

test("a search with no matches shows the empty state", async ({ page }) => {
  await openHome(page, "/?search=zzqx-no-such-lecture");

  await expect(page.getByText("No lectures found")).toBeVisible();
  await expect(page.getByText(/^Showing/)).toHaveCount(0);
});

test("region tabs switch the list through the URL", async ({ page }) => {
  await openHome(page);

  await page.getByRole("button", { name: "Guest" }).click();

  await expect(page).toHaveURL(/[?&]type=international/);
  const listOrEmptyState = lectureCards(page).first().or(page.getByText("No lectures found"));
  await expect(listOrEmptyState).toBeVisible();
});

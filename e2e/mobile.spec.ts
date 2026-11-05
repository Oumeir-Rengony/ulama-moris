import { expect, test, type Page } from "@playwright/test";

// Runs in the "mobile" project (Pixel 7), where the desktop navigation is hidden.

// Header links are plain <a> tags, so each one loads a new page. A click on the
// menu button before React has hydrated that page does nothing (most likely on a
// dev server's first compile), so keep clicking until the menu is really open.
async function openMobileMenu(page: Page) {
  // exact: lecture titles on the page can contain words like "about".
  const aboutLinkInMenu = visibleNavLink(page, "About");

  await expect(async () => {
    // Only click while the menu is closed; a second click would close it again.
    const isMenuOpen = await aboutLinkInMenu.isVisible();
    if (!isMenuOpen) {
      await page.getByRole("button", { name: "Toggle menu" }).click();
    }
    await expect(aboutLinkInMenu).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
}

// The desktop navigation is hidden on a phone, so the visible link is the menu's.
function visibleNavLink(page: Page, name: string) {
  return page.getByRole("link", { name, exact: true }).filter({ visible: true });
}

test("the mobile menu navigates to Events and About", async ({ page }) => {
  await page.goto("/");

  await openMobileMenu(page);
  await visibleNavLink(page, "Events").click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole("heading", { level: 1, name: "Events" })).toBeVisible();

  await openMobileMenu(page);
  await visibleNavLink(page, "About").click();
  await expect(page).toHaveURL(/\/about$/);
});

import { expect, test } from "@playwright/test";

test("the About page shows its sections and a way to get in touch", async ({ page }) => {
  await page.goto("/about");

  await expect(page.getByRole("heading", { level: 1, name: "About Ulama Moris" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Our Mission" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Our Values" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Get in Touch" })).toBeVisible();

  for (const value of ["Authenticity", "Accessibility", "Community"]) {
    await expect(page.getByRole("heading", { level: 3, name: value })).toBeVisible();
  }

  await expect(page.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
    "href",
    "mailto:ulama.moris@gmail.com"
  );
});

test("the About link in the header is marked as the current page", async ({ page }) => {
  await page.goto("/about");

  const navigation = page.getByRole("banner").getByRole("navigation");
  await expect(navigation.getByRole("link", { name: "About", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "Home", exact: true })).not.toHaveAttribute("aria-current", "page");
});

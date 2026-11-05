import { expect, test } from "@playwright/test";

test("a lecture downloads through /api/download as an attachment", async ({ page }) => {
  await page.goto("/");
  const downloadLink = page.locator("#audio-list article").first().getByRole("link", { name: /Download/ });
  const href = await downloadLink.getAttribute("href");

  expect(href).toMatch(/^\/api\/download\?url=https:\/\/[^/]*ctfassets\.net\//);

  // Read only the response headers, then stop: lecture files are tens of megabytes.
  const response = await page.evaluate(async (downloadHref) => {
    const controller = new AbortController();
    const result = await fetch(downloadHref, { signal: controller.signal });
    const headers = {
      status: result.status,
      contentDisposition: result.headers.get("content-disposition"),
    };
    controller.abort();
    return headers;
  }, href!);

  expect(response.status).toBe(200);
  expect(response.contentDisposition).toMatch(/^attachment; filename=".+"$/);
});

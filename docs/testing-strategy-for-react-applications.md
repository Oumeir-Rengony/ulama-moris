# Testing Strategy for React Applications

Nov 3, 2026 · @oumeir

## Categories of testing

Four levels of testing cover a React application, each wider in scope than the last: unit, component, integration, and end-to-end (E2E).

| Level | Scope | What it tests | Example | Typical tools |
|---|---|---|---|---|
| 1. Unit | Smallest: one function | An individual function, utility, or piece of business logic in isolation | A function that calculates an order's total price, or decides whether a user can approve a request | Vitest |
| 2. Component | UI behavior of one component | A React component's rendering, user interactions, validation, and visible states, with its dependencies stubbed | A form shows a validation message when the user submits an empty required field | Vitest + React Testing Library |
| 3. Integration | Multiple connected parts | Whether components, hooks, state management, and API calls work together in a page or feature, mocking only the outer boundary | A reviewer opens a request, changes its status, submits it, and sees the updated status | Vitest + React Testing Library, with a mocked API (vi.mock or Mock Service Worker) |
| 4. End-to-end | The full system | Complete user flows in a real browser: routing, network requests, and potentially the real backend and database | A user logs in, creates an approval request, and sees it listed on the dashboard | Playwright |

Component and integration tests run in a simulated DOM (jsdom or happy-dom). It has no real layout, CSS, or browser navigation, which is why E2E tests are still needed.

## The same feature tested at four levels

Take a React approval form with a Title field and a Submit button. Each level asks a different question about it.

### Unit test (Vitest)

Does the validation function reject an empty request title? No browser or rendered UI is required.

```ts
import { expect, test } from "vitest";
import { validateTitle } from "./validateTitle";

test("rejects an empty title", () => {
  expect(validateTitle("")).toBe(false);
  expect(validateTitle("New hire")).toBe(true);
});
```

### Component test (Vitest + React Testing Library)

Does the form show an error when the user submits without a title? The component renders in a simulated DOM.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApprovalForm } from "./ApprovalForm";

test("shows an error when the title is empty", async () => {
  const user = userEvent.setup();
  render(<ApprovalForm />);

  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(screen.getByText(/title is required/i)).toBeInTheDocument();
});
```

### Integration test (Vitest + React Testing Library, mocked API)

Does submitting a valid form call the API, update the UI, and show a success message? The whole page renders with real hooks and state; only the API module is mocked.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import * as api from "../api/requests";
import { ApprovalPage } from "./ApprovalPage";

vi.mock("../api/requests");

test("submits a valid request and shows a success message", async () => {
  vi.mocked(api.createRequest).mockResolvedValue({
    id: "42",
    title: "New hire",
    status: "pending",
  });

  const user = userEvent.setup();
  render(<ApprovalPage />);

  await user.type(screen.getByLabelText(/title/i), "New hire");
  await user.click(screen.getByRole("button", { name: /submit/i }));

  expect(api.createRequest).toHaveBeenCalledWith({ title: "New hire" });
  expect(await screen.findByText(/request submitted/i)).toBeInTheDocument();
});
```

To mock at the network level instead, use Mock Service Worker (MSW). The app's real fetch code then runs, which brings the test closer to production behavior.

### End-to-end test (Playwright)

Can a real user open the app, fill in the form, submit it, and see the saved request on the next page? This exercises the browser, routing, and potentially the real backend and database.

```ts
import { test, expect } from "@playwright/test";

test("user submits a new request and sees it saved", async ({ page }) => {
  await page.goto("/requests/new");

  await page.getByLabel("Title").fill("New hire");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByText("Request submitted")).toBeVisible();
  await expect(page).toHaveURL(/\/requests\/\d+/);
  await expect(page.getByRole("heading", { name: "New hire" })).toBeVisible();
});
```

The last two assertions confirm what only an E2E test can: the browser navigated to the saved request's page, and the data persisted through the backend.

## Choosing the right level

Test logic in isolation, test UI behavior at the component level, check connected parts with integration tests, and use a real browser to verify the whole application works together.

The key difference between levels is the scope of what you verify, and each catches a different class of bug:

- **Unit:** wrong calculations, edge cases, and broken business rules.
- **Component:** missing error messages, wrong visible states, and broken interactions.
- **Integration:** wiring mistakes between hooks, state, and API calls.
- **End-to-end:** routing, real network, backend, database, and browser-specific problems.

A rule of thumb separates component from integration tests, since both use the same tools. A component test renders one component with its dependencies stubbed or absent. An integration test renders a page or feature with real hooks, state, and context, mocking only the outer boundary such as the API.

You don't need to test every feature at all four levels. Prioritize tests that give distinct coverage rather than repeating the same assertions everywhere. Keep E2E tests to the critical user journeys, because they are the slowest and most brittle to maintain.

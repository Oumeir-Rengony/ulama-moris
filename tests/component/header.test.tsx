// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/header";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const mockedUsePathname = vi.mocked(usePathname);

// Before the mobile menu opens, each link appears once (the desktop navigation).
function getCurrentPageLinkNames(): string[] {
  const currentLinks = screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page");

  const names: string[] = [];
  for (const link of currentLinks) {
    names.push(link.textContent?.trim() ?? "");
  }
  return names;
}

describe("Header", () => {
  it.each([
    { pathname: "/", currentLink: "Home" },
    { pathname: "/audio/some-lecture", currentLink: "Home" },
    { pathname: "/events", currentLink: "Events" },
    { pathname: "/events/seerah-week", currentLink: "Events" },
    { pathname: "/about", currentLink: "About" },
  ])("marks $currentLink as the current page on $pathname", ({ pathname, currentLink }) => {
    mockedUsePathname.mockReturnValue(pathname);

    render(<Header />);

    expect(getCurrentPageLinkNames()).toEqual([currentLink]);
  });

  it("marks no link as current on a page outside the navigation", () => {
    mockedUsePathname.mockReturnValue("/articles");

    render(<Header />);

    expect(getCurrentPageLinkNames()).toEqual([]);
  });

  it("opens and closes the mobile menu", async () => {
    mockedUsePathname.mockReturnValue("/");
    const user = userEvent.setup();
    render(<Header />);

    expect(screen.getAllByRole("link", { name: "About" })).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getAllByRole("link", { name: "About" })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(screen.getAllByRole("link", { name: "About" })).toHaveLength(1);
  });
});

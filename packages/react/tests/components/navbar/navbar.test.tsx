import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {describe, expect, it} from "vitest";

import {Navbar} from "@/components/navbar";

describe("Navbar", () => {
  it("toggles the responsive menu with an accessible button", async () => {
    const user = setupUser();

    render(
      <Navbar>
        <Navbar.Brand>Acme</Navbar.Brand>
        <Navbar.MenuToggle />
        <Navbar.Menu>
          <Navbar.MenuItem>
            <a href="/docs">Docs</a>
          </Navbar.MenuItem>
        </Navbar.Menu>
      </Navbar>,
    );

    const toggle = screen.getByRole("button", {name: "Toggle navigation menu"});
    const menu = document.querySelector('[data-slot="navbar-menu"]') as HTMLUListElement;

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", menu.id);

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(menu).toHaveAttribute("data-slot", "navbar-menu");
  });

  it("renders content without a mobile-only hidden state", () => {
    render(
      <Navbar>
        <Navbar.Content data-testid="navbar-content">Links</Navbar.Content>
      </Navbar>,
    );

    const content = screen.getByTestId("navbar-content");

    expect(content).toBeVisible();
  });

  it("exposes the frosted variant on the root", () => {
    render(
      <Navbar variant="blur">
        <Navbar.Brand>Acme</Navbar.Brand>
      </Navbar>,
    );

    expect(screen.getByRole("navigation")).toHaveAttribute("data-variant", "blur");
  });

  it("publishes its rendered height as --navbar-height", () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");

    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get: () => 64,
    });

    const {unmount} = render(
      <Navbar>
        <Navbar.Brand>Acme</Navbar.Brand>
      </Navbar>,
    );

    expect(document.documentElement.style.getPropertyValue("--navbar-height")).toBe("64px");

    unmount();

    expect(document.documentElement.style.getPropertyValue("--navbar-height")).toBe("");

    if (original) Object.defineProperty(HTMLElement.prototype, "offsetHeight", original);
  });
});

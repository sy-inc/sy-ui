import {render, screen, setupUser} from "@sy-ui/testing/helpers";
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
});

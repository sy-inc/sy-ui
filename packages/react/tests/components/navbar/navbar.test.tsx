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

  it("supports blurred and bordered variants", () => {
    const {rerender} = render(<Navbar data-testid="navbar" />);
    const navbar = screen.getByTestId("navbar");

    expect(navbar).toHaveClass("navbar--blurred");
    expect(navbar).not.toHaveClass("navbar--bordered");

    rerender(<Navbar isBordered data-testid="navbar" isBlurred={false} />);

    expect(navbar).toHaveClass("navbar--opaque", "navbar--bordered");
    expect(navbar).not.toHaveClass("navbar--blurred");
  });

  it("supports sticky and static positioning", () => {
    const {rerender} = render(<Navbar data-testid="navbar" />);
    const navbar = screen.getByTestId("navbar");

    expect(navbar).toHaveClass("navbar--sticky");

    rerender(<Navbar data-testid="navbar" position="static" />);

    expect(navbar).toHaveClass("navbar--static");
    expect(navbar).not.toHaveClass("navbar--sticky");
  });
});

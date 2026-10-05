import type {BottomBarProps} from "@/components/bottom-bar";
import type {AnchorHTMLAttributes, Ref} from "react";

import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {BottomBar} from "@/components/bottom-bar";
import {RouterProvider} from "@/components/rac";

interface TestBottomBarProps extends Omit<BottomBarProps, "children"> {
  currentHref?: string;
}

const TestBottomBar = ({currentHref = "/home", ...props}: TestBottomBarProps) => (
  <BottomBar aria-label="Primary navigation" {...props}>
    {["/home", "/activity", "/profile"].map((href) => (
      <BottomBar.Item key={href} href={href} isActive={href === currentHref}>
        {href.slice(1)}
      </BottomBar.Item>
    ))}
  </BottomBar>
);

describe("BottomBar", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("renders a navigation landmark with a list of links", async () => {
    render(<TestBottomBar />);

    const navigation = screen.getByRole("navigation", {name: "Primary navigation"});

    expect(navigation).toHaveClass("bottom-bar", "bottom-bar--fixed");
    expect(screen.getByRole("list")).toHaveClass("bottom-bar__list");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("marks only the active destination as the current page", async () => {
    const view = render(<TestBottomBar currentHref="/home" />);
    const home = screen.getByRole("link", {name: "home"});
    const profile = screen.getByRole("link", {name: "profile"});

    expect(home).toHaveAttribute("aria-current", "page");
    expect(home).toHaveAttribute("data-active", "true");
    expect(profile).not.toHaveAttribute("aria-current");

    view.rerender(<TestBottomBar currentHref="/profile" />);

    expect(home).not.toHaveAttribute("aria-current");
    expect(profile).toHaveAttribute("aria-current", "page");
  });

  it("supports no active destination and keeps every item reachable by Tab", async () => {
    render(<TestBottomBar currentHref="/settings" />);

    const links = screen.getAllByRole("link");

    for (const link of links) expect(link).not.toHaveAttribute("aria-current");
    expect(document.querySelector('[data-slot="bottom-bar-indicator"]')).not.toBeInTheDocument();

    for (const link of links) {
      await user.tab();
      expect(link).toHaveFocus();
    }
  });

  it("navigates through the client router", async () => {
    const navigate = vi.fn();

    render(
      <RouterProvider navigate={navigate}>
        <TestBottomBar />
      </RouterProvider>,
    );

    await user.click(screen.getByRole("link", {name: "profile"}));

    expect(navigate).toHaveBeenCalledWith("/profile", undefined);
  });

  it("renders button items for in-page views", async () => {
    const onPress = vi.fn();

    render(
      <BottomBar aria-label="Views">
        <BottomBar.Item isActive>Inbox</BottomBar.Item>
        <BottomBar.Item onPress={onPress}>Archive</BottomBar.Item>
      </BottomBar>,
    );

    expect(screen.getByRole("button", {name: "Inbox"})).toHaveAttribute("aria-current", "true");

    await user.click(screen.getByRole("button", {name: "Archive"}));

    expect(onPress).toHaveBeenCalledOnce();
  });

  it("supports color selection without rendering a sliding indicator", async () => {
    render(<TestBottomBar selectionStyle="color" />);

    expect(screen.getByRole("navigation")).toHaveClass("bottom-bar--color");
    expect(document.querySelector('[data-slot="bottom-bar-indicator"]')).not.toBeInTheDocument();
  });

  it("exposes render props and composes children", async () => {
    render(
      <BottomBar aria-label="Primary navigation">
        <BottomBar.Item isActive className="route-current" href="/home">
          {({isActive}) => <BottomBar.Label>{isActive ? "Current Home" : "Home"}</BottomBar.Label>}
        </BottomBar.Item>
      </BottomBar>,
    );

    const home = screen.getByRole("link", {name: "Current Home"});

    expect(home).toHaveClass("bottom-bar__link", "route-current");
    expect(home).toHaveAttribute("data-slot", "bottom-bar-link");
  });

  it("blocks disabled destinations", async () => {
    const onPress = vi.fn();

    render(
      <BottomBar aria-label="Primary navigation">
        <BottomBar.Item isDisabled href="/profile" onPress={onPress}>
          Profile
        </BottomBar.Item>
      </BottomBar>,
    );

    const profile = screen.getByRole("link", {name: "Profile"});

    expect(profile).toHaveAttribute("aria-disabled", "true");
    expect(profile).toHaveAttribute("data-disabled", "true");
    await user.click(profile);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("keeps labels accessible and decorative icons hidden", async () => {
    render(
      <BottomBar aria-label="Primary navigation">
        <BottomBar.Item isActive href="/home">
          <BottomBar.Icon>
            <svg data-testid="home-icon" />
          </BottomBar.Icon>
          <BottomBar.Label>Home dashboard</BottomBar.Label>
        </BottomBar.Item>
      </BottomBar>,
    );

    expect(screen.getByRole("link", {name: "Home dashboard"})).toBeInTheDocument();
    expect(screen.getByTestId("home-icon").parentElement).toHaveAttribute("aria-hidden", "true");

    const indicator = document.querySelector('[data-slot="bottom-bar-indicator"]');

    expect(indicator).toHaveClass("bottom-bar__indicator");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards render adapters and refs", async () => {
    const itemRef = createRef<HTMLAnchorElement>();
    const rootRef = createRef<HTMLElement>();

    render(
      <BottomBar
        ref={rootRef}
        aria-label="Primary navigation"
        render={(props) => <nav {...props} data-router-nav="true" />}
      >
        <BottomBar.Item
          ref={itemRef}
          href="/home"
          render={({children, ref, ...props}) => (
            <a
              {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
              ref={ref as Ref<HTMLAnchorElement>}
              data-router-link="true"
            >
              {children}
            </a>
          )}
        >
          Home
        </BottomBar.Item>
      </BottomBar>,
    );

    expect(rootRef.current).toHaveAttribute("data-router-nav", "true");
    expect(itemRef.current).toHaveAttribute("data-router-link", "true");
    expect(itemRef.current).toHaveAttribute("href", "/home");
  });

  it("supports explicit sticky and fixed positioning variants", async () => {
    const view = render(<TestBottomBar position="sticky" />);
    const navigation = screen.getByRole("navigation");

    expect(navigation).toHaveClass("bottom-bar--sticky");

    view.rerender(<TestBottomBar position="fixed" />);

    expect(navigation).toHaveClass("bottom-bar--fixed");
  });
});

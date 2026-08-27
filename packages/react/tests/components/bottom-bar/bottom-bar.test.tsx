import type {BottomBarProps} from "@/components/bottom-bar";
import type {AnchorHTMLAttributes, ReactElement, Ref} from "react";

import {act, render, screen, setupUser} from "@sy-ui/testing/helpers";
import {createRef} from "react";

import {BottomBar} from "@/components/bottom-bar";

interface TestBottomBarProps extends Omit<BottomBarProps, "children"> {
  currentKey?: string;
}

const TestBottomBar = ({currentKey = "#home", ...props}: TestBottomBarProps) => (
  <BottomBar aria-label="Primary navigation" selectedKey={currentKey} {...props}>
    <BottomBar.Item id="#home">Home</BottomBar.Item>
    <BottomBar.Item id="#activity">Activity</BottomBar.Item>
    <BottomBar.Item id="#profile">Profile</BottomBar.Item>
  </BottomBar>
);

const renderBottomBar = async (ui: ReactElement) => {
  const result = render(ui);

  await act(async () => {
    await Promise.resolve();
  });

  return result;
};

describe("BottomBar", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("composes Tabs with navigation and tab semantics", async () => {
    await renderBottomBar(<TestBottomBar />);

    const navigation = screen.getByRole("navigation", {name: "Primary navigation"});
    const tabList = screen.getByRole("tablist", {name: "Primary navigation"});
    const tabs = screen.getAllByRole("tab");

    expect(navigation).toHaveClass("tabs", "bottom-bar", "bottom-bar--fixed");
    expect(tabList).toHaveAttribute("data-slot", "tabs-list");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).not.toHaveAttribute("href");
    expect(tabs[0]).toHaveAttribute("data-slot", "tabs-tab");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("takes selected state from the owner", async () => {
    const view = await renderBottomBar(<TestBottomBar currentKey="#home" />);
    const home = screen.getByRole("tab", {name: "Home"});
    const profile = screen.getByRole("tab", {name: "Profile"});

    expect(home).toHaveAttribute("aria-selected", "true");
    expect(home).toHaveAttribute("data-selected", "true");
    expect(profile).toHaveAttribute("aria-selected", "false");

    await user.click(profile);
    expect(home).toHaveAttribute("aria-selected", "true");

    await act(async () => {
      view.rerender(<TestBottomBar currentKey="#profile" />);
      await Promise.resolve();
    });

    expect(home).toHaveAttribute("aria-selected", "false");
    expect(profile).toHaveAttribute("aria-selected", "true");
  });

  it("keeps item activation inside the component without URL navigation", async () => {
    await renderBottomBar(
      <BottomBar aria-label="Primary navigation" defaultSelectedKey="#home">
        <BottomBar.Item id="#home">Home</BottomBar.Item>
        <BottomBar.Item id="#profile">Profile</BottomBar.Item>
      </BottomBar>,
    );

    const profile = screen.getByRole("tab", {name: "Profile"});
    const urlBeforeClick = window.location.href;

    expect(profile).not.toHaveAttribute("href");

    await user.click(profile);

    expect(window.location.href).toBe(urlBeforeClick);
    expect(profile).toHaveAttribute("aria-selected", "true");
  });

  it("supports color selection without rendering a sliding indicator", async () => {
    await renderBottomBar(
      <BottomBar aria-label="Primary navigation" defaultSelectedKey="#home" selectionStyle="color">
        <BottomBar.Item id="#home">Home</BottomBar.Item>
        <BottomBar.Item id="#profile">Profile</BottomBar.Item>
      </BottomBar>,
    );

    expect(screen.getByRole("navigation")).toHaveClass("bottom-bar--color");
    expect(document.querySelector('[data-slot="tabs-indicator"]')).not.toBeInTheDocument();
  });

  it("exposes Tabs render props and composes children", async () => {
    await renderBottomBar(
      <BottomBar aria-label="Primary navigation" defaultSelectedKey="#home">
        <BottomBar.Item className="route-current" id="#home">
          {({isSelected}) => (
            <BottomBar.Label>{isSelected ? "Current Home" : "Home"}</BottomBar.Label>
          )}
        </BottomBar.Item>
      </BottomBar>,
    );

    const home = screen.getByRole("tab", {name: "Current Home"});

    expect(home).toHaveClass("bottom-bar__link", "route-current");
    expect(home).toHaveAttribute("data-slot", "tabs-tab");
  });

  it("blocks disabled destinations", async () => {
    const onPress = vi.fn();

    await renderBottomBar(
      <BottomBar aria-label="Primary navigation">
        <BottomBar.Item isDisabled id="#profile" onPress={onPress}>
          Profile
        </BottomBar.Item>
      </BottomBar>,
    );

    const profile = screen.getByRole("tab", {name: "Profile"});

    expect(profile).toHaveAttribute("aria-disabled", "true");
    expect(profile).toHaveAttribute("data-disabled", "true");
    await user.click(profile);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("uses Tabs roving focus behavior", async () => {
    await renderBottomBar(
      <BottomBar aria-label="Primary navigation" defaultSelectedKey="#home">
        <BottomBar.Item id="#home">Home</BottomBar.Item>
        <BottomBar.Item id="#profile">Profile</BottomBar.Item>
      </BottomBar>,
    );

    const home = screen.getByRole("tab", {name: "Home"});
    const profile = screen.getByRole("tab", {name: "Profile"});

    await user.tab();
    expect(home).toHaveFocus();
    expect(home).toHaveAttribute("data-focus-visible", "true");

    await user.keyboard("{ArrowRight}");
    expect(profile).toHaveFocus();
    expect(profile).toHaveAttribute("aria-selected", "true");
  });

  it("keeps labels accessible and decorative icons hidden", async () => {
    await renderBottomBar(
      <BottomBar aria-label="Primary navigation" defaultSelectedKey="#home">
        <BottomBar.Item id="#home">
          <BottomBar.Icon>
            <svg data-testid="home-icon" />
          </BottomBar.Icon>
          <BottomBar.Label>Home dashboard</BottomBar.Label>
        </BottomBar.Item>
      </BottomBar>,
    );

    expect(screen.getByRole("tab", {name: "Home dashboard"})).toBeInTheDocument();
    expect(screen.getByTestId("home-icon").parentElement).toHaveAttribute("aria-hidden", "true");

    const indicator = document.querySelector('[data-slot="tabs-indicator"]');

    expect(indicator).toHaveClass("bottom-bar__indicator");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards Tabs render adapters and refs", async () => {
    const tabRef = createRef<HTMLDivElement>();
    const rootRef = createRef<HTMLDivElement>();

    await renderBottomBar(
      <BottomBar
        ref={rootRef}
        aria-label="Primary navigation"
        render={(props) => <div {...props} data-router-tabs="true" />}
      >
        <BottomBar.Item
          ref={tabRef}
          id="#home"
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

    expect(rootRef.current).toHaveAttribute("data-router-tabs", "true");
    expect(tabRef.current).toHaveAttribute("data-router-link", "true");
    expect(tabRef.current).not.toHaveAttribute("href");
  });

  it("supports explicit sticky and fixed positioning variants", async () => {
    const view = await renderBottomBar(<TestBottomBar position="sticky" />);
    const navigation = screen.getByRole("navigation");

    expect(navigation).toHaveClass("bottom-bar--sticky");

    await act(async () => {
      view.rerender(<TestBottomBar position="fixed" />);
      await Promise.resolve();
    });

    expect(navigation).toHaveClass("bottom-bar--fixed");
  });
});

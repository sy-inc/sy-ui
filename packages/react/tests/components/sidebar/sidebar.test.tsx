import {act, render, screen, setupUser, waitFor, within} from "@sy-inc/testing/helpers";

import {Disclosure} from "@/components/disclosure";
import {Sidebar, useSidebar} from "@/components/sidebar";

import {SidebarFixture} from "./fixtures";

const desktopMedia = (query: string): MediaQueryList =>
  ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }) as unknown as MediaQueryList;

const mobileMedia = (query: string): MediaQueryList =>
  ({...desktopMedia(query), matches: query === "(max-width: 767px)"}) as MediaQueryList;

const FunctionalStateControl = () => {
  const {setOpen} = useSidebar();

  return <button onClick={() => setOpen((isOpen) => !isOpen)}>Functional toggle</button>;
};

describe("Sidebar", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = desktopMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.cookie = "sidebar_state=; path=/; max-age=0";
  });

  it("exposes the menu anatomy that preserves shadcn sidebar spacing", () => {
    render(
      <Sidebar collapsible="icon">
        <Sidebar.Panel>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton isActive>Playground</Sidebar.MenuButton>
                    <Sidebar.MenuBadge>3</Sidebar.MenuBadge>
                    <Sidebar.MenuSub>
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton href="#history">History</Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    </Sidebar.MenuSub>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar.Panel>
      </Sidebar>,
    );

    expect(document.querySelector('[data-slot="sidebar-group-label"]')).toHaveTextContent(
      "Platform",
    );
    expect(screen.getByRole("button", {name: "Playground"})).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("link", {name: "History"})).toHaveAttribute("href", "#history");
  });

  it("supports Disclosure composition for nested menus", async () => {
    const user = setupUser();

    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Disclosure defaultExpanded>
                <Sidebar.MenuButton slot="trigger">
                  Playground
                  <Disclosure.Indicator />
                </Sidebar.MenuButton>
                <Disclosure.Content>
                  <Sidebar.MenuSub>
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton href="#history">History</Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  </Sidebar.MenuSub>
                </Disclosure.Content>
              </Disclosure>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Panel>
      </Sidebar>,
    );

    const trigger = screen.getByRole("button", {name: "Playground"});

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", {name: "History"})).toBeInTheDocument();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("History")).not.toBeVisible();
  });

  it("renders stable menu skeletons", () => {
    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuSkeleton showIcon />
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Panel>
      </Sidebar>,
    );

    expect(document.querySelector('[data-slot="sidebar-menu-skeleton"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(document.querySelector('[data-slot="sidebar-menu-skeleton-icon"]')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sidebar-menu-skeleton-text"]')).toBeInTheDocument();
  });

  it("renders a sidebar input", () => {
    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Input aria-label="Search navigation" />
        </Sidebar.Panel>
      </Sidebar>,
    );

    expect(screen.getByRole("textbox", {name: "Search navigation"})).toHaveAttribute(
      "data-slot",
      "sidebar-input",
    );
  });

  it("renders a sidebar separator", () => {
    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Separator />
        </Sidebar.Panel>
      </Sidebar>,
    );

    expect(screen.getByRole("separator")).toHaveAttribute("data-slot", "sidebar-separator");
  });

  it("calls a sidebar group action", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Group>
            <Sidebar.GroupAction aria-label="Add project" onPress={onPress} />
          </Sidebar.Group>
        </Sidebar.Panel>
      </Sidebar>,
    );

    await user.click(screen.getByRole("button", {name: "Add project"}));

    expect(onPress).toHaveBeenCalledOnce();
  });

  it("supports menu actions that reveal on hover", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>Project</Sidebar.MenuButton>
              <Sidebar.MenuAction
                showOnHover
                aria-expanded="true"
                aria-label="More project actions"
                onPress={onPress}
              />
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Panel>
      </Sidebar>,
    );

    const action = screen.getByRole("button", {name: "More project actions"});

    expect(action).toHaveAttribute("data-show-on-hover", "true");
    expect(action).toHaveAttribute("aria-expanded", "true");
    await user.click(action);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("renders an outline menu button as a link when href is provided", () => {
    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton href="#dashboard" variant="outline">
                Dashboard
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Panel>
      </Sidebar>,
    );

    expect(screen.getByRole("link", {name: "Dashboard"})).toHaveAttribute(
      "data-variant",
      "outline",
    );
  });

  it("renders a submenu control as a button when href is omitted", () => {
    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.MenuSub>
            <Sidebar.MenuSubItem>
              <Sidebar.MenuSubButton>Run action</Sidebar.MenuSubButton>
            </Sidebar.MenuSubItem>
          </Sidebar.MenuSub>
        </Sidebar.Panel>
      </Sidebar>,
    );

    expect(screen.getByRole("button", {name: "Run action"})).toHaveAttribute(
      "data-slot",
      "sidebar-menu-sub-button",
    );
  });

  it("supports a semantic element type for group labels", () => {
    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Group>
            <Sidebar.GroupLabel elementType="h2">Projects</Sidebar.GroupLabel>
          </Sidebar.Group>
        </Sidebar.Panel>
      </Sidebar>,
    );

    expect(screen.getByRole("heading", {level: 2, name: "Projects"})).toHaveAttribute(
      "data-slot",
      "sidebar-group-label",
    );
  });

  it("exposes semantic compound parts and state hooks", () => {
    render(<SidebarFixture side="right" variant="inset" />);

    const root = document.querySelector('[data-slot="sidebar"]');
    const panel = screen.getByRole("complementary", {name: "Workspace navigation"});
    const rail = screen
      .getAllByRole("button", {name: "Toggle sidebar"})
      .find((button) => button.getAttribute("data-slot") === "sidebar-rail");

    expect(root).toHaveClass("sidebar", "sidebar--right", "sidebar--inset");
    expect(root).toHaveAttribute("data-state", "expanded");
    expect(root).toHaveStyle({
      "--sidebar-width": "16rem",
      "--sidebar-width-collapsed": "3rem",
      "--sidebar-width-mobile": "18rem",
    });
    expect(document.querySelector('[data-slot="sidebar-gap"]')).toBeInTheDocument();
    expect(panel).toHaveAttribute("data-slot", "sidebar-panel");
    expect(rail).toHaveAttribute("tabindex", "-1");
    expect(rail).toHaveAttribute("title", "Toggle sidebar");
    expect(document.querySelector('[data-slot="sidebar-header"]')).toHaveClass("sidebar__header");
    expect(document.querySelector('[data-slot="sidebar-content"]')).toHaveClass("sidebar__content");
    expect(document.querySelector('[data-slot="sidebar-group"]')).toHaveClass("sidebar__group");
    expect(document.querySelector('[data-slot="sidebar-footer"]')).toHaveClass("sidebar__footer");
    expect(screen.getByRole("main")).toHaveClass("sidebar__inset");
  });

  it("supports custom desktop and mobile widths", () => {
    render(<Sidebar collapsedWidth="3.5rem" mobileWidth={320} width={280} />);

    expect(document.querySelector('[data-slot="sidebar"]')).toHaveStyle({
      "--sidebar-width": "280px",
      "--sidebar-width-collapsed": "3.5rem",
      "--sidebar-width-mobile": "320px",
    });
  });

  it("supports toggling uncontrolled desktop state and reports accessibility state", async () => {
    const user = setupUser();

    render(<SidebarFixture />);

    const root = document.querySelector('[data-slot="sidebar"]');
    const trigger = within(screen.getByRole("main")).getByRole("button", {
      name: "Toggle sidebar",
    });

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);

    expect(root).toHaveAttribute("data-state", "collapsed");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", screen.getByRole("complementary").id);
    expect(document.cookie).toContain("sidebar_state=false");
  });

  it("hides marked menu items while collapsed", async () => {
    const user = setupUser();

    render(
      <Sidebar>
        <Sidebar.Panel>
          <Sidebar.Trigger />
          <Sidebar.Menu>
            <Sidebar.MenuItem hideCollapsed>
              <Sidebar.MenuButton>Hidden item</Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>Visible item</Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Panel>
      </Sidebar>,
    );

    const hiddenItem = screen.getByRole("button", {name: "Hidden item"}).parentElement;

    expect(hiddenItem).toHaveAttribute("data-hide-collapsed", "true");
    await user.click(screen.getByRole("button", {name: "Toggle sidebar"}));
    expect(hiddenItem).toHaveAttribute("data-hide-collapsed", "true");
  });

  it("supports toggling desktop state with Control+B", async () => {
    const user = setupUser();

    render(<SidebarFixture />);

    await user.keyboard("{Control>}b{/Control}");

    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "collapsed",
    );
    expect(document.cookie).toContain("sidebar_state=false");
  });

  it("supports controlled desktop state", async () => {
    const user = setupUser();
    const onOpenChange = vi.fn();
    const view = render(<SidebarFixture isOpen onOpenChange={onOpenChange} />);
    const trigger = within(screen.getByRole("main")).getByRole("button", {
      name: "Toggle sidebar",
    });

    await user.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "expanded",
    );

    view.rerender(<SidebarFixture isOpen={false} onOpenChange={onOpenChange} />);
    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "collapsed",
    );
  });

  it("auto-collapses uncontrolled state when crossing the collapse breakpoint", () => {
    let handleChange: ((event: MediaQueryListEvent) => void) | undefined;
    window.matchMedia = (query) => {
      const mediaQuery = desktopMedia(query);

      if (query === "(max-width: 1024px)") {
        mediaQuery.addEventListener = ((
          _: string,
          listener: EventListenerOrEventListenerObject,
        ) => {
          handleChange = listener as (event: MediaQueryListEvent) => void;
        }) as MediaQueryList["addEventListener"];
      }

      return mediaQuery;
    };

    render(<SidebarFixture collapseBreakpoint={1024} />);

    act(() => handleChange?.({matches: true} as MediaQueryListEvent));
    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "collapsed",
    );

    act(() => handleChange?.({matches: false} as MediaQueryListEvent));
    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "expanded",
    );
  });

  it("supports functional desktop state updates", async () => {
    const user = setupUser();

    render(
      <Sidebar>
        <FunctionalStateControl />
      </Sidebar>,
    );

    await user.click(screen.getByRole("button", {name: "Functional toggle"}));

    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "collapsed",
    );
    expect(document.cookie).toContain("sidebar_state=false");
  });

  it("renders a persistent panel while updating state when collapsible is none", async () => {
    const user = setupUser();

    render(<SidebarFixture collapsible="none" defaultOpen={false} />);

    expect(screen.getByRole("complementary", {name: "Workspace navigation"})).toBeInTheDocument();
    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "collapsed",
    );
    await user.click(
      within(screen.getByRole("main")).getByRole("button", {name: "Toggle sidebar"}),
    );
    expect(document.querySelector('[data-slot="sidebar"]')).toHaveAttribute(
      "data-state",
      "expanded",
    );
    expect(document.cookie).toContain("sidebar_state=true");
  });

  it("renders a persistent panel on mobile when collapsible is none", async () => {
    window.matchMedia = mobileMedia;

    render(<SidebarFixture collapsible="none" />);

    await act(async () => Promise.resolve());

    expect(screen.getByRole("complementary", {name: "Workspace navigation"})).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the existing Drawer presentation on mobile", async () => {
    window.matchMedia = mobileMedia;
    const user = setupUser();

    render(<SidebarFixture />);

    await act(async () => Promise.resolve());
    await waitFor(() => {
      expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    await user.click(
      within(screen.getByRole("main")).getByRole("button", {name: "Toggle sidebar"}),
    );

    expect(
      await screen.findByRole("dialog", {name: "Workspace navigation"}),
    ).toHaveAccessibleDescription("Displays the mobile sidebar.");
    expect(document.querySelector('[data-slot="drawer-backdrop"]')).toHaveClass(
      "sidebar__mobile-backdrop",
    );
  });
});

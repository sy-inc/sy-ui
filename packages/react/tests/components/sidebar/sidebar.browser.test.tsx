import {render} from "@sy-inc/testing/browser";
import {isDocumentScrollLocked} from "@sy-inc/testing/helpers";
import {renderToString} from "react-dom/server";
import {page, userEvent} from "vitest/browser";

import {Drawer} from "@/components/drawer";
import {Sidebar} from "@/components/sidebar";
import {Tabs} from "@/components/tabs";

// Browser geometry tests load the generated CSS artifact directly.
import "../../../../styles/dist/sy-inc.min.css";

import {SidebarFixture, SidebarIndicatorFixture} from "./fixtures";

describe("Sidebar (browser)", () => {
  const originalMatchMedia = window.matchMedia.bind(window);
  /** Stubs `matchMedia`; returning `undefined` for a query leaves it on the real implementation. */
  const stubMatchMedia = (matches: (query: string) => boolean | undefined) => {
    window.matchMedia = (query) => {
      const match = matches(query);

      if (match === undefined) return originalMatchMedia(query);

      return {
        ...originalMatchMedia(query),
        addEventListener: () => undefined,
        matches: match,
        media: query,
        removeEventListener: () => undefined,
      };
    };
  };
  const stubDesktopMedia = () => stubMatchMedia(() => false);

  // The runner's iframe is phone-sized: default to the mobile layout, desktop tests opt out.
  beforeEach(() => {
    stubMatchMedia((query) => (query === "(max-width: 767px)" ? true : undefined));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("renders mobile navigation as a focus-managed Drawer", async () => {
    await render(<SidebarFixture />);

    const trigger = page.getByRole("main").getByRole("button", {name: "Toggle sidebar"});

    await trigger.click();

    const dialog = page.getByRole("dialog", {name: "Workspace navigation"});

    await expect.element(dialog).toBeInTheDocument();
    expect(Math.round(dialog.element().getBoundingClientRect().width)).toBe(288);
    expect(isDocumentScrollLocked()).toBe(true);
    expect(dialog.element().contains(document.activeElement)).toBe(true);

    await userEvent.keyboard("{Escape}");

    await expect.element(dialog).not.toBeInTheDocument();
    expect(isDocumentScrollLocked()).toBe(false);
    await expect.element(trigger).toHaveFocus();
  });

  it("keeps the mobile panel in place while a drawer opened from it is open", async () => {
    await render(
      <Sidebar>
        <Sidebar.Panel aria-label="Workspace navigation">
          <Drawer>
            <Drawer.Trigger>Language</Drawer.Trigger>
            <Drawer.Backdrop>
              <Drawer.Content placement="bottom">
                <Drawer.Dialog aria-label="Language picker">Picker</Drawer.Dialog>
              </Drawer.Content>
            </Drawer.Backdrop>
          </Drawer>
        </Sidebar.Panel>
        <Sidebar.Inset>
          <Sidebar.Trigger />
        </Sidebar.Inset>
      </Sidebar>,
    );

    await page.getByRole("button", {name: "Toggle sidebar"}).click();
    await page.getByRole("button", {name: "Language"}).click();
    await expect.element(page.getByRole("dialog", {name: "Language picker"})).toBeInTheDocument();

    const panelContent = page
      .getByRole("dialog", {name: "Workspace navigation"})
      .element()
      .closest<HTMLElement>('[data-slot="drawer-content"]')!;

    expect(panelContent).not.toHaveAttribute("data-nested-open");
    expect(getComputedStyle(panelContent).transform).toBe("none");
  });

  it("does not reserve the desktop gap on the mobile SSR first paint", () => {
    const container = document.createElement("div");

    container.innerHTML = renderToString(<SidebarFixture />);
    document.body.append(container);

    try {
      const gap = container.querySelector<HTMLElement>('[data-slot="sidebar-gap"]');

      expect(gap).not.toBeNull();
      expect(gap!.getBoundingClientRect().width).toBe(0);
    } finally {
      container.remove();
    }
  });

  it("collapses below the breakpoint on the SSR first paint, before hydration", async () => {
    const {innerHeight, innerWidth} = window;
    // Fresh markup per viewport: resizing a mounted sidebar would sample a running transition.
    const paintAt = async (width: number) => {
      await page.viewport(width, 800);

      const container = document.createElement("div");

      container.innerHTML = renderToString(<SidebarFixture collapseBreakpoint="xl" />);
      document.body.append(container);

      const gap = container.querySelector<HTMLElement>('[data-slot="sidebar-gap"]')!;
      const label = [...container.querySelectorAll("span")].find(
        (span) => span.textContent === "Models",
      )!;

      return {
        container,
        gapWidth: Math.round(gap.getBoundingClientRect().width),
        isLabelHidden: getComputedStyle(label).display === "none",
      };
    };

    try {
      const narrow = await paintAt(1100);

      expect(narrow.gapWidth).toBe(48);
      expect(narrow.isLabelHidden).toBe(true);
      narrow.container.remove();

      const wide = await paintAt(1400);

      expect(wide.gapWidth).toBe(256);
      expect(wide.isLabelHidden).toBe(false);
      wide.container.remove();
    } finally {
      await page.viewport(innerWidth, innerHeight);
    }
  });

  it("renders the shadcn desktop geometry in expanded and icon states", async () => {
    stubDesktopMedia();
    await render(
      <div style={{height: 398, width: 800}}>
        <SidebarFixture />
      </div>,
    );

    const panel = document.querySelector<HTMLElement>('[data-slot="sidebar-panel"]')!;
    const gap = document.querySelector<HTMLElement>('[data-slot="sidebar-gap"]')!;
    const header = document.querySelector<HTMLElement>('[data-slot="sidebar-header"]')!;
    const largeButton = document.querySelector<HTMLElement>('[data-size="lg"]')!;
    const trigger = page.getByRole("main").getByRole("button", {name: "Toggle sidebar"});

    // The browser test runner uses a mobile-sized iframe; force only presentation to desktop
    // while matchMedia remains desktop so geometry can be verified deterministically.
    panel.style.display = "flex";
    gap.style.display = "block";

    expect(Math.round(panel.getBoundingClientRect().width)).toBe(256);
    expect(Math.round(gap.getBoundingClientRect().width)).toBe(256);
    expect(getComputedStyle(panel).position).toBe("fixed");
    expect(Math.round(header.getBoundingClientRect().height)).toBe(64);
    expect(Math.round(largeButton.getBoundingClientRect().height)).toBe(48);

    const modelsLink = page.getByRole("link", {name: "Models"});

    expect(getComputedStyle(modelsLink.element()).color).toBe(getComputedStyle(panel).color);
    await userEvent.hover(modelsLink.element());
    expect(getComputedStyle(modelsLink.element()).textDecorationLine).toBe("none");

    await trigger.click();
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    expect(Math.round(panel.getBoundingClientRect().width)).toBe(48);
    expect(Math.round(gap.getBoundingClientRect().width)).toBe(48);
    expect(
      getComputedStyle(document.querySelector('[data-slot="sidebar-group-label"]')!).opacity,
    ).toBe("0");
    expect(document.querySelector('[data-slot="sidebar-menu-sub"]')).not.toBeVisible();
    expect(getComputedStyle(page.getByText("Models").element()).display).toBe("none");
    expect(
      getComputedStyle(
        document.querySelector(
          '[href="#models"] > [data-slot="sidebar-menu-selection-indicator"]',
        )!,
      ).display,
    ).not.toBe("none");

    const menuButton = page.getByRole("button", {name: "Playground"});
    const icon = menuButton.element().querySelector("svg")!;

    expect(getComputedStyle(icon).marginInline).toBe("0px");

    await userEvent.hover(menuButton.element());
    await expect.element(page.getByRole("tooltip")).toHaveTextContent("Playground");
  });

  it("clips horizontal overflow without becoming horizontally scrollable", async () => {
    stubDesktopMedia();
    await render(
      <div style={{height: 398, width: 800}}>
        <SidebarFixture />
      </div>,
    );

    const panel = document.querySelector<HTMLElement>('[data-slot="sidebar-panel"]')!;

    panel.style.display = "flex";
    panel.append(Object.assign(document.createElement("div"), {style: "width: 280px; flex: none"}));
    panel.scrollLeft = 8;

    expect(getComputedStyle(panel).overflowX).toBe("clip");
    expect(panel.scrollLeft).toBe(0);
  });

  it("keeps focused overflowing tabs inside their own scroller", async () => {
    stubMatchMedia((query) => query === "(prefers-reduced-motion: reduce)");
    await render(
      <Sidebar collapsible="none" width={220}>
        <Sidebar.Panel aria-label="Workspace navigation" style={{overflowX: "auto", width: 220}}>
          <Sidebar.Content style={{flex: "none", width: 560}}>
            <Tabs style={{width: 220}}>
              <Tabs.ListContainer>
                <Tabs.List aria-label="Workspace options">
                  {["Overview", "Activity", "Integrations", "Notifications"].map((label) => (
                    <Tabs.Tab key={label} id={label}>
                      {label}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel id="Overview">Overview panel</Tabs.Panel>
              <Tabs.Panel id="Activity">Activity panel</Tabs.Panel>
              <Tabs.Panel id="Integrations">Integrations panel</Tabs.Panel>
              <Tabs.Panel id="Notifications">Notifications panel</Tabs.Panel>
            </Tabs>
            <div data-testid="sidebar-marker">Other sidebar content</div>
          </Sidebar.Content>
        </Sidebar.Panel>
      </Sidebar>,
    );

    const panel = document.querySelector<HTMLElement>('[data-slot="sidebar-panel"]')!;
    const marker = page.getByTestId("sidebar-marker").element();
    const markerLeft = marker.getBoundingClientRect().left;
    const rightTab = page.getByRole("tab", {name: "Notifications"});
    const leftTab = page.getByRole("tab", {name: "Overview"});
    const scroller = rightTab
      .element()
      .closest('[data-slot="tabs-list-container"]')!
      .querySelector<HTMLElement>('[data-slot="scroll-shadow"]')!;

    expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);

    rightTab.element().focus();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(scroller.scrollLeft).toBeGreaterThan(0);
    expect(panel.scrollLeft).toBe(0);
    expect(marker.getBoundingClientRect().left).toBe(markerLeft);

    leftTab.element().focus();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(scroller.scrollLeft).toBe(0);
    expect(panel.scrollLeft).toBe(0);
    expect(marker.getBoundingClientRect().left).toBe(markerLeft);
  });

  it("supports a collapsible header trigger composition", async () => {
    stubDesktopMedia();
    await render(
      <Sidebar collapsible="icon">
        <Sidebar.Panel aria-label="Workspace navigation">
          <Sidebar.Header className="flex-row items-center">
            <span className="sidebar-collapsed:hidden">Workspace</span>
            <Sidebar.Trigger className="ml-auto" />
          </Sidebar.Header>
        </Sidebar.Panel>
        <Sidebar.Inset />
      </Sidebar>,
    );

    const panel = document.querySelector<HTMLElement>('[data-slot="sidebar-panel"]')!;
    const trigger = page.getByRole("button", {name: "Toggle sidebar"});

    panel.style.display = "flex";
    await trigger.click();
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    expect(trigger.element().getBoundingClientRect().width).toBe(32);
    expect(trigger.element().getBoundingClientRect().left).toBe(
      panel.getBoundingClientRect().left + 8,
    );
    expect(trigger.element()).toHaveAttribute("aria-expanded", "false");

    trigger.element().focus();
    await userEvent.keyboard("{Enter}");

    expect(trigger.element()).toHaveAttribute("aria-expanded", "true");
  });

  it("renders floating geometry within the declared sidebar width", async () => {
    stubDesktopMedia();
    await render(
      <div style={{height: 398, width: 800}}>
        <SidebarFixture variant="floating" />
      </div>,
    );

    const panel = document.querySelector<HTMLElement>('[data-slot="sidebar-panel"]')!;
    const gap = document.querySelector<HTMLElement>('[data-slot="sidebar-gap"]')!;
    const trigger = page.getByRole("main").getByRole("button", {name: "Toggle sidebar"});

    panel.style.display = "flex";
    gap.style.display = "block";

    expect(Math.round(panel.getBoundingClientRect().width)).toBe(240);
    expect(Math.round(gap.getBoundingClientRect().width)).toBe(256);

    await trigger.click();
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    expect(Math.round(panel.getBoundingClientRect().width)).toBe(50);
    expect(Math.round(gap.getBoundingClientRect().width)).toBe(64);
  });

  it("renders the inset gutter behind the page surface", async () => {
    stubDesktopMedia();
    await render(<SidebarFixture variant="inset" />);

    const root = document.querySelector<HTMLElement>('[data-slot="sidebar"]')!;
    const panel = document.querySelector<HTMLElement>('[data-slot="sidebar-panel"]')!;
    const inset = page.getByRole("main").element();

    panel.style.display = "flex";

    expect(getComputedStyle(root).backgroundColor).toBe(getComputedStyle(panel).backgroundColor);
    expect(getComputedStyle(inset).backgroundColor).not.toBe(
      getComputedStyle(root).backgroundColor,
    );
  });

  describe("menu indicators", () => {
    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const buttonNamed = (name: string) =>
      page.getByRole("button", {exact: true, name}).element() as HTMLElement;
    const hoverIndicatorOf = (button: HTMLElement) =>
      button.querySelector<HTMLElement>('[data-slot="sidebar-menu-hover-indicator"]');
    const hasRunningTranslate = (element: HTMLElement | null) =>
      !!element
        ?.getAnimations()
        .some(
          (animation) =>
            (animation as CSSTransition).transitionProperty === "translate" &&
            animation.playState === "running",
        );

    /** Synthetic mouse moves: React derives enter / leave from `pointerout` + `pointerover`. */
    let pointerAt: Element = document.body;
    const movePointerTo = (target: Element) => {
      const init = {bubbles: true, composed: true, isPrimary: true, pointerType: "mouse"};

      pointerAt.dispatchEvent(new PointerEvent("pointerout", {...init, relatedTarget: target}));
      target.dispatchEvent(new PointerEvent("pointerover", {...init, relatedTarget: pointerAt}));
      pointerAt = target;
    };

    const renderDesktop = async () => {
      stubDesktopMedia();
      pointerAt = document.body;
      await render(
        <div style={{height: 600, width: 800}}>
          <SidebarIndicatorFixture />
        </div>,
      );
      document.querySelector<HTMLElement>('[data-slot="sidebar-panel"]')!.style.display = "flex";
    };

    it("paints menu backgrounds with indicators only inside Content", async () => {
      await renderDesktop();

      const dashboard = buttonNamed("Dashboard");
      const acme = buttonNamed("Acme Inc");

      await userEvent.hover(dashboard);
      await expect.poll(() => hoverIndicatorOf(dashboard)).not.toBeNull();
      expect(getComputedStyle(dashboard).backgroundColor).toBe("rgba(0, 0, 0, 0)");

      await userEvent.hover(acme);
      await expect.poll(() => getComputedStyle(acme).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    });

    it("stretches submenu buttons to the full item width", async () => {
      await renderDesktop();

      const general = buttonNamed("General");

      expect(general.getBoundingClientRect().width).toBe(
        general.closest("li")!.getBoundingClientRect().width,
      );
    });

    it("unclips an open submenu after its height animation and clips it again on collapse", async () => {
      await renderDesktop();

      const settings = page.getByRole("button", {name: "Settings"});
      const content = () =>
        document.querySelector<HTMLElement>(".sidebar__menu-item .disclosure__content")!;

      await settings.click();
      expect(getComputedStyle(content()).overflow).toBe("clip");

      await settings.click();
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      expect(getComputedStyle(content()).overflow).toBe("visible");
    });

    it("leaves no stale indicator position after rapid hovers", async () => {
      await renderDesktop();

      // Across groups, into the submenu and over every size, one frame apart (< 250ms transition).
      for (const name of ["Dashboard", "General", "Design Engineering", "Inbox", "Billing"]) {
        movePointerTo(buttonNamed(name));
        await nextFrame();
      }

      // Within a single frame: hop, flick out of Content and straight back in.
      const dashboard = buttonNamed("Dashboard");

      movePointerTo(buttonNamed("General"));
      await null;
      movePointerTo(dashboard);
      await null;
      movePointerTo(document.body);
      await null;
      movePointerTo(dashboard);

      await expect
        .poll(() => {
          const indicator = hoverIndicatorOf(dashboard);

          return indicator && !indicator.hasAttribute("data-entering") && indicator.style.translate;
        })
        .toBe("");

      const last = buttonNamed("Design Engineering");

      await nextFrame();
      movePointerTo(last);
      // Slides from the previous item rather than jumping.
      await expect.poll(() => hasRunningTranslate(hoverIndicatorOf(last))).toBe(true);
      await expect
        .poll(() => document.querySelectorAll('[data-slot="sidebar-menu-hover-indicator"]').length)
        .toBe(1);
      await expect.poll(() => hasRunningTranslate(hoverIndicatorOf(last))).toBe(false);

      const indicator = hoverIndicatorOf(last)!;
      const indicatorRect = indicator.getBoundingClientRect();
      const buttonRect = last.getBoundingClientRect();

      expect(indicator.style.translate).toBe("");
      expect(indicator.style.width).toBe("");
      expect(indicator.style.height).toBe("");
      expect([
        indicatorRect.left,
        indicatorRect.top,
        indicatorRect.width,
        indicatorRect.height,
      ]).toEqual([buttonRect.left, buttonRect.top, buttonRect.width, buttonRect.height]);
    });

    it("slides across the gap between items instead of fading out and in", async () => {
      await renderDesktop();

      const inbox = buttonNamed("Inbox");
      const settings = buttonNamed("Settings");
      const menu = inbox.closest("ul")!;

      await userEvent.hover(inbox);
      // Let the fade-in finish so the snapshot carried to the next item is fully opaque.
      await expect.poll(() => getComputedStyle(hoverIndicatorOf(inbox)!).opacity).toBe("1");

      const menuRect = menu.getBoundingClientRect();
      const inboxRect = inbox.getBoundingClientRect();

      // Middle of the 8px gap below Inbox.
      await userEvent.hover(menu, {
        position: {x: inboxRect.left - menuRect.left + 16, y: inboxRect.bottom - menuRect.top + 4},
      });
      await nextFrame();
      await nextFrame();
      expect(hoverIndicatorOf(inbox)).not.toBeNull();
      expect(hoverIndicatorOf(inbox)).not.toHaveAttribute("data-exiting");

      await userEvent.hover(settings);

      const indicator = hoverIndicatorOf(settings)!;

      expect(indicator).not.toHaveAttribute("data-entering");
      expect(getComputedStyle(indicator).opacity).toBe("1");
      await expect.poll(() => hasRunningTranslate(hoverIndicatorOf(settings))).toBe(true);

      await userEvent.hover(page.getByRole("main").element());
      await expect.poll(() => indicator.hasAttribute("data-exiting")).toBe(true);
      await expect.poll(() => indicator.isConnected).toBe(false);
    });
  });
});

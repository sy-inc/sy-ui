import {render} from "@sy-inc/testing/browser";
import {isDocumentScrollLocked} from "@sy-inc/testing/helpers";
import {page, userEvent} from "vitest/browser";

// Browser geometry tests load the generated CSS artifact directly.
import "../../../../styles/dist/sy-inc.min.css";

import {SidebarFixture} from "./fixtures";
import {Sidebar} from "@/components/sidebar";
import {Tabs} from "@/components/tabs";

describe("Sidebar (browser)", () => {
  const originalMatchMedia = window.matchMedia.bind(window);

  beforeEach(() => {
    window.matchMedia = (query) => {
      if (query !== "(max-width: 767px)") return originalMatchMedia(query);

      return {
        addEventListener: () => undefined,
        addListener: () => undefined,
        dispatchEvent: () => false,
        matches: true,
        media: query,
        onchange: null,
        removeEventListener: () => undefined,
        removeListener: () => undefined,
      };
    };
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

  it("renders the shadcn desktop geometry in expanded and icon states", async () => {
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      addEventListener: () => undefined,
      matches: false,
      media: query,
      removeEventListener: () => undefined,
    });
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

    const menuButton = page.getByRole("button", {name: "Playground"});
    const icon = menuButton.element().querySelector("svg")!;

    expect(getComputedStyle(icon).marginInline).toBe("0px");

    await userEvent.hover(menuButton.element());
    await expect.element(page.getByRole("tooltip")).toHaveTextContent("Playground");
  });

  it("clips horizontal overflow without becoming horizontally scrollable", async () => {
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      addEventListener: () => undefined,
      matches: false,
      media: query,
      removeEventListener: () => undefined,
    });
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
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      addEventListener: () => undefined,
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      removeEventListener: () => undefined,
    });
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
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      addEventListener: () => undefined,
      matches: false,
      media: query,
      removeEventListener: () => undefined,
    });
    await render(
      <Sidebar collapsible="icon">
        <Sidebar.Panel aria-label="Workspace navigation">
          <Sidebar.Header className="flex-row items-center">
            <span className="group-data-[state=collapsed]/sidebar:hidden">Workspace</span>
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
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      addEventListener: () => undefined,
      matches: false,
      media: query,
      removeEventListener: () => undefined,
    });
    await render(
      <div style={{height: 398, width: 800}}>
        <SidebarFixture variant="floating" />
      </div>,
    );

    const panel = document.querySelector<HTMLElement>('[data-slot="sidebar-panel"]')!;
    const gap = document.querySelector<HTMLElement>('[data-slot="sidebar-gap"]')!;
    const trigger = page.getByRole("main").getByRole("button", {name: "Toggle sidebar"});

    panel.style.display = "flex";

    expect(Math.round(panel.getBoundingClientRect().width)).toBe(240);
    expect(Math.round(gap.getBoundingClientRect().width)).toBe(256);

    await trigger.click();
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    expect(Math.round(panel.getBoundingClientRect().width)).toBe(50);
    expect(Math.round(gap.getBoundingClientRect().width)).toBe(64);
  });

  it("renders the inset gutter behind the page surface", async () => {
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      addEventListener: () => undefined,
      matches: false,
      media: query,
      removeEventListener: () => undefined,
    });
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
});

import {render} from "@sy-inc/testing/browser";
import {isDocumentScrollLocked} from "@sy-inc/testing/helpers";
import {page, userEvent} from "vitest/browser";

// Browser geometry tests load the generated CSS artifact directly.
import "../../../../styles/dist/sy-ui.min.css";

import {SidebarFixture} from "./fixtures";

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

    await userEvent.hover(menuButton.element());
    await expect.element(page.getByRole("tooltip")).toHaveTextContent("Playground");
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

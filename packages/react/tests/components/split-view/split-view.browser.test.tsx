import type {SplitViewLayout} from "@/components/split-view";

import {render} from "@sy-inc/testing/browser";
import {act} from "react";
import {hydrateRoot} from "react-dom/client";
import {renderToString} from "react-dom/server";
import {page, userEvent} from "vitest/browser";

import {SplitView} from "@/components/split-view";

import "../../../../styles/dist/sy-inc.min.css";

import {WorkspaceFixture} from "./fixtures";

const region = (name: string) => page.getByRole("region", {includeHidden: true, name});
const resizeContainer = (width: number) => {
  (page.getByTestId("workspace-container").element() as HTMLElement).style.width = `${width}px`;
};

const actInBrowser = async (callback: () => void | Promise<void>) => {
  const environment = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
  };
  const previous = environment.IS_REACT_ACT_ENVIRONMENT;

  environment.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await act(callback);
  } finally {
    environment.IS_REACT_ACT_ENVIRONMENT = previous;
  }
};

describe("SplitView (browser)", () => {
  it("supports exact container breakpoints independent of the viewport", async () => {
    const changes = vi.fn<(layout: SplitViewLayout) => void>();

    await render(<WorkspaceFixture activePane="content" width={639} onLayoutChange={changes} />);
    await expect.element(region("Main content")).toBeVisible();
    await expect.element(region("Navigation")).not.toBeVisible();
    await expect.poll(() => changes.mock.lastCall?.[0].tier).toBe("compact");

    resizeContainer(640);
    await expect.element(region("Navigation")).toBeVisible();
    await expect.element(region("Inspector")).not.toBeVisible();
    await expect
      .poll(() => changes.mock.lastCall?.[0])
      .toEqual({tier: "medium", visiblePanes: ["start", "content"]});

    resizeContainer(1151);
    await expect.element(region("Inspector")).not.toBeVisible();
    resizeContainer(1152);
    await expect.element(region("Inspector")).toBeVisible();
    await expect
      .poll(() => changes.mock.lastCall?.[0])
      .toEqual({tier: "wide", visiblePanes: ["start", "content", "end"]});
  });

  it("preserves content with the inspector by default in medium", async () => {
    await render(<WorkspaceFixture activePane="end" width={800} />);
    await expect.element(region("Navigation")).not.toBeVisible();
    await expect.element(region("Main content")).toBeVisible();
    await expect.element(region("Inspector")).toBeVisible();
    await expect
      .element(page.getByRole("button", {includeHidden: true, name: "Back to list"}))
      .toBeVisible();
    await expect
      .element(page.getByRole("button", {includeHidden: true, name: "Back to content"}))
      .not.toBeVisible();
  });

  it("supports replacing content and returning from the inspector in medium", async () => {
    await render(<WorkspaceFixture mediumBehavior="replace-content" width={800} />);
    await userEvent.click(page.getByRole("button", {name: "Open inspector"}));
    await expect.element(region("Main content")).not.toBeVisible();
    await expect.element(region("Navigation")).toBeVisible();
    await expect.element(region("Inspector")).toBeVisible();
    await userEvent.click(page.getByRole("button", {includeHidden: true, name: "Back to content"}));
    await expect.element(region("Main content")).toBeVisible();
    await expect.element(page.getByRole("button", {name: "Open inspector"})).toHaveFocus();
  });

  it("supports content plus an end pane and falls back from an absent or closed active pane", async () => {
    const view = await render(<WorkspaceFixture noStart width={360} />);

    await expect.element(region("Main content")).toBeVisible();
    await expect
      .element(page.getByRole("button", {includeHidden: true, name: "Back to list"}))
      .not.toBeVisible();
    await view.rerender(<WorkspaceFixture noStart activePane="end" endOpen={false} width={360} />);
    await expect.element(region("Main content")).toBeVisible();
    await view.rerender(
      <WorkspaceFixture noStart activePane="end" mediumBehavior="replace-content" width={800} />,
    );
    await expect.element(region("Main content")).toBeVisible();
    await expect.element(region("Inspector")).toBeVisible();
  });

  it("moves focus on compact navigation, restores the origin and retains input state", async () => {
    await render(<WorkspaceFixture width={360} />);
    const origin = page.getByRole("button", {name: "Select conversation"});

    await userEvent.click(origin);
    await expect.element(region("Main content")).toHaveFocus();
    await userEvent.fill(page.getByRole("textbox", {name: "Draft"}), "Unsaved draft");
    await userEvent.click(page.getByRole("button", {includeHidden: true, name: "Back to list"}));
    await expect.element(origin).toHaveFocus();
    await userEvent.click(origin);
    await expect.element(page.getByRole("textbox", {name: "Draft"})).toHaveValue("Unsaved draft");
    await expect.element(page.getByRole("button", {name: "Back to list"})).toHaveFocus();
  });

  it("animates panes that enter after mount but not the first paint", async () => {
    await render(<WorkspaceFixture width={360} />);
    const content = region("Main content").element() as HTMLElement;
    const entered = vi.fn();

    expect(region("Navigation").element().getAnimations()).toHaveLength(0);
    content.addEventListener("transitionrun", entered);
    await userEvent.click(page.getByRole("button", {name: "Select conversation"}));
    await expect.poll(() => entered.mock.calls.length).toBeGreaterThan(0);
  });

  it("keeps entering panes out of the page's horizontal scroll area", async () => {
    // A narrow page gutter, like px-2: the 1.5rem entry offset used to scroll the page sideways.
    await render(
      <div data-testid="scroller" style={{overflow: "auto", padding: "0 0.5rem", width: 376}}>
        <WorkspaceFixture width={360} />
      </div>,
    );
    const scroller = page.getByTestId("scroller").element() as HTMLElement;
    const overflow: number[] = [];

    region("Main content")
      .element()
      .addEventListener("transitionrun", () =>
        overflow.push(scroller.scrollWidth - scroller.clientWidth),
      );
    await userEvent.click(page.getByRole("button", {name: "Select conversation"}));
    await expect.poll(() => overflow.length).toBeGreaterThan(0);
    expect(Math.max(...overflow)).toBe(0);
  });

  it("keeps focus-ring room past the edges of a scroll none section", async () => {
    await render(
      <div style={{height: 240, padding: 16, width: 1280}}>
        <SplitView>
          <SplitView.Pane aria-label="Navigation" scroll="none">
            {/* Stands in for a flush field's ring, which is not hit-testable itself. */}
            <div data-testid="flush" style={{height: 40, marginInlineStart: -6}} />
          </SplitView.Pane>
          <SplitView.Content aria-label="Main content" />
        </SplitView>
      </div>,
    );
    const pane = region("Navigation").element().getBoundingClientRect();

    expect(document.elementFromPoint(pane.left - 4, pane.top + 20)).toBe(
      page.getByTestId("flush").element(),
    );
  });

  it("repairs focus when the container hides a pane and keeps outside focus intact", async () => {
    await render(
      <>
        <button>Outside</button>
        <WorkspaceFixture activePane="content" />
      </>,
    );
    await userEvent.click(page.getByRole("button", {name: "Select conversation"}));
    resizeContainer(360);
    await expect.element(region("Main content")).toHaveFocus();

    resizeContainer(1280);
    await expect.element(region("Navigation")).toBeVisible();
    await userEvent.click(page.getByRole("button", {name: "Outside"}));
    resizeContainer(360);
    await expect.element(region("Navigation")).not.toBeVisible();
    await expect.element(page.getByRole("button", {name: "Outside"})).toHaveFocus();
  });

  it("closes the inspector in wide without unmounting and restores focus to content", async () => {
    const view = await render(<WorkspaceFixture activePane="end" />);
    const notes = page
      .getByRole("textbox", {name: "Inspector notes"})
      .element() as HTMLInputElement;

    await userEvent.fill(page.getByRole("textbox", {name: "Inspector notes"}), "Retained note");
    await view.rerender(<WorkspaceFixture activePane="end" endOpen={false} />);
    await expect.element(region("Main content")).toHaveFocus();
    expect(notes.isConnected).toBe(true);
    expect(notes.value).toBe("Retained note");
    await view.rerender(<WorkspaceFixture activePane="end" />);
    await expect
      .element(page.getByRole("textbox", {name: "Inspector notes"}))
      .toHaveValue("Retained note");
  });

  it("supports focus opt-out and a custom destination", async () => {
    const focus = vi.fn((event: {preventDefault: () => void}) => {
      event.preventDefault();
      (page.getByRole("textbox", {name: "Draft"}).element() as HTMLElement).focus();
    });

    await render(<WorkspaceFixture width={360} onPaneFocus={focus} />);

    await userEvent.click(page.getByRole("button", {name: "Select conversation"}));
    // Draft keeps focus only if preventDefault stopped the default move to the section.
    await expect.element(page.getByRole("textbox", {name: "Draft"})).toHaveFocus();
    expect(focus).toHaveBeenCalledWith(
      expect.objectContaining({pane: "content", reason: "navigation"}),
    );
  });

  it("keeps independent scroll positions and supports custom side widths", async () => {
    const view = await render(<WorkspaceFixture />);
    const nav = region("Navigation").element() as HTMLElement;

    nav.scrollTop = 100;
    expect(nav.scrollTop).toBe(100);
    expect((region("Main content").element() as HTMLElement).scrollTop).toBe(0);
    await view.rerender(<WorkspaceFixture activePane="content" width={360} />);
    await view.rerender(<WorkspaceFixture activePane="start" width={360} />);
    expect(nav.scrollTop).toBe(100);

    await view.rerender(
      <div style={{height: 240, width: 1280}}>
        <SplitView>
          <SplitView.Pane aria-label="Sized navigation" maxWidth={280} minWidth={200} width={320} />
          <SplitView.Content aria-label="Sized content" scroll="none" />
        </SplitView>
      </div>,
    );
    expect(region("Sized navigation").element().getBoundingClientRect().width).toBe(280);
    expect(getComputedStyle(region("Sized content").element()).overflowY).toBe("clip");
  });

  it("keeps nested container tiers and logical RTL positions independent", async () => {
    await render(
      <div dir="rtl" style={{height: 240, width: 1280}}>
        <SplitView activePane="content">
          <SplitView.Pane aria-label="Outer navigation" />
          <SplitView.Content aria-label="Outer content">
            <div style={{height: 200, width: 360}}>
              <SplitView activePane="content">
                <SplitView.Pane aria-label="Inner navigation" />
                <SplitView.Content aria-label="Inner content" />
              </SplitView>
            </div>
          </SplitView.Content>
        </SplitView>
      </div>,
    );
    await expect.element(region("Outer navigation")).toBeVisible();
    await expect.element(region("Inner navigation")).not.toBeVisible();
    expect(region("Outer navigation").element().getBoundingClientRect().left).toBeGreaterThan(
      region("Outer content").element().getBoundingClientRect().left,
    );
  });

  it("remembers pre-hydration focus and repairs it when its pane becomes hidden", async () => {
    await render(<></>);
    const tree = (
      <SplitView activePane="content">
        <SplitView.Pane aria-label="Server navigation">
          <button>Server selection</button>
        </SplitView.Pane>
        <SplitView.Content aria-label="Server content">Content</SplitView.Content>
      </SplitView>
    );
    const host = document.createElement("div");

    host.style.cssText = "height:240px;width:1280px";
    host.innerHTML = renderToString(tree);
    document.body.append(host);
    const selection = host.querySelector<HTMLButtonElement>("button")!;

    selection.focus();
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      await actInBrowser(async () => {
        root = hydrateRoot(host, tree);
      });
      expect(selection).toHaveFocus();
      host.style.width = "360px";
      await expect.element(region("Server content")).toHaveFocus();
    } finally {
      await actInBrowser(async () => root?.unmount());
      host.remove();
    }
  });

  it("styles server HTML before hydration and hydrates without stealing focus", async () => {
    await render(<button>Keep focus</button>);
    await userEvent.click(page.getByRole("button", {name: "Keep focus"}));
    const tree = (
      <SplitView activePane="content">
        <SplitView.Pane aria-label="SSR navigation">Navigation</SplitView.Pane>
        <SplitView.Content aria-label="SSR content">Content</SplitView.Content>
        <SplitView.Pane aria-label="SSR inspector" position="end">
          Inspector
        </SplitView.Pane>
      </SplitView>
    );
    const host = document.createElement("div");

    host.style.cssText = "height:240px;width:360px";
    host.innerHTML = renderToString(tree);
    document.body.append(host);
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;

    try {
      const panes = Array.from(host.querySelectorAll<HTMLElement>("[data-pane]"));

      expect(
        panes
          .filter((pane) => pane.getClientRects().length > 0)
          .map((pane) => pane.dataset["pane"]),
      ).toEqual(["content"]);
      await actInBrowser(async () => {
        root = hydrateRoot(host, tree, {onRecoverableError});
      });
      expect(onRecoverableError).not.toHaveBeenCalled();
      await expect.element(page.getByRole("button", {name: "Keep focus"})).toHaveFocus();
      host.style.width = "1280px";
      await expect
        .poll(() => panes.filter((pane) => pane.getClientRects().length > 0).length)
        .toBe(3);
    } finally {
      await actInBrowser(async () => root?.unmount());
      host.remove();
    }
  });
});

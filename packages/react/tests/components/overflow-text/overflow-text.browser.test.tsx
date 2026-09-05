import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {OverflowText} from "@/components/overflow-text";

import "../../../../styles/dist/sy-inc.min.css";

const text = "Quarterly revenue across all Southeast Asia markets — September 2026";
const viewportOf = (root: Element) =>
  root.querySelector<HTMLElement>('[data-slot="overflow-text-viewport"]')!;

describe("OverflowText (browser)", () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(async () => {
    await page.viewport(1400, 800);
  });

  // Edge state comes from the shared scroll-shadow hook: `data-left-scroll` / `data-right-scroll`
  // for a single clipped edge, `data-left-right-scroll` when both are clipped.
  it("fades only clipped edges, scrolls to the end on hover, and resets on leave", async () => {
    await render(
      <>
        <OverflowText delay={0} speed={2000} data-testid="text" style={{width: 180}}>
          {text}
        </OverflowText>
        <button>Outside</button>
      </>,
    );
    const root = page.getByTestId("text");
    const viewport = viewportOf(root.element());

    await expect.element(root).toHaveAttribute("data-overflowing", "true");
    await expect.poll(() => viewport.getAttribute("data-right-scroll")).toBe("true");
    expect(viewport).toHaveAttribute("data-left-scroll", "false");
    expect(getComputedStyle(viewport).maskImage).not.toBe("none");
    expect(viewport.getBoundingClientRect().width).toBeLessThanOrEqual(180);
    await userEvent.hover(root);
    await expect.poll(() => viewport.scrollLeft).toBeGreaterThan(0);
    await expect.poll(() => viewport.getAttribute("data-left-scroll")).toBe("true");
    expect(viewport).toHaveAttribute("data-right-scroll", "false");
    await userEvent.hover(page.getByRole("button", {name: "Outside"}));
    await expect.poll(() => viewport.scrollLeft).toBe(0);
  });

  it("waits before scrolling and cancels pending motion when hover leaves", async () => {
    await render(
      <>
        <OverflowText delay={200} speed={2000} data-testid="text" style={{width: 180}}>
          {text}
        </OverflowText>
        <button>Outside</button>
      </>,
    );
    const root = page.getByTestId("text");
    const viewport = viewportOf(root.element());

    await userEvent.hover(root);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(viewport.scrollLeft).toBe(0);
    await userEvent.hover(page.getByRole("button", {name: "Outside"}));
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(viewport.scrollLeft).toBe(0);
    await userEvent.hover(root);
    await expect.poll(() => viewport.scrollLeft).toBeGreaterThan(0);
  });

  it("adds just one Tab stop for overflow and none for text that fits", async () => {
    await render(
      <>
        <OverflowText data-testid="long" autoScroll={false} style={{width: 180}}>
          {text}
        </OverflowText>
        <OverflowText style={{width: 180}}>Short</OverflowText>
        <button>After text</button>
      </>,
    );
    const root = page.getByTestId("long");
    const viewport = viewportOf(root.element());

    await expect.element(root).not.toHaveAttribute("tabindex");
    expect(viewport).toHaveAttribute("tabindex", "0");
    await userEvent.tab();
    expect(viewport).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", {name: "After text"})).toHaveFocus();
  });

  it("supports focus scrolling and native keyboard control", async () => {
    await render(
      <OverflowText delay={0} speed={2000} data-testid="text" style={{width: 180}}>
        {text}
      </OverflowText>,
    );
    const root = page.getByTestId("text");
    const viewport = viewportOf(root.element());

    await userEvent.tab();
    expect(viewport).toHaveFocus();
    await expect.element(root).toHaveAttribute("data-focus-visible", "true");
    await expect.poll(() => viewport.scrollLeft).toBeGreaterThan(0);
    await userEvent.keyboard("{End}");
    await expect
      .poll(() => Math.round(viewport.scrollLeft))
      .toBe(Math.round(viewport.scrollWidth - viewport.clientWidth));
    await userEvent.keyboard("{Home}");
    await expect.poll(() => viewport.scrollLeft).toBe(0);
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => viewport.scrollLeft).toBeGreaterThan(0);
  });

  it("rechecks overflow when the container or content changes", async () => {
    const view = await render(
      <OverflowText data-testid="text" style={{width: 180}}>
        {text}
      </OverflowText>,
    );
    const root = page.getByTestId("text");

    await expect.element(root).toHaveAttribute("data-overflowing", "true");
    (root.element() as HTMLElement).style.width = "1200px";
    await expect.element(root).toHaveAttribute("data-overflowing", "false");
    await expect
      .poll(() => viewportOf(root.element()).getAttribute("data-right-scroll"))
      .toBe("false");
    await view.rerender(
      <OverflowText data-testid="text" style={{width: 100}}>
        Short
      </OverflowText>,
    );
    await expect.element(root).toHaveAttribute("data-overflowing", "false");
    await view.rerender(
      <OverflowText data-testid="text" style={{width: 100}}>
        {text}
      </OverflowText>,
    );
    await expect.element(root).toHaveAttribute("data-overflowing", "true");
  });

  it("scrolls from right to left for RTL text", async () => {
    await render(
      <OverflowText dir="rtl" delay={0} speed={2000} data-testid="text" style={{width: 150}}>
        تقرير الإيرادات الفصلية لمنطقة جنوب شرق آسيا لشهر سبتمبر
      </OverflowText>,
    );
    const root = page.getByTestId("text");
    const viewport = viewportOf(root.element());

    await userEvent.hover(root);
    await expect.poll(() => viewport.scrollLeft).toBeLessThan(0);
    await expect.poll(() => viewport.getAttribute("data-right-scroll")).toBe("false");
    expect(viewport).toHaveAttribute("data-left-scroll", "true");
    expect(getComputedStyle(viewport).maskImage).not.toBe("none");
  });

  it("keeps manual scrolling available when automatic scrolling is disabled", async () => {
    await render(
      <OverflowText autoScroll={false} data-testid="text" style={{width: 180}}>
        {text}
      </OverflowText>,
    );
    const root = page.getByTestId("text");
    const viewport = viewportOf(root.element());

    await userEvent.hover(root);
    expect(viewport.scrollLeft).toBe(0);
    viewport.scrollLeft = 80;
    await expect.poll(() => viewport.getAttribute("data-left-right-scroll")).toBe("true");
    expect(getComputedStyle(viewport).overflowX).toBe("auto");
  });

  it("disables automatic motion for reduced motion while preserving keyboard access", async () => {
    const nativeMatchMedia = window.matchMedia.bind(window);

    vi.spyOn(window, "matchMedia").mockImplementation((query) =>
      nativeMatchMedia(query === "(prefers-reduced-motion: reduce)" ? "(min-width: 0px)" : query),
    );
    await render(
      <OverflowText delay={0} speed={2000} data-testid="text" style={{width: 180}}>
        {text}
      </OverflowText>,
    );
    const root = page.getByTestId("text");
    const viewport = viewportOf(root.element());

    await userEvent.hover(root);
    await userEvent.tab();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(viewport.scrollLeft).toBe(0);
    await userEvent.keyboard("{End}");
    await expect.poll(() => viewport.scrollLeft).toBeGreaterThan(0);
  });
});

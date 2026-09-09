import {act, render, screen, setupUser} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {OverflowText} from "@/components/overflow-text";

const text = "Quarterly revenue across Southeast Asia";
const viewportOf = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-slot="overflow-text-viewport"]')!;

describe("OverflowText", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders the complete text once and forwards ref and DOM props", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <OverflowText ref={ref} className="custom" data-testid="text">
        {text}
      </OverflowText>,
    );
    expect(screen.getAllByText(text)).toHaveLength(1);
    expect(ref.current).toBe(screen.getByTestId("text"));
    expect(ref.current).toHaveAttribute("data-slot", "overflow-text");
    expect(ref.current).toHaveClass("custom");
    expect(ref.current).not.toHaveAttribute("tabindex");
    expect(ref.current).toHaveAttribute("data-overflowing", "false");
    expect(viewportOf(ref.current!)).not.toHaveAttribute("tabindex");
  });

  it("makes the scroll container the tab stop and keeps consumer handlers", async () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(300);
    const onFocus = vi.fn();
    const onKeyDown = vi.fn();
    const user = setupUser();

    render(
      <OverflowText autoScroll={false} data-testid="text" onFocus={onFocus} onKeyDown={onKeyDown}>
        {text}
      </OverflowText>,
    );
    const root = screen.getByTestId("text");
    const viewport = viewportOf(root);

    expect(root).toHaveAttribute("data-overflowing", "true");
    expect(root).not.toHaveAttribute("tabindex");
    expect(viewport).toHaveAttribute("tabindex", "0");

    // Browsers scroll the focused container natively; only the composition is asserted here.
    await user.tab();
    expect(viewport).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute("data-focus-visible", "true");
    await user.keyboard("{End}");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it("supports overriding the tab stop", () => {
    render(
      <OverflowText data-testid="text" tabIndex={0}>
        {text}
      </OverflowText>,
    );

    expect(viewportOf(screen.getByTestId("text"))).toHaveAttribute("tabindex", "0");
  });

  it("supports content changes without keeping a stale scroll position", () => {
    const {rerender} = render(<OverflowText>{text}</OverflowText>);
    const viewport = screen.getByText(text).parentElement!;

    act(() => {
      viewport.scrollLeft = 80;
    });
    rerender(<OverflowText>Updated text</OverflowText>);
    expect(screen.getByText("Updated text")).toBeInTheDocument();
    expect(viewport.scrollLeft).toBe(0);
  });

  it("supports composing the viewport and content around rich children", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(300);

    render(
      <OverflowText data-testid="text">
        <OverflowText.Viewport data-testid="viewport">
          <OverflowText.Content>
            <strong>{text}</strong>
          </OverflowText.Content>
        </OverflowText.Viewport>
        <span data-testid="sibling">badge</span>
      </OverflowText>,
    );
    const root = screen.getByTestId("text");

    expect(screen.getAllByText(text)).toHaveLength(1);
    expect(root).toHaveAttribute("data-overflowing", "true");
    // The composed viewport still gets the tab stop and the measurement refs from the root.
    expect(viewportOf(root)).toBe(screen.getByTestId("viewport"));
    expect(viewportOf(root)).toHaveAttribute("tabindex", "0");
    expect(screen.getByTestId("sibling")).toBeInTheDocument();
  });

  it("throws when a part is rendered outside the root", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<OverflowText.Content>{text}</OverflowText.Content>)).toThrow(
      /inside OverflowText.Root/,
    );
  });
});

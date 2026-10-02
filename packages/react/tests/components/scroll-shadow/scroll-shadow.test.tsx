import {fireEvent, render, screen, waitFor} from "@sy-inc/testing/helpers";

import {ScrollShadow} from "@/components/scroll-shadow";

describe("ScrollShadow", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders children content", () => {
    render(<ScrollShadow>Scrollable content</ScrollShadow>);

    expect(screen.getByText("Scrollable content")).toBeInTheDocument();
  });

  it("exposes BEM block and data-slot", () => {
    render(<ScrollShadow data-testid="scroll-shadow">Content</ScrollShadow>);
    const scrollShadow = screen.getByTestId("scroll-shadow");

    expect(scrollShadow).toHaveAttribute("data-slot", "scroll-shadow");
    expect(scrollShadow.className).toEqual(expect.stringContaining("scroll-shadow"));
  });

  it("exposes orientation BEM modifier and data attribute", () => {
    render(
      <ScrollShadow data-testid="scroll-shadow" orientation="horizontal">
        Content
      </ScrollShadow>,
    );
    const scrollShadow = screen.getByTestId("scroll-shadow");

    expect(scrollShadow).toHaveAttribute("data-orientation", "horizontal");
    expect(scrollShadow.className).toEqual(expect.stringContaining("scroll-shadow--horizontal"));
  });

  it("exposes hideScrollBar BEM modifier", () => {
    render(
      <ScrollShadow hideScrollBar data-testid="scroll-shadow">
        Content
      </ScrollShadow>,
    );

    expect(screen.getByTestId("scroll-shadow").className).toEqual(
      expect.stringContaining("scroll-shadow--hide-scrollbar"),
    );
  });

  it("supports CSS sizing unless size is passed", () => {
    render(
      <>
        <ScrollShadow data-testid="css-size">Content</ScrollShadow>
        <ScrollShadow data-testid="prop-size" size={80}>
          Content
        </ScrollShadow>
      </>,
    );
    const cssSize = screen.getByTestId("css-size");
    const propSize = screen.getByTestId("prop-size");

    expect(cssSize.style.getPropertyValue("--scroll-shadow-size")).toBe("");
    expect(cssSize).not.toHaveAttribute("data-scroll-shadow-size");
    expect(propSize.style.getPropertyValue("--scroll-shadow-size")).toBe("80px");
    expect(propSize).toHaveAttribute("data-scroll-shadow-size", "80");
  });

  describe("visibility", () => {
    it("supports controlled vertical visibility", () => {
      const {rerender} = render(
        <ScrollShadow data-testid="scroll-shadow" visibility="both">
          Content
        </ScrollShadow>,
      );
      const scrollShadow = screen.getByTestId("scroll-shadow");

      expect(scrollShadow).toHaveAttribute("data-top-bottom-scroll", "true");
      expect(scrollShadow).not.toHaveAttribute("data-top-scroll");
      expect(scrollShadow).not.toHaveAttribute("data-bottom-scroll");

      rerender(
        <ScrollShadow data-testid="scroll-shadow" visibility="top">
          Content
        </ScrollShadow>,
      );

      expect(scrollShadow).toHaveAttribute("data-top-scroll", "true");
      expect(scrollShadow).toHaveAttribute("data-bottom-scroll", "false");
      expect(scrollShadow).not.toHaveAttribute("data-top-bottom-scroll");

      rerender(
        <ScrollShadow data-testid="scroll-shadow" visibility="none">
          Content
        </ScrollShadow>,
      );

      expect(scrollShadow).toHaveAttribute("data-top-scroll", "false");
      expect(scrollShadow).toHaveAttribute("data-bottom-scroll", "false");
    });

    it("supports controlled horizontal visibility", () => {
      render(
        <ScrollShadow data-testid="scroll-shadow" orientation="horizontal" visibility="right">
          Content
        </ScrollShadow>,
      );
      const scrollShadow = screen.getByTestId("scroll-shadow");

      expect(scrollShadow).toHaveAttribute("data-left-scroll", "false");
      expect(scrollShadow).toHaveAttribute("data-right-scroll", "true");
      expect(scrollShadow).not.toHaveAttribute("data-top-scroll");
    });

    it("calls onVisibilityChange as auto overflow changes", async () => {
      let scrollTop = 0;

      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(300);
      vi.spyOn(HTMLElement.prototype, "scrollTop", "get").mockImplementation(() => scrollTop);
      const onVisibilityChange = vi.fn();

      render(
        <ScrollShadow data-testid="scroll-shadow" onVisibilityChange={onVisibilityChange}>
          Content
        </ScrollShadow>,
      );
      const scrollShadow = screen.getByTestId("scroll-shadow");

      await waitFor(() => expect(onVisibilityChange).toHaveBeenLastCalledWith("bottom"));
      expect(scrollShadow).toHaveAttribute("data-bottom-scroll", "true");

      scrollTop = 100;
      fireEvent.scroll(scrollShadow);
      await waitFor(() => expect(onVisibilityChange).toHaveBeenLastCalledWith("both"));
      expect(scrollShadow).toHaveAttribute("data-top-bottom-scroll", "true");

      scrollTop = 200;
      fireEvent.scroll(scrollShadow);
      await waitFor(() => expect(onVisibilityChange).toHaveBeenLastCalledWith("top"));
      expect(scrollShadow).toHaveAttribute("data-top-scroll", "true");
      expect(scrollShadow).toHaveAttribute("data-bottom-scroll", "false");
      expect(scrollShadow).not.toHaveAttribute("data-top-bottom-scroll");
    });
  });

  it("supports data attribute passthrough", () => {
    render(
      <ScrollShadow data-foo="bar" data-testid="scroll-shadow">
        Content
      </ScrollShadow>,
    );

    expect(screen.getByTestId("scroll-shadow")).toHaveAttribute("data-foo", "bar");
  });
});

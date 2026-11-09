import {render, screen} from "@sy-inc/testing/helpers";
import {createRef} from "react";
import {SeparatorContext} from "react-aria-components/Separator";

import {Separator, SeparatorContent} from "@/components/separator";

describe("Separator", () => {
  it("renders with separator role", () => {
    render(<Separator />);

    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("exposes BEM block and data-slot", () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId("separator");

    expect(separator).toHaveAttribute("data-slot", "separator");
    expect(separator.className).toEqual(expect.stringContaining("separator"));
  });

  it("exposes orientation BEM modifier and data attribute", () => {
    render(<Separator data-testid="separator" orientation="vertical" />);
    const separator = screen.getByTestId("separator");

    expect(separator).toHaveAttribute("data-orientation", "vertical");
    expect(separator.className).toEqual(expect.stringContaining("separator--vertical"));
  });

  it("exposes variant BEM modifier", () => {
    render(<Separator data-testid="separator" variant="secondary" />);

    expect(screen.getByTestId("separator").className).toEqual(
      expect.stringContaining("separator--secondary"),
    );
  });

  it("supports data attribute passthrough", () => {
    render(<Separator data-foo="bar" data-testid="separator" />);

    expect(screen.getByTestId("separator")).toHaveAttribute("data-foo", "bar");
  });
  it.each(["horizontal", "vertical"] as const)("renders a decorative %s divider", (orientation) => {
    const warn = vi.spyOn(console, "warn");

    onTestFinished(() => warn.mockRestore());

    render(<Separator isDecorative data-testid="divider" orientation={orientation} />);
    const divider = screen.getByTestId("divider");

    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(divider).toHaveAttribute("aria-hidden", "true");
    expect(divider).toHaveAttribute("role", "presentation");
    expect(divider).not.toHaveAttribute("aria-orientation");
    expect(divider).toHaveAttribute("data-orientation", orientation);
    expect(divider).toHaveClass(`separator--${orientation}`);
    expect(warn).not.toHaveBeenCalled();
    expect(divider.tagName).toBe(orientation === "horizontal" ? "HR" : "DIV");
  });

  it("supports decorative context rendering, refs and explicit overrides", () => {
    const ref = createRef<HTMLDivElement>();
    const context = {
      elementType: "div" as const,
      render: (props: React.ComponentPropsWithRef<"div">) => (
        <div {...props} data-testid="context" />
      ),
    };
    const {rerender} = render(
      <SeparatorContext value={context}>
        <Separator ref={ref} isDecorative orientation="vertical" variant="secondary" />
      </SeparatorContext>,
    );

    expect(ref.current).toBe(screen.getByTestId("context"));
    expect(ref.current).toHaveAttribute("aria-hidden", "true");
    expect(ref.current).toHaveClass("separator--secondary");
    rerender(
      <SeparatorContext value={context}>
        <Separator render={(props) => <div {...props} data-testid="explicit" />} />
      </SeparatorContext>,
    );
    expect(screen.getByRole("separator")).toBe(screen.getByTestId("explicit"));
    expect(screen.queryByTestId("context")).not.toBeInTheDocument();
  });

  it("supports slotted orientation and hr rendering for decorative dividers", () => {
    render(
      <SeparatorContext value={{slots: {divider: {elementType: "hr", orientation: "vertical"}}}}>
        <Separator isDecorative data-testid="divider" slot="divider" />
      </SeparatorContext>,
    );
    const divider = screen.getByTestId("divider");

    expect(divider.tagName).toBe("DIV");
    expect(divider).toHaveAttribute("data-orientation", "vertical");
    expect(divider).toHaveAttribute("aria-hidden", "true");
  });
});

describe("SeparatorContent", () => {
  it("renders content between two decorative lines", () => {
    render(<SeparatorContent data-testid="separator-content">OR</SeparatorContent>);

    const content = screen.getByTestId("separator-content");
    const lines = content.querySelectorAll('[data-slot="separator-content-line"]');

    expect(content).toHaveAttribute("data-slot", "separator-content");
    expect(screen.getByText("OR")).toBeInTheDocument();
    expect(lines).toHaveLength(2);
    lines.forEach((line) => expect(line).toHaveAttribute("aria-hidden", "true"));
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("exposes variant styles", () => {
    render(
      <SeparatorContent data-testid="separator-content" variant="secondary">
        OR
      </SeparatorContent>,
    );

    const content = screen.getByTestId("separator-content");
    const line = content.querySelector('[data-slot="separator-content-line"]');

    expect(content).not.toHaveAttribute("data-orientation");
    expect(content).toHaveClass("separator__container");
    expect(line).toHaveClass("separator--horizontal", "separator--secondary");
  });

  it("supports custom render and className", () => {
    render(
      <SeparatorContent
        className="custom-class-name"
        data-testid="separator-content"
        render={(props) => <section {...props} />}
      >
        OR
      </SeparatorContent>,
    );

    const content = screen.getByTestId("separator-content");

    expect(content.tagName).toBe("SECTION");
    expect(content).toHaveClass("custom-class-name");
  });
});

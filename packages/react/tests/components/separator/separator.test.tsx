import {render, screen} from "@sy-inc/testing/helpers";

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

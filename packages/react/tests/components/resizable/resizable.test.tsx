import type {ComponentProps} from "react";

import {render, screen} from "@sy-inc/testing/helpers";

import {Resizable} from "@/components/resizable";

const renderResizable = (props: Partial<ComponentProps<typeof Resizable>> = {}) =>
  render(
    <Resizable id="resizable" {...props}>
      <Resizable.Panel defaultSize="30%" maxSize="60%" minSize="20%">
        Sidebar
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel defaultSize="70%" minSize="40%">
        Main
      </Resizable.Panel>
    </Resizable>,
  );

describe("Resizable", () => {
  it("renders documented slots and separator semantics", () => {
    renderResizable();
    const handle = screen.getByRole("separator", {name: "Resize handle"});

    expect(screen.getByTestId("resizable")).toHaveAttribute("data-slot", "resizable");
    expect(screen.getByTestId("resizable")).toHaveClass("resizable", "resizable--horizontal");
    expect(screen.getByTestId("resizable")).toHaveAttribute("data-orientation", "horizontal");
    expect(screen.getAllByText(/Sidebar|Main/)).toHaveLength(2);
    expect(handle).toHaveAttribute("data-slot", "resizable-handle");
    expect(handle).toHaveClass("resizable__handle");
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(handle).toHaveAttribute("tabindex", "0");
    expect(document.querySelectorAll('[data-slot="resizable-panel"]')).toHaveLength(2);
  });

  it("exposes each handle type with its built-in indicator", () => {
    const types = ["line", "drag", "pill"] as const;

    render(
      <>
        {types.map((type) => (
          <Resizable key={type}>
            <Resizable.Panel>Left</Resizable.Panel>
            <Resizable.Handle aria-label={`${type} handle`} type={type} />
            <Resizable.Panel>Right</Resizable.Panel>
          </Resizable>
        ))}
      </>,
    );

    const indicatorOf = (type: string) =>
      screen
        .getByRole("separator", {name: `${type} handle`})
        .querySelector('[data-slot="resizable-handle-indicator"]');

    // `line` is the bare divider; the other types add a decorative indicator on top of it.
    expect(indicatorOf("line")).toBeNull();
    expect(indicatorOf("drag")).toHaveClass("resizable__handle-indicator--drag");
    expect(indicatorOf("pill")).toHaveClass("resizable__handle-indicator--pill");
    expect(indicatorOf("drag")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders custom handle content instead of the built-in indicator", () => {
    render(
      <Resizable>
        <Resizable.Panel>Left</Resizable.Panel>
        <Resizable.Handle type="pill">
          <span data-testid="custom-grip">grip</span>
        </Resizable.Handle>
        <Resizable.Panel>Right</Resizable.Panel>
      </Resizable>,
    );

    const handle = screen.getByRole("separator");

    expect(handle).toContainElement(screen.getByTestId("custom-grip"));
    expect(handle.querySelector('[data-slot="resizable-handle-indicator"]')).toBeNull();
  });

  it("uses the opposite separator orientation for vertical groups", () => {
    renderResizable({orientation: "vertical"});

    expect(screen.getByTestId("resizable")).toHaveClass("resizable--vertical");
    expect(screen.getByTestId("resizable")).toHaveAttribute("data-orientation", "vertical");
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("marks disabled handles as unfocusable separators", () => {
    render(
      <Resizable>
        <Resizable.Panel>Sidebar</Resizable.Panel>
        <Resizable.Handle disabled />
        <Resizable.Panel>Main</Resizable.Panel>
      </Resizable>,
    );

    const handle = screen.getByRole("separator");

    expect(handle).toHaveAttribute("aria-disabled", "true");
    expect(handle).toHaveAttribute("data-separator", "disabled");
    expect(handle).not.toHaveAttribute("tabindex");
  });

  it("keeps nested groups independent", () => {
    render(
      <Resizable id="outer-resizable">
        <Resizable.Panel>Sidebar</Resizable.Panel>
        <Resizable.Handle aria-label="Resize sidebar" />
        <Resizable.Panel>
          <Resizable id="inner-resizable" orientation="vertical">
            <Resizable.Panel>Editor</Resizable.Panel>
            <Resizable.Handle aria-label="Resize editor" />
            <Resizable.Panel>Terminal</Resizable.Panel>
          </Resizable>
        </Resizable.Panel>
      </Resizable>,
    );

    expect(screen.getByTestId("outer-resizable")).toHaveClass("resizable--horizontal");
    expect(screen.getByTestId("inner-resizable")).toHaveClass("resizable--vertical");
    expect(screen.getByRole("separator", {name: "Resize sidebar"})).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    expect(screen.getByRole("separator", {name: "Resize editor"})).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
  });

  it("forwards refs and class names to every part", () => {
    const group = {current: null as HTMLDivElement | null};
    const panel = {current: null as HTMLDivElement | null};
    const handle = {current: null as HTMLDivElement | null};

    render(
      <Resizable ref={group} className="custom-group">
        <Resizable.Panel ref={panel} className="custom-panel">
          Sidebar
        </Resizable.Panel>
        <Resizable.Handle ref={handle} className="custom-handle" />
        <Resizable.Panel>Main</Resizable.Panel>
      </Resizable>,
    );

    expect(group.current).toHaveClass("resizable", "resizable--horizontal", "custom-group");
    // The panel ref is the flex item; `className` lands on the scroll box nested inside it.
    expect(panel.current).toHaveAttribute("data-slot", "resizable-panel");
    expect(panel.current?.querySelector(".resizable__panel")).toHaveClass("custom-panel");
    expect(handle.current).toHaveClass("resizable__handle", "custom-handle");
    expect(handle.current).toHaveAttribute("role", "separator");
  });
});

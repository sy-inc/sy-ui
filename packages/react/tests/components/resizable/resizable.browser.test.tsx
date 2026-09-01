import type {ResizableHandleType} from "@/components/resizable";

import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Resizable} from "@/components/resizable";

import "../../../../styles/dist/sy-inc.min.css";

const Fixture = ({
  disabled = false,
  orientation = "horizontal",
}: {
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
}) => (
  <div style={orientation === "horizontal" ? {height: 240, width: 800} : {height: 800, width: 240}}>
    <Resizable orientation={orientation}>
      <Resizable.Panel defaultSize="30%" maxSize="60%" minSize="20%">
        Sidebar
      </Resizable.Panel>
      <Resizable.Handle disabled={disabled} />
      <Resizable.Panel minSize="40%">Main</Resizable.Panel>
    </Resizable>
  </div>
);

const handleTypes: ResizableHandleType[] = ["line", "drag", "pill"];

const TypesFixture = () => (
  <div style={{display: "grid", gap: 16}}>
    {handleTypes.map((type) => (
      <div key={type} style={{height: 120, width: 800}}>
        <Resizable>
          <Resizable.Panel>{type} left</Resizable.Panel>
          <Resizable.Handle aria-label={`${type} handle`} type={type} />
          <Resizable.Panel>{type} right</Resizable.Panel>
        </Resizable>
      </div>
    ))}
  </div>
);

describe("Resizable (browser)", () => {
  // The divider is 1px wide with a negative margin, so a real drag is the only way to prove
  // the styling did not shrink the library's hit region away.
  it("supports pointer drag and leaves the separator ready for the keyboard", async () => {
    await render(<Fixture />);
    const handle = page.getByRole("separator");
    const element = handle.element() as HTMLElement;

    const sidebar = page.getByText("Sidebar").element();
    const initialSidebar = sidebar.getBoundingClientRect();
    const initialHandle = element.getBoundingClientRect();

    await userEvent.dragAndDrop(handle, page.getByText("Main"));

    await expect.poll(() => Number(element.getAttribute("aria-valuenow"))).toBeGreaterThan(30);
    expect(sidebar.getBoundingClientRect().width).toBeGreaterThan(initialSidebar.width);
    expect(element.getBoundingClientRect().left).not.toBe(initialHandle.left);
    expect(element.getAttribute("data-separator")).not.toBe("active");

    // The library focuses the separator on pointer down so a mouse drag can be fine-tuned
    // with the arrow keys; nothing here may take that focus away again.
    expect(element).toHaveFocus();
    const afterDrag = element.getAttribute("aria-valuenow");

    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => element.getAttribute("aria-valuenow")).not.toBe(afterDrag);
  });

  it("supports vertical keyboard resizing and disabled handles", async () => {
    await render(<Fixture orientation="vertical" />);
    const verticalHandle = page.getByRole("separator");

    await expect.element(verticalHandle).toHaveAttribute("aria-orientation", "horizontal");
    verticalHandle.element().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .poll(() => Number(verticalHandle.element().getAttribute("aria-valuenow")))
      .toBeGreaterThan(30);

    await render(<Fixture disabled />);
    const disabledHandle = page.getByRole("separator").nth(1);
    const disabledSidebar = page.getByText("Sidebar").nth(1).element();
    const disabledWidth = disabledSidebar.getBoundingClientRect().width;

    await expect.element(disabledHandle).toHaveAttribute("data-separator", "disabled");
    // A disabled separator is static: not focusable and without a resize value.
    expect(disabledHandle.element()).not.toHaveAttribute("aria-valuenow");
    disabledHandle.element().focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(disabledSidebar.getBoundingClientRect().width).toBeCloseTo(disabledWidth, 1);
  });

  it("renders every handle type with a one-pixel divider", async () => {
    await render(<TypesFixture />);

    for (const type of handleTypes) {
      const handle = page.getByRole("separator", {name: `${type} handle`});

      expect(handle.element().getBoundingClientRect().width).toBeCloseTo(1, 1);

      const indicator = handle
        .element()
        .querySelector<HTMLElement>('[data-slot="resizable-handle-indicator"]');

      if (type === "line") {
        expect(indicator).toBeNull();
        continue;
      }

      expect(indicator).not.toBeNull();
      const rect = indicator!.getBoundingClientRect();

      if (type === "drag") {
        expect(rect.width).toBeCloseTo(13, 1);
        expect(rect.height).toBeCloseTo(20, 1);
      } else {
        expect(rect.width).toBeCloseTo(6, 1);
        expect(rect.height).toBeCloseTo(32, 1);
      }
    }
  });

  it("tints the divider while pressed but not while merely hovered", async () => {
    await render(<Fixture />);
    const handle = page.getByRole("separator");
    const element = handle.element();
    const idle = getComputedStyle(element).backgroundColor;
    const rect = element.getBoundingClientRect();
    const pointer = {
      bubbles: true,
      button: 0,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      isPrimary: true,
      pointerId: 1,
    };

    await userEvent.hover(handle);
    await expect.element(handle).toHaveAttribute("data-separator", "hover");
    expect(getComputedStyle(element).backgroundColor).toBe(idle);

    element.dispatchEvent(new PointerEvent("pointerdown", pointer));
    await expect.element(handle).toHaveAttribute("data-separator", "active");
    await expect.poll(() => getComputedStyle(element).backgroundColor).not.toBe(idle);

    element.dispatchEvent(new PointerEvent("pointerup", pointer));
    await expect.element(handle).not.toHaveAttribute("data-separator", "active");
    await expect.poll(() => getComputedStyle(element).backgroundColor).toBe(idle);

    // A real drag keeps the separator focused, and `:focus-visible` must not follow a
    // pointer, so the divider still has to fall back to its idle colour.
    await userEvent.dragAndDrop(handle, page.getByText("Main"));
    expect(element).toHaveFocus();
    expect(element.matches(":focus-visible")).toBe(false);
    await expect.poll(() => getComputedStyle(element).backgroundColor).toBe(idle);
  });

  it("marks keyboard focus with the accent divider and never a ring", async () => {
    await render(<Fixture />);
    const handle = page.getByRole("separator");
    const element = handle.element() as HTMLElement;
    const idle = getComputedStyle(element).backgroundColor;

    // A mouse press focuses the separator, but never tints it.
    await userEvent.click(handle);
    expect(element.matches(":focus-visible")).toBe(false);
    await expect.poll(() => getComputedStyle(element).backgroundColor).toBe(idle);

    // Chrome also makes the scrollable panels tabbable, so walk the tab order.
    element.blur();
    for (let i = 0; i < 5 && document.activeElement !== element; i++) {
      await userEvent.tab();
    }
    expect(element).toHaveFocus();
    expect(element.matches(":focus-visible")).toBe(true);
    expect(getComputedStyle(element).boxShadow).toBe("none");
    expect(getComputedStyle(element).outlineStyle).toBe("none");
    await expect.poll(() => getComputedStyle(element).backgroundColor).not.toBe(idle);
  });
});

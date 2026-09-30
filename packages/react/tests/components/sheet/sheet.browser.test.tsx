import {render} from "@sy-inc/testing/browser";
import {isDocumentScrollLocked} from "@sy-inc/testing/helpers";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {Sheet} from "@/components/sheet";

import {SheetFixture} from "./fixtures";

const dispatchDrag = (element: Element, start: number, end: number, vertical = true) => {
  const pointer = (type: string, value: number) =>
    element.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        button: 0,
        clientX: vertical ? 100 : value,
        clientY: vertical ? value : 100,
        pointerId: 1,
      }),
    );

  pointer("pointerdown", start);
  pointer("pointermove", end);
  pointer("pointerup", end);
};

const dispatchPointer = (element: Element, type: string, x: number, y: number) =>
  element.dispatchEvent(
    new PointerEvent(type, {bubbles: true, button: 0, clientX: x, clientY: y, pointerId: 1}),
  );

describe("Sheet (browser)", () => {
  it("supports portal focus trap, scroll lock, and Escape focus restore", async () => {
    await render(<SheetFixture />);

    const trigger = page.getByRole("button", {name: "Open Sheet"});

    await trigger.click();

    const dialog = page.getByRole("dialog", {name: "Sheet Title"});

    await expect.element(dialog).toBeInTheDocument();
    expect(isDocumentScrollLocked()).toBe(true);
    expect(dialog.element().contains(document.activeElement)).toBe(true);

    await userEvent.tab();
    expect(dialog.element().contains(document.activeElement)).toBe(true);

    await userEvent.keyboard("{Escape}");
    await expect.element(dialog).not.toBeInTheDocument();
    expect(isDocumentScrollLocked()).toBe(false);
    await expect.element(trigger).toHaveFocus();
  });

  it.each([
    ["bottom", true, 100, 600],
    ["top", true, 600, 100],
    ["left", false, 600, 100],
    ["right", false, 100, 600],
  ] as const)("supports %s drag-to-dismiss", async (placement, vertical, start, end) => {
    await render(<SheetFixture defaultOpen placement={placement} />);

    const dialog = page.getByRole("dialog", {name: "Sheet Title"});

    await expect.element(dialog).toBeInTheDocument();
    dispatchDrag(dialog.element(), start, end, vertical);

    await expect.element(dialog).not.toBeInTheDocument();
  });

  it.each([
    ["bottom", 100, 100, 100, 140, "translateY(40px)"],
    ["top", 100, 140, 100, 100, "translateY(-40px)"],
    ["left", 140, 100, 100, 100, "translateX(-40px)"],
    ["right", 100, 100, 140, 100, "translateX(40px)"],
  ] as const)(
    "applies %s drag transforms to the positioned content",
    async (placement, startX, startY, endX, endY, transform) => {
      await render(<SheetFixture defaultOpen placement={placement} />);

      const dialog = page.getByRole("dialog", {name: "Sheet Title"}).element();
      const content = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;

      dispatchPointer(dialog, "pointerdown", startX, startY);
      dispatchPointer(dialog, "pointermove", endX, endY);

      expect(content.style.transform).toBe(transform);
      expect(dialog.style.transform).toBe("");

      dispatchPointer(dialog, "pointerup", endX, endY);
    },
  );

  it("snaps to the nearest point after a non-dismiss drag and clears drag transform", async () => {
    await render(
      <SheetFixture defaultOpen defaultActiveSnapPoint={0.25} snapPoints={[0.25, 0.8]} />,
    );

    const dialog = page.getByRole("dialog", {name: "Sheet Title"});

    dispatchDrag(dialog.element(), 600, 100);

    await expect.element(dialog).toHaveAttribute("data-active-snap-point", "0.8");
    expect(dialog.element().style.transform).toBe("");
  });

  it("exposes backdrop visibility below fadeFromIndex", async () => {
    await render(
      <SheetFixture
        defaultOpen
        backdropVariant="blur"
        defaultActiveSnapPoint={0.25}
        snapPoints={[0.25, 0.8]}
      />,
    );

    const backdrop = document.querySelector<HTMLElement>('[data-slot="sheet-backdrop"]')!;

    expect(backdrop).toHaveAttribute("data-sheet-backdrop-visible", "false");

    (page.getByRole("button", {name: "Adjust sheet size"}).element() as HTMLElement).click();

    await expect
      .poll(() =>
        document
          .querySelector('[data-slot="sheet-backdrop"]')
          ?.getAttribute("data-sheet-backdrop-visible"),
      )
      .toBe("true");
  });

  it("reports drag and release callbacks", async () => {
    const onDrag = vi.fn();
    const onRelease = vi.fn();

    await render(
      <Sheet defaultOpen onDrag={onDrag} onRelease={onRelease}>
        <Sheet.Trigger>
          <Button variant="secondary">Open Sheet</Button>
        </Sheet.Trigger>
        <Sheet.Backdrop>
          <Sheet.Content>
            <Sheet.Dialog aria-label="Callback Sheet">
              <Sheet.Heading>Callback Sheet</Sheet.Heading>
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>,
    );

    dispatchDrag(page.getByRole("dialog", {name: "Callback Sheet"}).element(), 100, 120);

    expect(onDrag).toHaveBeenCalledTimes(1);
    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  describe("drag gestures", () => {
    const getContent = () => document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;

    it("ignores pointer movement below the drag threshold", async () => {
      const onDrag = vi.fn();
      const onActiveSnapPointChange = vi.fn();

      await render(
        <Sheet
          defaultOpen
          snapPoints={[0.5, 0.8]}
          onActiveSnapPointChange={onActiveSnapPointChange}
          onDrag={onDrag}
        >
          <Sheet.Trigger>
            <Button variant="secondary">Open Sheet</Button>
          </Sheet.Trigger>
          <Sheet.Backdrop>
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.Heading>Threshold Sheet</Sheet.Heading>
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>,
      );

      const dialog = page.getByRole("dialog", {name: "Threshold Sheet"}).element();

      dispatchPointer(dialog, "pointerdown", 100, 100);
      dispatchPointer(dialog, "pointermove", 100, 104);

      expect(getContent().style.transform).toBe("");

      dispatchPointer(dialog, "pointerup", 100, 104);

      expect(onDrag).not.toHaveBeenCalled();
      expect(onActiveSnapPointChange).not.toHaveBeenCalled();
    });

    it("only drags toward dismissal when no larger snap point exists", async () => {
      await render(<SheetFixture defaultOpen />);

      const dialog = page.getByRole("dialog", {name: "Sheet Title"}).element();

      dispatchPointer(dialog, "pointerdown", 100, 300);
      dispatchPointer(dialog, "pointermove", 100, 200);

      expect(getContent().style.transform).toBe("translateY(0px)");

      dispatchPointer(dialog, "pointerup", 100, 200);
    });

    it("resets the drag when the pointer is cancelled", async () => {
      await render(<SheetFixture defaultOpen />);

      const dialog = page.getByRole("dialog", {name: "Sheet Title"});
      const content = getContent();

      dispatchPointer(dialog.element(), "pointerdown", 100, 100);
      dispatchPointer(dialog.element(), "pointermove", 100, 140);
      expect(content.style.transform).toBe("translateY(40px)");

      dispatchPointer(dialog.element(), "pointercancel", 100, 140);

      expect(content.style.transform).toBe("");
      await expect.element(dialog).toBeInTheDocument();
      await expect.poll(() => content.hasAttribute("data-dragging")).toBe(false);
    });

    it("drags only the nested sheet the gesture started in", async () => {
      await render(
        <Sheet defaultOpen>
          <Sheet.Trigger>
            <Button variant="secondary">Open parent</Button>
          </Sheet.Trigger>
          <Sheet.Backdrop>
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.Heading>Parent</Sheet.Heading>
                <Sheet.NestedRoot>
                  <Sheet.Trigger>
                    <Button variant="secondary">Open child</Button>
                  </Sheet.Trigger>
                  <Sheet.Backdrop>
                    <Sheet.Content>
                      <Sheet.Dialog>
                        <Sheet.Heading>Child</Sheet.Heading>
                      </Sheet.Dialog>
                    </Sheet.Content>
                  </Sheet.Backdrop>
                </Sheet.NestedRoot>
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>,
      );

      await page.getByRole("button", {name: "Open child"}).click();

      const child = page.getByRole("dialog", {name: "Child"}).element();
      const parent = page.getByRole("dialog", {name: "Parent"}).element();
      const contentOf = (dialog: Element) =>
        dialog.closest<HTMLElement>('[data-slot="sheet-content"]')!;

      dispatchPointer(child, "pointerdown", 100, 100);
      dispatchPointer(child, "pointermove", 100, 140);

      expect(contentOf(child).style.transform).toBe("translateY(40px)");
      expect(contentOf(parent).style.transform).toBe("");

      dispatchPointer(child, "pointerup", 100, 140);
    });
  });

  it("supports detached sheets and restricts handle-only dragging to the handle", async () => {
    await render(<SheetFixture defaultOpen isDetached isHandleOnly />);

    const dialog = page.getByRole("dialog", {name: "Sheet Title"});

    await expect.element(dialog).toHaveAttribute("data-detached", "true");
    dispatchDrag(dialog.element(), 100, 600);
    await expect.element(dialog).toBeInTheDocument();

    const handle = page.getByRole("button", {name: "Adjust sheet size"});

    dispatchDrag(handle.element(), 100, 600);
    await expect.element(dialog).not.toBeInTheDocument();
  });

  it("supports nested sheets without closing the parent and restores child focus", async () => {
    await render(
      <Sheet defaultOpen snapPoints={[0.5, 0.8]}>
        <Sheet.Trigger>
          <Button variant="secondary">Open parent</Button>
        </Sheet.Trigger>
        <Sheet.Backdrop>
          <Sheet.Content>
            <Sheet.Dialog>
              <Sheet.Heading>Parent</Sheet.Heading>
              <Sheet.NestedRoot>
                <Sheet.Trigger>
                  <Button variant="secondary">Open child</Button>
                </Sheet.Trigger>
                <Sheet.Backdrop>
                  <Sheet.Content>
                    <Sheet.Dialog>
                      <Sheet.CloseTrigger />
                      <Sheet.Heading>Child</Sheet.Heading>
                    </Sheet.Dialog>
                  </Sheet.Content>
                </Sheet.Backdrop>
              </Sheet.NestedRoot>
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>,
    );

    const parent = page.getByRole("dialog", {name: "Parent"});
    const trigger = page.getByRole("button", {name: "Open child"});

    await trigger.click();

    const child = page.getByRole("dialog", {name: "Child"});

    await expect.element(child).toBeInTheDocument();
    await expect.element(parent).toHaveAttribute("data-nested-open", "true");

    const parentContent = document.querySelectorAll<HTMLElement>('[data-slot="sheet-content"]')[0]!;

    expect(parentContent).toHaveAttribute("data-nested-open", "true");

    await page.getByRole("button", {name: "Close"}).click();
    await expect.element(child).not.toBeInTheDocument();
    await expect.element(parent).toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it("keeps non-modal backgrounds interactive and reference-counts background scale", async () => {
    const onBackgroundPress = vi.fn();

    await render(
      <div data-sheet-background>
        <Button onPress={onBackgroundPress}>Background action</Button>
        <Sheet shouldScaleBackground isModal={false}>
          <Sheet.Trigger>
            <Button variant="secondary">Open non-modal</Button>
          </Sheet.Trigger>
          <Sheet.Backdrop>
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.CloseTrigger />
                <Sheet.Heading>Non-modal</Sheet.Heading>
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>
      </div>,
    );

    await page.getByRole("button", {name: "Open non-modal"}).click();
    const background = document.querySelector("[data-sheet-background]")!;

    expect(background).toHaveAttribute("data-sheet-background-scaled", "true");
    expect(isDocumentScrollLocked()).toBe(false);

    await page.getByRole("button", {name: "Background action"}).click();
    expect(onBackgroundPress).toHaveBeenCalledTimes(1);

    await page.getByRole("button", {name: "Close"}).click();
    expect(background).not.toHaveAttribute("data-sheet-background-scaled");
  });

  it("keeps background scaling through nested close and removes it on unmount", async () => {
    const result = await render(
      <div data-sheet-background>
        <Sheet defaultOpen shouldScaleBackground>
          <Sheet.Trigger>
            <Button variant="secondary">Open scale parent</Button>
          </Sheet.Trigger>
          <Sheet.Backdrop>
            <Sheet.Content>
              <Sheet.Dialog>
                <Sheet.Heading>Scale parent</Sheet.Heading>
                <Sheet.NestedRoot shouldScaleBackground>
                  <Sheet.Trigger>
                    <Button variant="secondary">Open scale child</Button>
                  </Sheet.Trigger>
                  <Sheet.Backdrop>
                    <Sheet.Content>
                      <Sheet.Dialog>
                        <Sheet.Heading>Scale child</Sheet.Heading>
                      </Sheet.Dialog>
                    </Sheet.Content>
                  </Sheet.Backdrop>
                </Sheet.NestedRoot>
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>
      </div>,
    );

    const background = document.querySelector("[data-sheet-background]")!;

    expect(background).toHaveAttribute("data-sheet-background-scaled", "true");

    await page.getByRole("button", {name: "Open scale child"}).click();
    await userEvent.keyboard("{Escape}");
    expect(background).toHaveAttribute("data-sheet-background-scaled", "true");

    result.unmount();
    expect(background).not.toHaveAttribute("data-sheet-background-scaled");
  });
});

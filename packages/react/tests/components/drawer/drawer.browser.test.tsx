import {render} from "@sy-inc/testing/browser";
import {isDocumentScrollLocked} from "@sy-inc/testing/helpers";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {Drawer} from "@/components/drawer";

import "../../../../styles/dist/sy-inc.min.css";

import {DrawerFixture} from "./fixtures";

const dispatchDrag = (element: Element, start: number, end: number, vertical = true) => {
  const pointer = (type: string, value: number) =>
    element.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        button: 0,
        buttons: 1,
        clientX: vertical ? 100 : value,
        clientY: vertical ? value : 100,
        pointerId: 1,
      }),
    );

  pointer("pointerdown", start);
  pointer("pointermove", end);
  pointer("pointerup", end);
};

const dispatchPointer = (element: Element, type: string, x: number, y: number, buttons = 1) =>
  element.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      button: 0,
      buttons,
      clientX: x,
      clientY: y,
      pointerId: 1,
    }),
  );

describe("Drawer (browser)", () => {
  it("respects consumer percentage max-height when selecting a snap point", async () => {
    const onActiveSnapPointChange = vi.fn();

    await render(
      <Drawer
        defaultOpen
        defaultActiveSnapPoint={0.25}
        isDismissable={false}
        snapPoints={[0.25, 0.8]}
        onActiveSnapPointChange={onActiveSnapPointChange}
      >
        <Drawer.Backdrop>
          <Drawer.Content style={{maxHeight: "50%"}}>
            <Drawer.Dialog aria-label="Bounded snaps">
              <Drawer.Heading>Bounded snaps</Drawer.Heading>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>,
    );
    dispatchDrag(
      page.getByRole("dialog", {name: "Bounded snaps"}).element(),
      window.innerHeight * 0.3,
      window.innerHeight * 0.1,
    );
    expect(onActiveSnapPointChange).toHaveBeenCalledWith(0.8);
  });

  it("respects consumer calc max-height when selecting a snap point", async () => {
    const onActiveSnapPointChange = vi.fn();

    await render(
      <Drawer
        defaultOpen
        defaultActiveSnapPoint={0.25}
        isDismissable={false}
        snapPoints={[0.25, "calc(100% - 4rem)", 1]}
        onActiveSnapPointChange={onActiveSnapPointChange}
      >
        <Drawer.Backdrop>
          <Drawer.Content style={{maxHeight: "calc(100% - 2rem)"}}>
            <Drawer.Dialog aria-label="Calc bounded snaps">
              <Drawer.Heading>Calc bounded snaps</Drawer.Heading>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>,
    );
    const height = window.innerHeight;
    const start = height * 0.9;

    // Target height - 40px: nearer the capped 1 (height - 32px) than the calc point (height - 64px).
    dispatchDrag(
      page.getByRole("dialog", {name: "Calc bounded snaps"}).element(),
      start,
      start - (height - 40 - height * 0.25),
    );
    expect(onActiveSnapPointChange).toHaveBeenCalledWith(1);
  });

  it("resolves CSS calc snap targets in the positioned panel's containing block", async () => {
    await render(
      <DrawerFixture
        defaultOpen
        isDismissable={false}
        snapPoints={["10rem", "calc(100% - 100px)"]}
      />,
    );
    const dialog = page.getByRole("dialog", {name: "Drawer Title"});
    const extent = window.innerHeight - 100;
    const desired = (160 + extent) / 2 - 25;

    dispatchDrag(dialog.element(), 100, 100 + extent - desired);
    await expect.element(dialog).toHaveAttribute("data-active-snap-point", "10rem");
  });

  it("reports a controlled snap request without changing the selected point", async () => {
    const onActiveSnapPointChange = vi.fn();
    const result = await render(
      <DrawerFixture
        defaultOpen
        activeSnapPoint={0.25}
        isDismissable={false}
        snapPoints={[0.25, 0.8]}
        onActiveSnapPointChange={onActiveSnapPointChange}
      />,
    );
    const dialog = page.getByRole("dialog", {name: "Drawer Title"});

    dispatchDrag(dialog.element(), 600, 100);
    expect(onActiveSnapPointChange).toHaveBeenCalledWith(0.8);
    await expect.element(dialog).toHaveAttribute("data-active-snap-point", "0.25");
    await result.rerender(
      <DrawerFixture
        defaultOpen
        activeSnapPoint={0.8}
        isDismissable={false}
        snapPoints={[0.25, 0.8]}
        onActiveSnapPointChange={onActiveSnapPointChange}
      />,
    );
    await expect.element(dialog).toHaveAttribute("data-active-snap-point", "0.8");
  });

  it("supports Enter and Space snap adjustment on the handle", async () => {
    await render(
      <DrawerFixture defaultOpen defaultActiveSnapPoint={0.25} snapPoints={[0.25, 0.5, 0.8]} />,
    );
    const handle = page.getByRole("button", {name: "Adjust drawer size"});

    (handle.element() as HTMLElement).focus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(page.getByRole("dialog", {name: "Drawer Title"}))
      .toHaveAttribute("data-active-snap-point", "0.5");
    await userEvent.keyboard(" ");
    await expect
      .element(page.getByRole("dialog", {name: "Drawer Title"}))
      .toHaveAttribute("data-active-snap-point", "0.8");
  });

  it("ignores child capture loss and snaps back only when Content loses capture", async () => {
    const onRelease = vi.fn();

    await render(
      <Drawer defaultOpen onRelease={onRelease}>
        <Drawer.Backdrop>
          <Drawer.Content>
            <Drawer.Dialog aria-label="Capture drawer">
              <Drawer.Heading>Capture drawer</Drawer.Heading>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>,
    );
    const dialog = page.getByRole("dialog", {name: "Capture drawer"}).element();
    const content = dialog.closest<HTMLElement>('[data-slot="drawer-content"]')!;

    dispatchPointer(dialog, "pointerdown", 100, 100);
    dispatchPointer(dialog, "pointermove", 100, 140);
    dispatchPointer(dialog, "lostpointercapture", 100, 140);
    expect(content.style.transform).toBe("translateY(40px)");
    dispatchPointer(content, "lostpointercapture", 100, 140);
    expect(content.style.transform).toBe("");
    await expect.poll(() => content.hasAttribute("data-dragging")).toBe(false);
    expect(onRelease).toHaveBeenCalledTimes(1);
    expect(dialog).toBeInTheDocument();
    dispatchPointer(dialog, "pointerup", 100, 600);
    expect(dialog).toBeInTheDocument();
    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  it("resolves relative snap targets against the viewport on release", async () => {
    await render(
      <DrawerFixture
        defaultOpen
        defaultActiveSnapPoint={0.5}
        isDismissable={false}
        snapPoints={[0.5, 0.8]}
      />,
    );
    const dialog = page.getByRole("dialog", {name: "Drawer Title"});

    // A short expansion stays at 50%; measuring against the current 50% panel selects 80%.
    dispatchDrag(dialog.element(), 100, 80);
    await expect.element(dialog).toHaveAttribute("data-active-snap-point", "0.5");
  });

  it("merges consumer pointer handlers with drag recovery", async () => {
    const onPointerMove = vi.fn();

    await render(
      <Drawer defaultOpen>
        <Drawer.Backdrop>
          <Drawer.Content onPointerMove={onPointerMove}>
            <Drawer.Dialog aria-label="Merged handlers">
              <Drawer.Heading>Merged handlers</Drawer.Heading>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>,
    );
    const dialog = page.getByRole("dialog", {name: "Merged handlers"}).element();
    const content = dialog.closest<HTMLElement>('[data-slot="drawer-content"]')!;

    dispatchPointer(dialog, "pointerdown", 100, 100);
    dispatchPointer(dialog, "pointermove", 100, 140);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(content.style.transform).toBe("translateY(40px)");
    dispatchPointer(content, "pointercancel", 100, 140);
    expect(content.style.transform).toBe("");
  });

  it("supports portal focus trap, scroll lock, and Escape focus restore", async () => {
    await render(<DrawerFixture />);

    const trigger = page.getByRole("button", {name: "Open Drawer"});

    await trigger.click();

    const dialog = page.getByRole("dialog", {name: "Drawer Title"});

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
    await render(<DrawerFixture defaultOpen placement={placement} />);

    const dialog = page.getByRole("dialog", {name: "Drawer Title"});

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
      await render(<DrawerFixture defaultOpen placement={placement} />);

      const dialog = page.getByRole("dialog", {name: "Drawer Title"}).element();
      const content = document.querySelector<HTMLElement>('[data-slot="drawer-content"]')!;

      dispatchPointer(dialog, "pointerdown", startX, startY);
      dispatchPointer(dialog, "pointermove", endX, endY);

      expect(content.style.transform).toBe(transform);
      expect(dialog.style.transform).toBe("");

      dispatchPointer(dialog, "pointerup", endX, endY);
    },
  );

  it("snaps to the nearest point after a non-dismiss drag and clears drag transform", async () => {
    await render(
      <DrawerFixture defaultOpen defaultActiveSnapPoint={0.25} snapPoints={[0.25, 0.8]} />,
    );

    const dialog = page.getByRole("dialog", {name: "Drawer Title"});

    dispatchDrag(dialog.element(), 600, 100);

    await expect.element(dialog).toHaveAttribute("data-active-snap-point", "0.8");
    expect(dialog.element().style.transform).toBe("");
  });

  it("supports dragging from the interactive snap point handle", async () => {
    await render(
      <DrawerFixture defaultOpen defaultActiveSnapPoint={0.25} snapPoints={[0.25, 0.8]} />,
    );

    const dialog = page.getByRole("dialog", {name: "Drawer Title"});

    dispatchDrag(page.getByRole("button", {name: "Adjust drawer size"}).element(), 600, 100);

    await expect.element(dialog).toHaveAttribute("data-active-snap-point", "0.8");
  });

  it("shows the backdrop at every snap point by default", async () => {
    await render(
      <DrawerFixture defaultOpen defaultActiveSnapPoint={0.25} snapPoints={[0.25, 0.8]} />,
    );

    expect(document.querySelector('[data-slot="drawer-backdrop"]')).toHaveAttribute(
      "data-drawer-backdrop-visible",
      "true",
    );
  });

  it("exposes backdrop visibility below fadeFromIndex", async () => {
    await render(
      <DrawerFixture
        defaultOpen
        backdropVariant="blur"
        defaultActiveSnapPoint={0.25}
        fadeFromIndex={1}
        snapPoints={[0.25, 0.8]}
      />,
    );

    const backdrop = document.querySelector<HTMLElement>('[data-slot="drawer-backdrop"]')!;

    expect(backdrop).toHaveAttribute("data-drawer-backdrop-visible", "false");

    (page.getByRole("button", {name: "Adjust drawer size"}).element() as HTMLElement).click();

    await expect
      .poll(() =>
        document
          .querySelector('[data-slot="drawer-backdrop"]')
          ?.getAttribute("data-drawer-backdrop-visible"),
      )
      .toBe("true");
  });

  it("reports drag and release callbacks", async () => {
    const onDrag = vi.fn();
    const onRelease = vi.fn();

    await render(
      <Drawer defaultOpen onDrag={onDrag} onRelease={onRelease}>
        <Button variant="secondary">Open Drawer</Button>
        <Drawer.Backdrop>
          <Drawer.Content>
            <Drawer.Dialog aria-label="Callback Drawer">
              <Drawer.Heading>Callback Drawer</Drawer.Heading>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>,
    );

    dispatchDrag(page.getByRole("dialog", {name: "Callback Drawer"}).element(), 100, 120);

    expect(onDrag).toHaveBeenCalledTimes(1);
    expect(onRelease).toHaveBeenCalledTimes(1);
  });

  describe("drag gestures", () => {
    const getContent = () => document.querySelector<HTMLElement>('[data-slot="drawer-content"]')!;

    it("ignores pointer movement below the drag threshold", async () => {
      const onDrag = vi.fn();
      const onActiveSnapPointChange = vi.fn();

      await render(
        <Drawer
          defaultOpen
          snapPoints={[0.5, 0.8]}
          onActiveSnapPointChange={onActiveSnapPointChange}
          onDrag={onDrag}
        >
          <Button variant="secondary">Open Drawer</Button>
          <Drawer.Backdrop>
            <Drawer.Content>
              <Drawer.Dialog>
                <Drawer.Heading>Threshold Drawer</Drawer.Heading>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>,
      );

      const dialog = page.getByRole("dialog", {name: "Threshold Drawer"}).element();

      dispatchPointer(dialog, "pointerdown", 100, 100);
      dispatchPointer(dialog, "pointermove", 100, 104);

      expect(getContent().style.transform).toBe("");

      dispatchPointer(dialog, "pointerup", 100, 104);

      expect(onDrag).not.toHaveBeenCalled();
      expect(onActiveSnapPointChange).not.toHaveBeenCalled();
    });

    it("only drags toward dismissal when no larger snap point exists", async () => {
      await render(<DrawerFixture defaultOpen />);

      const dialog = page.getByRole("dialog", {name: "Drawer Title"}).element();

      dispatchPointer(dialog, "pointerdown", 100, 300);
      dispatchPointer(dialog, "pointermove", 100, 200);

      expect(getContent().style.transform).toBe("translateY(0px)");

      dispatchPointer(dialog, "pointerup", 100, 200);
    });

    it("ignores drags that can neither dismiss nor change snap point", async () => {
      await render(<DrawerFixture defaultOpen isDismissable={false} />);

      const dialog = page.getByRole("dialog", {name: "Drawer Title"});

      dispatchPointer(dialog.element(), "pointerdown", 100, 100);
      dispatchPointer(dialog.element(), "pointermove", 100, 600);

      expect(getContent().style.transform).toBe("");

      dispatchPointer(dialog.element(), "pointerup", 100, 600);
      await expect.element(dialog).toBeInTheDocument();
    });

    it("resets the drag when the pointer is cancelled", async () => {
      await render(<DrawerFixture defaultOpen />);

      const dialog = page.getByRole("dialog", {name: "Drawer Title"});
      const content = getContent();

      dispatchPointer(dialog.element(), "pointerdown", 100, 100);
      dispatchPointer(dialog.element(), "pointermove", 100, 140);
      expect(content.style.transform).toBe("translateY(40px)");

      dispatchPointer(dialog.element(), "pointercancel", 100, 140);

      expect(content.style.transform).toBe("");
      await expect.element(dialog).toBeInTheDocument();
      await expect.poll(() => content.hasAttribute("data-dragging")).toBe(false);
    });

    it("abandons a press released outside Content before the drag threshold", async () => {
      await render(<DrawerFixture defaultOpen />);

      const dialog = page.getByRole("dialog", {name: "Drawer Title"}).element();
      const content = getContent();

      dispatchPointer(dialog, "pointerdown", 100, 100);
      // Its pointerup landed outside Content; the next hover move arrives with no button pressed.
      dispatchPointer(dialog, "pointermove", 100, 140, 0);
      expect(content.style.transform).toBe("");

      dispatchPointer(dialog, "pointerdown", 100, 200);
      dispatchPointer(dialog, "pointermove", 100, 240);
      expect(content.style.transform).toBe("translateY(40px)");
      dispatchPointer(dialog, "pointercancel", 100, 240);
    });

    it("drags only the nested drawer the gesture started in", async () => {
      await render(
        <Drawer defaultOpen>
          <Button variant="secondary">Open parent</Button>
          <Drawer.Backdrop>
            <Drawer.Content>
              <Drawer.Dialog>
                <Drawer.Heading>Parent</Drawer.Heading>
                <Drawer>
                  <Button variant="secondary">Open child</Button>
                  <Drawer.Backdrop>
                    <Drawer.Content>
                      <Drawer.Dialog>
                        <Drawer.Heading>Child</Drawer.Heading>
                      </Drawer.Dialog>
                    </Drawer.Content>
                  </Drawer.Backdrop>
                </Drawer>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>,
      );

      await page.getByRole("button", {name: "Open child"}).click();

      const child = page.getByRole("dialog", {name: "Child"}).element();
      const parent = page.getByRole("dialog", {name: "Parent"}).element();
      const contentOf = (dialog: Element) =>
        dialog.closest<HTMLElement>('[data-slot="drawer-content"]')!;

      dispatchPointer(child, "pointerdown", 100, 100);
      dispatchPointer(child, "pointermove", 100, 140);

      expect(contentOf(child).style.transform).toBe("translateY(40px)");
      expect(contentOf(parent).style.transform).toBe("");

      dispatchPointer(child, "pointerup", 100, 140);
    });
  });

  it("supports detached drawers and restricts handle-only dragging to the handle", async () => {
    await render(<DrawerFixture defaultOpen isDetached isHandleOnly />);

    const dialog = page.getByRole("dialog", {name: "Drawer Title"});

    await expect.element(dialog).toHaveAttribute("data-detached", "true");
    dispatchDrag(dialog.element(), 100, 600);
    await expect.element(dialog).toBeInTheDocument();

    // Without snap points the handle is decorative (aria-hidden), so query it by slot.
    const handle = document.querySelector('[data-slot="drawer-handle"]')!;

    dispatchDrag(handle, 100, 600);
    await expect.element(dialog).not.toBeInTheDocument();
  });

  it("supports nested drawers without closing the parent and restores child focus", async () => {
    await render(
      <Drawer defaultOpen snapPoints={[0.5, 0.8]}>
        <Button variant="secondary">Open parent</Button>
        <Drawer.Backdrop>
          <Drawer.Content>
            <Drawer.Dialog>
              <Drawer.Heading>Parent</Drawer.Heading>
              <Drawer>
                <Button variant="secondary">Open child</Button>
                <Drawer.Backdrop>
                  <Drawer.Content>
                    <Drawer.Dialog>
                      <Drawer.CloseTrigger />
                      <Drawer.Heading>Child</Drawer.Heading>
                    </Drawer.Dialog>
                  </Drawer.Content>
                </Drawer.Backdrop>
              </Drawer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>,
    );

    const parent = page.getByRole("dialog", {name: "Parent"});
    const trigger = page.getByRole("button", {name: "Open child"});

    await trigger.click();

    const child = page.getByRole("dialog", {name: "Child"});

    await expect.element(child).toBeInTheDocument();
    await expect.element(parent).toHaveAttribute("data-nested-open", "true");

    const parentContent = document.querySelectorAll<HTMLElement>(
      '[data-slot="drawer-content"]',
    )[0]!;

    expect(parentContent).toHaveAttribute("data-nested-open", "true");

    await page.getByRole("button", {name: "Close"}).click();
    await expect.element(child).not.toBeInTheDocument();
    await expect.element(parent).toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });

  it("keeps non-modal backgrounds interactive and reference-counts background scale", async () => {
    const onBackgroundPress = vi.fn();

    await render(
      <div data-drawer-background style={{minHeight: "100vh"}}>
        <Button onPress={onBackgroundPress}>Background action</Button>
        <Drawer shouldScaleBackground isModal={false}>
          <Button variant="secondary">Open non-modal</Button>
          <Drawer.Backdrop>
            <Drawer.Content>
              <Drawer.Dialog>
                <Drawer.CloseTrigger />
                <Drawer.Heading>Non-modal</Drawer.Heading>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>,
    );

    await page.getByRole("button", {name: "Open non-modal"}).click();
    const background = document.querySelector("[data-drawer-background]")!;

    expect(background).toHaveAttribute("data-drawer-background-scaled", "true");
    expect(isDocumentScrollLocked()).toBe(false);

    await page.getByRole("button", {name: "Background action"}).click();
    expect(onBackgroundPress).toHaveBeenCalledTimes(1);

    await page.getByRole("button", {name: "Close"}).click();
    expect(background).not.toHaveAttribute("data-drawer-background-scaled");
  });

  it("keeps background scaling through nested close and removes it on unmount", async () => {
    const result = await render(
      <div data-drawer-background>
        <Drawer defaultOpen shouldScaleBackground>
          <Button variant="secondary">Open scale parent</Button>
          <Drawer.Backdrop>
            <Drawer.Content>
              <Drawer.Dialog>
                <Drawer.Heading>Scale parent</Drawer.Heading>
                <Drawer shouldScaleBackground>
                  <Button variant="secondary">Open scale child</Button>
                  <Drawer.Backdrop>
                    <Drawer.Content>
                      <Drawer.Dialog>
                        <Drawer.Heading>Scale child</Drawer.Heading>
                      </Drawer.Dialog>
                    </Drawer.Content>
                  </Drawer.Backdrop>
                </Drawer>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>,
    );

    const background = document.querySelector("[data-drawer-background]")!;

    expect(background).toHaveAttribute("data-drawer-background-scaled", "true");

    await page.getByRole("button", {name: "Open scale child"}).click();
    await userEvent.keyboard("{Escape}");
    expect(background).toHaveAttribute("data-drawer-background-scaled", "true");

    result.unmount();
    expect(background).not.toHaveAttribute("data-drawer-background-scaled");
  });
});

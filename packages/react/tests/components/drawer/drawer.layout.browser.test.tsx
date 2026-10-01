import {render} from "@sy-inc/testing/browser";

import {Drawer} from "@/components/drawer";

import "../../../../styles/dist/sy-inc.min.css";

import {DrawerFixture} from "./fixtures";

describe("Drawer layout (browser)", () => {
  it.each([
    ["top", "horizontal"],
    ["bottom", "horizontal"],
    ["left", "vertical"],
    ["right", "vertical"],
  ] as const)("keeps detached %s drawers inside the viewport", async (placement, axis) => {
    await render(<DrawerFixture defaultOpen isDetached placement={placement} />);

    const content = document.querySelector<HTMLElement>('[data-slot="drawer-content"]')!;
    const rect = content.getBoundingClientRect();

    if (axis === "horizontal") {
      expect(rect.left).toBe(8);
      expect(window.innerWidth - rect.right).toBe(8);
    } else {
      expect(rect.top).toBe(8);
      expect(window.innerHeight - rect.bottom).toBe(8);
    }
  });

  describe("side panel width", () => {
    const renderSide = ({
      contentWidth,
      dialogWidth,
      snapPoints,
    }: {contentWidth?: number; dialogWidth?: number; snapPoints?: number[]} = {}) =>
      render(
        <Drawer defaultOpen placement="right" snapPoints={snapPoints}>
          <Drawer.Backdrop>
            <Drawer.Content style={contentWidth ? {width: contentWidth} : undefined}>
              <Drawer.Dialog style={dialogWidth ? {width: dialogWidth} : undefined}>
                <Drawer.Heading>Side</Drawer.Heading>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>,
      );
    // offset* metrics ignore the entering transform, so layout can be read mid-animation.
    const widths = () => {
      const content = document.querySelector<HTMLElement>('[data-slot="drawer-content"]')!;
      const dialog = document.querySelector<HTMLElement>('[data-slot="drawer-dialog"]')!;

      // The dialog must fill the content exactly and the panel stay pinned to the right edge.
      expect(dialog.offsetLeft).toBe(0);
      expect(dialog.offsetWidth).toBe(content.offsetWidth);
      expect(content.offsetLeft + content.offsetWidth).toBe(window.innerWidth);

      return content.offsetWidth;
    };

    it("renders the default width", async () => {
      await renderSide();
      expect(widths()).toBe(window.innerWidth >= 640 ? 384 : 320);
    });

    it("supports a width set on Dialog", async () => {
      await renderSide({dialogWidth: 280});
      expect(widths()).toBe(280);
    });

    it("supports a width set on Content", async () => {
      await renderSide({contentWidth: 360});
      expect(widths()).toBe(360);
    });

    it("sizes the panel from the active snap point", async () => {
      await renderSide({snapPoints: [0.25, 0.5]});
      expect(widths()).toBe(window.innerWidth * 0.5);
    });
  });

  it("keeps the panel visible while the scrim is hidden below fadeFromIndex", async () => {
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

    // The panel lives inside the backdrop, so the backdrop itself must stay opaque.
    await expect.poll(() => getComputedStyle(backdrop).opacity).toBe("1");
    expect(getComputedStyle(backdrop).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(backdrop).backdropFilter).toBe("none");

    document.querySelector<HTMLElement>('[data-slot="drawer-handle"]')!.click();

    await expect.poll(() => getComputedStyle(backdrop).backdropFilter).not.toBe("none");
    await expect
      .poll(() => getComputedStyle(backdrop).backgroundColor)
      .not.toBe("rgba(0, 0, 0, 0)");
  });

  it("renders no scrim over the interactive page in non-modal mode", async () => {
    await render(<DrawerFixture defaultOpen backdropVariant="blur" isModal={false} />);

    const backdrop = document.querySelector<HTMLElement>('[data-slot="drawer-backdrop"]')!;

    expect(getComputedStyle(backdrop).pointerEvents).toBe("none");
    expect(getComputedStyle(backdrop).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(backdrop).backdropFilter).toBe("none");
  });

  it("hands touch gestures to the drag handler while keeping the body scrollable", async () => {
    await render(<DrawerFixture defaultOpen />);

    const content = document.querySelector<HTMLElement>('[data-slot="drawer-content"]')!;
    const body = document.querySelector<HTMLElement>('[data-slot="drawer-body"]')!;

    expect(getComputedStyle(content).touchAction).toBe("none");
    expect(getComputedStyle(body).touchAction).toBe("auto");
  });
});

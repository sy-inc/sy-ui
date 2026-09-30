import {render} from "@sy-inc/testing/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {SheetFixture} from "./fixtures";

describe("Sheet layout (browser)", () => {
  it.each([
    ["top", "horizontal"],
    ["bottom", "horizontal"],
    ["left", "vertical"],
    ["right", "vertical"],
  ] as const)("keeps detached %s sheets inside the viewport", async (placement, axis) => {
    await render(<SheetFixture defaultOpen isDetached placement={placement} />);

    const content = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    const rect = content.getBoundingClientRect();

    if (axis === "horizontal") {
      expect(rect.left).toBe(8);
      expect(window.innerWidth - rect.right).toBe(8);
    } else {
      expect(rect.top).toBe(8);
      expect(window.innerHeight - rect.bottom).toBe(8);
    }
  });

  it("hands touch gestures to the drag handler while keeping the body scrollable", async () => {
    await render(<SheetFixture defaultOpen />);

    const content = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')!;
    const body = document.querySelector<HTMLElement>('[data-slot="sheet-body"]')!;

    expect(getComputedStyle(content).touchAction).toBe("none");
    expect(getComputedStyle(body).touchAction).toBe("auto");
  });
});

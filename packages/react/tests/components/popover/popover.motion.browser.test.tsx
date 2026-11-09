import {render} from "@sy-inc/testing/browser";
import {useContext} from "react";
import {PopoverContext as RACPopoverContext} from "react-aria-components/Popover";
import {page} from "vitest/browser";

import {Button} from "@/components/button";
import {Popover} from "@/components/popover";

import "../../../../styles/dist/sy-inc.min.css";

function SlottedOptions({
  children,
  ...options
}: React.PropsWithChildren<Pick<Popover["ContentProps"], "render" | "shouldSkipAnimation">>) {
  const context = useContext(RACPopoverContext);

  return (
    <RACPopoverContext value={{...context, slots: {custom: {...context, ...options}}}}>
      {children}
    </RACPopoverContext>
  );
}

function RetainedPopover({
  isOpen,
  opacity,
  skip,
  slotted = false,
}: {
  isOpen: boolean;
  opacity?: number;
  skip?: boolean;
  slotted?: boolean;
}) {
  return (
    <Popover isOpen={isOpen}>
      <Button>Open retained</Button>
      <SlottedOptions shouldSkipAnimation={slotted ? skip : undefined}>
        <Popover.Content
          isExiting
          shouldSkipAnimation={slotted ? undefined : skip}
          slot="custom"
          style={{opacity}}
        >
          <Popover.Dialog aria-label="Retained popover">
            <Button>Inside</Button>
          </Popover.Dialog>
        </Popover.Content>
      </SlottedOptions>
    </Popover>
  );
}

describe("Popover motion (browser)", () => {
  it.each([undefined, 0.45])(
    "restores original opacity %s when retained content reopens",
    async (opacity) => {
      const result = await render(<RetainedPopover isOpen opacity={opacity} />);
      const content = page.getByRole("dialog", {name: "Retained popover"}).element().parentElement!;

      await result.rerender(<RetainedPopover isOpen={false} opacity={opacity} />);
      await expect.poll(() => content.style.opacity).toBe("0");
      await result.rerender(<RetainedPopover isOpen opacity={opacity} />);
      await expect
        .poll(() => content.style.opacity)
        .toBe(opacity === undefined ? "" : String(opacity));
      await expect.poll(() => Number(getComputedStyle(content).opacity)).toBe(opacity ?? 1);
    },
  );

  it("preserves newly supplied opacity when retained content reopens", async () => {
    const result = await render(<RetainedPopover isOpen opacity={0.45} />);
    const content = page.getByRole("dialog", {name: "Retained popover"}).element().parentElement!;

    await result.rerender(<RetainedPopover isOpen={false} opacity={0.45} />);
    await expect.poll(() => content.style.opacity).toBe("0");
    await result.rerender(<RetainedPopover isOpen opacity={0.75} />);
    expect(content.style.opacity).toBe("0.75");
  });

  it.each([false, true])("follows animation skip preferences (slotted: %s)", async (slotted) => {
    const result = await render(<RetainedPopover isOpen skip slotted={slotted} />);
    const content = page.getByRole("dialog", {name: "Retained popover"}).element().parentElement!;

    await result.rerender(<RetainedPopover skip isOpen={false} slotted={slotted} />);
    // Explicit isExiting retains the DOM; skipping the hook must not pin its opacity.
    await expect.poll(() => content.getAnimations().length).toBe(0);
    expect(content.style.opacity).toBe("");
  });

  it("holds a closing popover until its opacity/transform animation finishes", async () => {
    const result = await render(
      <Popover isOpen>
        <Button>Open motion</Button>
        <Popover.Content>
          <Popover.Dialog aria-label="Motion">
            <Button>Inside</Button>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>,
    );
    const content = page.getByRole("dialog", {name: "Motion"}).element().parentElement!;

    await result.rerender(
      <Popover isOpen={false}>
        <Button>Open motion</Button>
        <Popover.Content>
          <Popover.Dialog aria-label="Motion">
            <Button>Inside</Button>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>,
    );
    expect(content.isConnected).toBe(true);
    expect(content).toHaveAttribute("data-exiting", "true");
    await expect.poll(() => content.getAnimations().length).toBeGreaterThan(0);
    for (const animation of content.getAnimations()) {
      const frames = (animation.effect as KeyframeEffect).getKeyframes();

      expect(frames.some((frame) => "filter" in frame)).toBe(false);
    }
    await expect.poll(() => content.isConnected).toBe(false);
  });
});

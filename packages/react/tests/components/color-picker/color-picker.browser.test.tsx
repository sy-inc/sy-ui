import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {ColorPicker} from "@/components/color-picker";

import "../../../../styles/dist/sy-inc.min.css";

function ColorPopover({isOpen}: {isOpen: boolean}) {
  return (
    <ColorPicker defaultValue="#0485F7">
      <ColorPicker.Trigger>Open color</ColorPicker.Trigger>
      <ColorPicker.Popover isOpen={isOpen}>
        <Button slot="close">Done</Button>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}

describe("ColorPicker (browser)", () => {
  it("holds the dedicated color popover through its transform/opacity exit", async () => {
    const result = await render(<ColorPopover isOpen />);

    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    const content = document.querySelector<HTMLElement>('[data-slot="color-picker-popover"]')!;

    await result.rerender(<ColorPopover isOpen={false} />);
    expect(content.isConnected).toBe(true);
    expect(content).toHaveAttribute("data-exiting", "true");
    await expect.poll(() => content.getAnimations().length).toBeGreaterThan(0);
    for (const animation of content.getAnimations()) {
      expect(
        (animation.effect as KeyframeEffect).getKeyframes().some((frame) => "filter" in frame),
      ).toBe(false);
    }
    await expect.poll(() => content.isConnected).toBe(false);
  });

  it("supports Escape dismissal and focus restoration", async () => {
    await render(
      <ColorPicker defaultValue="#0485F7">
        <ColorPicker.Trigger>Pick color</ColorPicker.Trigger>
        <ColorPicker.Popover>
          <Button slot="close">Done</Button>
        </ColorPicker.Popover>
      </ColorPicker>,
    );
    const trigger = page.getByRole("button", {name: "Pick color"});

    await trigger.click();
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
  });
});

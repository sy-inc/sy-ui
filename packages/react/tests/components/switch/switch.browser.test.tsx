import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Switch} from "@/components/switch";

import "../../../../styles/dist/sy-inc.min.css";

type Case = {direction: "ltr" | "rtl"; size: "sm" | "md" | "lg"; width?: string};

// Sizes only set --switch-thumb-width; the end offset is one shared formula, so both
// directions at the default size plus one non-default size cover it.
const cases: Case[] = [
  {size: "md", direction: "ltr"},
  {size: "md", direction: "rtl"},
  {size: "lg", direction: "ltr", width: "4rem"},
];
const fixture = ({direction, size, width}: Case) => (
  <div dir="ltr" style={{direction}}>
    <Switch size={size}>
      <Switch.Content>
        <Switch.Control data-testid="track" style={{width}}>
          <Switch.Thumb data-testid="thumb" />
        </Switch.Control>
        Notifications
      </Switch.Content>
    </Switch>
  </div>
);
const geometry = () => {
  const thumb = page.getByTestId("thumb").element();
  const t = thumb.getBoundingClientRect();
  const track = page.getByTestId("track").element().getBoundingClientRect();

  return {
    width: t.width,
    left: t.left - track.left,
    right: track.right - t.right,
    margin: parseFloat(getComputedStyle(thumb).marginInlineStart),
  };
};

describe("Switch (browser)", () => {
  it.each(cases)("supports $size $direction endpoints at width $width", async (props) => {
    await render(fixture(props));
    const start = props.direction === "rtl" ? "right" : "left";
    const end = props.direction === "rtl" ? "left" : "right";
    const initial = geometry();

    expect(initial[start]).toBeCloseTo(initial.margin, 1);
    await userEvent.click(page.getByText("Notifications"));
    await expect.poll(() => geometry()[end]).toBeCloseTo(initial.margin, 1);
    expect(geometry().width).toBe(initial.width);
    expect(geometry().margin).toBe(initial.margin);
    const track = page.getByTestId("track").element() as HTMLElement;

    track.style.width = "5rem";
    await expect.poll(() => geometry()[end]).toBeCloseTo(initial.margin, 1);
    await userEvent.keyboard(" ");
    await expect.poll(() => geometry()[start]).toBeCloseTo(initial.margin, 1);
  });

  it("supports stable thumb width and flex margin during an interrupted animation", async () => {
    await render(fixture({size: "md", direction: "ltr", width: "4rem"}));
    const initial = geometry();

    await userEvent.click(page.getByText("Notifications"));
    const animations = page.getByTestId("thumb").element().getAnimations();

    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = 150;
    }
    expect(geometry().left).toBeGreaterThan(initial.left);
    expect(geometry().right).toBeGreaterThan(initial.margin);
    expect(geometry().width).toBe(initial.width);
    expect(geometry().margin).toBe(initial.margin);
    for (const animation of animations) animation.finish();
    await userEvent.click(page.getByText("Notifications"));
    await expect.poll(() => geometry().left).toBeCloseTo(initial.margin, 1);
  });
});

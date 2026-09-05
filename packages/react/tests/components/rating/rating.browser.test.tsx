import {render} from "@sy-inc/testing/browser";
import {userEvent} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {Rating} from "@/components/rating";

const RatingItems = () => (
  <>
    {[1, 2, 3, 4, 5].map((value) => (
      <Rating.Item key={value} value={value} />
    ))}
  </>
);

const items = () => [...document.querySelectorAll<HTMLElement>('[data-slot="rating-item"]')];
const item = (index: number) => items()[index]!;
const iconColors = () =>
  items().map((item) => getComputedStyle(item.querySelector('[data-slot="rating-icon"]')!).color);

describe("Rating (browser)", () => {
  // Transitions off: these assert settled colors, not the animation. Without it a
  // snapshot taken mid-transition reports the same color as interpolated oklab
  // rather than oklch. The parking square takes the pointer, which otherwise stays
  // where the previous test left it and previews the next render on mount.
  beforeEach(async () => {
    const style = document.createElement("style");

    style.textContent = "*, *::before, *::after {transition: none !important;}";
    document.head.append(style);

    const parking = document.createElement("div");

    parking.style.cssText = "position:fixed;right:0;bottom:0;width:8px;height:8px;z-index:9999";
    document.body.append(parking);
    await userEvent.hover(parking);

    return () => {
      style.remove();
      parking.remove();
    };
  });

  it("leaves no dead zone between items for the pointer to fall into", async () => {
    await render(
      <Rating aria-label="Rating" size="lg">
        <RatingItems />
      </Rating>,
    );

    const boxes = items().map((item) => item.getBoundingClientRect());

    for (let index = 1; index < boxes.length; index++) {
      expect(boxes[index]!.left).toBeCloseTo(boxes[index - 1]!.right, 1);
    }
  });

  it("previews the hovered rating and empties everything after it", async () => {
    await render(
      <Rating aria-label="Rating">
        <RatingItems />
      </Rating>,
    );
    const [inactive] = iconColors();

    await userEvent.hover(item(3));
    await expect.poll(() => new Set(iconColors()).size).toBe(2);

    const preview = iconColors();

    expect(preview.slice(0, 4)).toEqual(Array(4).fill(preview[3]));
    expect(preview[3]).not.toBe(inactive);
    expect(preview[4]).toBe(inactive);
  });

  it("empties the tail when previewing below the committed rating", async () => {
    await render(
      <Rating aria-label="Rating" value={5}>
        <RatingItems />
      </Rating>,
    );

    await expect.poll(() => new Set(iconColors()).size).toBe(1);
    await userEvent.hover(item(1));
    await expect.poll(() => new Set(iconColors()).size).toBe(2);

    const preview = iconColors();

    expect(preview.slice(0, 2)).toEqual(Array(2).fill(preview[0]));
    expect(preview.slice(2)).toEqual(Array(3).fill(preview[4]));
    expect(preview[4]).not.toBe(preview[0]);
  });

  it("hides the fractional overlay while previewing", async () => {
    await render(
      <Rating aria-label="Rating" value={3.5}>
        <RatingItems />
      </Rating>,
    );
    const overlay = document.querySelector('[data-slot="rating-icon-partial"]')!;

    expect(getComputedStyle(overlay).display).not.toBe("none");
    expect(getComputedStyle(overlay).width).toBe("10px");

    await userEvent.hover(item(1));
    await expect.poll(() => getComputedStyle(overlay).display).toBe("none");
  });

  it("exposes --rating-filled so custom icons can follow the preview", async () => {
    await render(
      <Rating aria-label="Rating" value={5}>
        <RatingItems />
      </Rating>,
    );
    const filled = () =>
      items()
        .map((el) =>
          getComputedStyle(el.querySelector('[data-slot="rating-icon"]')!)
            .getPropertyValue("--rating-filled")
            .trim(),
        )
        .join("");

    expect(filled()).toBe("11111");

    await userEvent.hover(item(1));
    await expect.poll(filled).toBe("11000");
  });

  it("does not preview while read-only", async () => {
    await render(
      <Rating isReadOnly aria-label="Rating" value={2}>
        <RatingItems />
      </Rating>,
    );
    const before = iconColors();

    await userEvent.hover(item(4), {force: true});
    expect(item(4)).not.toHaveAttribute("data-hovered");
    expect(iconColors()).toEqual(before);
  });
});

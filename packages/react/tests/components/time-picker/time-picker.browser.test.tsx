import {Time} from "@internationalized/date";
import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import {TimePicker} from "@/components/time-picker";

import "../../../../styles/dist/sy-ui.min.css";

describe("TimePicker (browser)", () => {
  it("selects the first, middle, and last hour", async () => {
    const changes: Time[] = [];

    await render(
      <TimePicker
        defaultValue={new Time(6)}
        granularity="hour"
        style={{width: 160}}
        onChange={(value) => changes.push(value)}
      />,
    );

    const hours = page.getByRole("region", {name: "hour"});

    await expect.element(hours).toBeVisible();
    const viewport = hours.element().querySelector('[data-slot="carousel-viewport"]')!;

    await expect
      .poll(() => viewport.querySelectorAll('[data-slot="carousel-item"]').length)
      .toBe(24);
    const selected = viewport.querySelector('[data-slot="carousel-item"][data-selected="true"]')!;
    const viewportBox = viewport.getBoundingClientRect();
    const selectedBox = selected.getBoundingClientRect();

    expect(selectedBox.top + selectedBox.height / 2).toBeCloseTo(
      viewportBox.top + viewportBox.height / 2,
      -1,
    );

    for (const [label, hour] of [["00", 0], ["12", 12], ["23", 23] as const] as const) {
      await hours.getByRole("button", {name: label, exact: true}).click();
      await expect.poll(() => changes.at(-1)?.hour).toBe(hour);
    }
  });

  it("keeps animating after a fast drag", async () => {
    await render(<TimePicker defaultValue={new Time(6)} granularity="hour" style={{width: 160}} />);

    const hours = page.getByRole("region", {name: "hour"});
    const viewport = hours.element().querySelector('[data-slot="carousel-viewport"]')!;
    const track = viewport.querySelector<HTMLElement>('[data-slot="carousel-content"]')!;
    const viewportBox = viewport.getBoundingClientRect();
    const selectedBefore = viewport.querySelector(
      '[data-slot="carousel-item"][data-selected="true"]',
    )!;
    const selectedBeforeBox = selectedBefore.getBoundingClientRect();

    await viewport.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        buttons: 1,
        clientX: selectedBeforeBox.x,
        clientY: selectedBeforeBox.y + 20,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 16));
    await document.dispatchEvent(
      new MouseEvent("mousemove", {
        bubbles: true,
        buttons: 1,
        clientX: selectedBeforeBox.x,
        clientY: viewportBox.top + 8,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 16));
    await document.dispatchEvent(
      new MouseEvent("mouseup", {
        bubbles: true,
        clientX: selectedBeforeBox.x,
        clientY: viewportBox.top + 8,
      }),
    );

    const transformAtRelease = track.style.transform;

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(track.style.transform).not.toBe(transformAtRelease);

    await expect
      .poll(() => {
        const selectedAfter = viewport.querySelector(
          '[data-slot="carousel-item"][data-selected="true"]',
        );
        const selectedAfterBox = selectedAfter?.getBoundingClientRect();

        return selectedAfterBox
          ? selectedAfterBox.top +
              selectedAfterBox.height / 2 -
              (viewportBox.top + viewportBox.height / 2)
          : Infinity;
      })
      .toBeCloseTo(0, -1);
  });
});

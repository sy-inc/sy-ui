import {render} from "@sy-inc/testing/browser";
import {cdp, page} from "vitest/browser";

import {Countdown} from "@/components/countdown";

import "../../../../styles/dist/sy-inc.min.css";

const media = () =>
  cdp() as {
    send: (method: string, params: {features: {name: string; value: string}[]}) => Promise<void>;
  };

describe("Countdown (browser)", () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    await media().send("Emulation.setEmulatedMedia", {features: []});
  });

  it("supports a slow start, rapid midpoint, and opaque rolling digits over one second", async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, "now").mockReturnValue(now);

    await render(<Countdown endDate={now + 12_000} />);
    clock.mockReturnValue(now + 1000);
    document.dispatchEvent(new Event("visibilitychange"));
    const root = page.getByRole("timer");

    await expect.element(root).toHaveTextContent("0 days, 0 hours, 0 minutes, 11 seconds");
    const entering = root.element().querySelector('[data-entering="true"]')!;
    const exiting = root.element().querySelector('[data-exiting="true"]')!;
    const enterAnimation = entering.getAnimations()[0]!;
    const exitAnimation = exiting.getAnimations()[0]!;

    expect(enterAnimation.effect!.getTiming().duration).toBe(1000);
    enterAnimation.pause();
    exitAnimation.pause();

    for (const [time, minimum, maximum] of [
      [300, 0.04, 0.06],
      [500, 0.49, 0.51],
      [700, 0.94, 0.96],
    ] as const) {
      enterAnimation.currentTime = time;
      exitAnimation.currentTime = time;
      const height = entering.getBoundingClientRect().height;
      const enteringStyle = getComputedStyle(entering);
      const exitingStyle = getComputedStyle(exiting);
      const travel = 1 + new DOMMatrixReadOnly(enteringStyle.transform).m42 / height;
      const exitTravel = new DOMMatrixReadOnly(exitingStyle.transform).m42 / height;

      expect(travel).toBeGreaterThan(minimum);
      expect(travel).toBeLessThan(maximum);
      expect(exitTravel).toBeCloseTo(travel, 3);
      expect(enteringStyle.opacity).toBe("1");
      expect(exitingStyle.opacity).toBe("1");
    }
  });

  it("animates changed glyphs, clips movement, and preserves layout across a day boundary", async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, "now").mockReturnValue(now);

    await render(<Countdown endDate={now + 7 * 86400_000} size="lg" />);
    const root = page.getByRole("timer");
    const width = root.element().getBoundingClientRect().width;
    const digit = root.element().querySelector('[data-slot="countdown-digit"]')!;

    expect(getComputedStyle(digit).overflow).toBe("hidden");
    expect(digit.getBoundingClientRect().height).toBeGreaterThan(0);
    clock.mockReturnValue(now + 1000);
    document.dispatchEvent(new Event("visibilitychange"));
    await expect.element(root).toHaveTextContent("6 days, 23 hours, 59 minutes, 59 seconds");
    const entering = root.element().querySelector('[data-entering="true"]')!;
    const exiting = root.element().querySelector('[data-exiting="true"]')!;

    expect(getComputedStyle(entering).animationName).toBe("countdown-enter");
    expect(getComputedStyle(exiting).animationName).toBe("countdown-exit");
    await expect
      .poll(() => new DOMMatrixReadOnly(getComputedStyle(exiting).transform).m42)
      .toBeCloseTo(exiting.getBoundingClientRect().height, 1);
    expect(getComputedStyle(entering).opacity).toBe("1");
    expect(root.element().getBoundingClientRect().width).toBeCloseTo(width, 0);
  });

  it("shows only the new glyph with motion disabled by preference or prop", async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, "now").mockReturnValue(now);

    await media().send("Emulation.setEmulatedMedia", {
      features: [{name: "prefers-reduced-motion", value: "reduce"}],
    });
    const view = await render(<Countdown endDate={now + 12_000} />);
    const root = page.getByRole("timer");

    clock.mockReturnValue(now + 1000);
    document.dispatchEvent(new Event("visibilitychange"));
    await expect.element(root).toHaveTextContent("0 days, 0 hours, 0 minutes, 11 seconds");
    const entering = root.element().querySelector('[data-entering="true"]')!;
    const exiting = root.element().querySelector('[data-exiting="true"]')!;

    expect(getComputedStyle(entering).animationName).toBe("none");
    expect(getComputedStyle(entering).opacity).toBe("1");
    expect(getComputedStyle(exiting).opacity).toBe("0");
    await view.rerender(<Countdown animation="none" endDate={now + 12_000} />);
    await media().send("Emulation.setEmulatedMedia", {features: []});
    expect(getComputedStyle(entering).animationName).toBe("none");
    expect(getComputedStyle(exiting).opacity).toBe("0");
  });
});

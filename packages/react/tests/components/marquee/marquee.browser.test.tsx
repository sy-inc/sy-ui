import {render} from "@sy-inc/testing/browser";
import {cdp, userEvent} from "vitest/browser";

import {Marquee} from "@/components/marquee";

import "../../../../styles/dist/sy-inc.min.css";

type BrowserCDPSession = {
  send(command: string, params?: unknown): Promise<unknown>;
};

const browserCdp = () => cdp() as BrowserCDPSession;

describe("Marquee (browser)", () => {
  afterEach(async () => {
    await browserCdp().send("Emulation.setEmulatedMedia", {
      features: [{name: "prefers-reduced-motion", value: "no-preference"}],
    });
  });

  it("creates equal content groups and exposes a paused horizontal track", async () => {
    await browserCdp().send("Emulation.setEmulatedMedia", {
      features: [{name: "prefers-reduced-motion", value: "no-preference"}],
    });
    await render(
      <Marquee play={false} style={{width: 320}}>
        <span style={{width: 80}}>First</span>
        <span style={{width: 80}}>Second</span>
        <span style={{width: 80}}>Third</span>
      </Marquee>,
    );

    const root = document.querySelector<HTMLElement>('[data-slot="marquee"]')!;
    const tracks = [...document.querySelectorAll<HTMLElement>('[data-slot="marquee-track"]')];
    const track = tracks[0]!;

    expect(root.getBoundingClientRect().width).toBe(320);
    expect(tracks).toHaveLength(2);
    expect(tracks[0]!.getBoundingClientRect().width).toBeCloseTo(
      tracks[1]!.getBoundingClientRect().width,
      0,
    );
    expect(track.getBoundingClientRect().width).toBeGreaterThanOrEqual(320);
    expect(getComputedStyle(track).animationName).toBe("marquee-left");
    expect(getComputedStyle(track).animationPlayState).toBe("paused");
  });

  it("keeps two independently animated tracks flush at the loop seam", async () => {
    await render(
      <Marquee gap={16} play={false} style={{width: 320}}>
        <span style={{width: 180}}>First</span>
        <span style={{width: 180}}>Second</span>
      </Marquee>,
    );

    const tracks = [...document.querySelectorAll<HTMLElement>('[data-slot="marquee-track"]')];

    expect(tracks).toHaveLength(2);
    expect(tracks[0]!.getBoundingClientRect().right).toBeCloseTo(
      tracks[1]!.getBoundingClientRect().left,
      0,
    );
  });

  it("disables animation for system reduced motion", async () => {
    await browserCdp().send("Emulation.setEmulatedMedia", {
      features: [{name: "prefers-reduced-motion", value: "reduce"}],
    });
    await render(<Marquee>Content</Marquee>);

    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    expect(getComputedStyle(track).animationName).toBe("none");
    expect(getComputedStyle(track).transform).toBe("none");
  });

  it("auto-fills short content and derives duration from pixels per second", async () => {
    await render(
      <Marquee autoFill speed={50} style={{width: 320}}>
        <span style={{width: 64}}>Short</span>
      </Marquee>,
    );

    const root = document.querySelector<HTMLElement>('[data-slot="marquee"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => root.dataset["ready"]).toBe("true");
    await expect
      .poll(() => root.querySelectorAll('[data-slot="marquee-sequence"]').length)
      .toBeGreaterThan(2);

    const cycleWidth = track.getBoundingClientRect().width;
    const duration = Number.parseFloat(getComputedStyle(track).animationDuration);

    expect(duration * 50).toBeCloseTo(cycleWidth, 0);
  });

  it("sizes the track to padded inline children instead of the line box", async () => {
    await render(
      <Marquee play={false} style={{width: 320}}>
        <span style={{padding: "8px 16px"}}>Pill</span>
      </Marquee>,
    );

    const root = document.querySelector<HTMLElement>('[data-slot="marquee"]')!;
    const item = document.querySelector<HTMLElement>('[data-slot="marquee-item"]')!;

    // An inline child in a block wrapper would collapse to the 24px line box.
    expect(getComputedStyle(item).display).toBe("flex");
    expect(root.getBoundingClientRect().height).toBeCloseTo(
      item.firstElementChild!.getBoundingClientRect().height,
      0,
    );
    expect(root.getBoundingClientRect().height).toBeGreaterThan(24);
  });

  it("pauses a running marquee while hovered", async () => {
    await render(
      <Marquee pauseOnInteraction style={{width: 320}}>
        <span style={{width: 160}}>Hover to pause</span>
      </Marquee>,
    );

    const root = document.querySelector<HTMLElement>('[data-slot="marquee"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => root.dataset["ready"]).toBe("true");
    expect(getComputedStyle(track).animationPlayState).toBe("running");

    await userEvent.hover(root);
    expect(getComputedStyle(track).animationPlayState).toBe("paused");
  });

  it("pauses a running marquee while its content holds focus", async () => {
    await render(
      <Marquee pauseOnInteraction style={{width: 320}}>
        <a href="#focus-target" style={{width: 160}}>
          Focus to pause
        </a>
      </Marquee>,
    );

    const root = document.querySelector<HTMLElement>('[data-slot="marquee"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => root.dataset["ready"]).toBe("true");
    expect(getComputedStyle(track).animationPlayState).toBe("running");

    root.querySelector("a")!.focus();
    expect(getComputedStyle(track).animationPlayState).toBe("paused");
  });

  it("keeps running on hover and focus without pauseOnInteraction", async () => {
    await render(
      <Marquee style={{width: 320}}>
        <a href="#focus-target" style={{width: 160}}>
          Never pauses
        </a>
      </Marquee>,
    );

    const root = document.querySelector<HTMLElement>('[data-slot="marquee"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => root.dataset["ready"]).toBe("true");

    await userEvent.hover(root);
    root.querySelector("a")!.focus();
    expect(getComputedStyle(track).animationPlayState).toBe("running");
  });
});

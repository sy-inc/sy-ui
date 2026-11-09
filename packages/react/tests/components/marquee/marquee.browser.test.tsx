import {render} from "@sy-inc/testing/browser";
import {cdp, userEvent} from "vitest/browser";

import {Marquee} from "@/components/marquee";

import "../../../../styles/dist/sy-inc.min.css";

type BrowserCDPSession = {
  send(command: string, params?: unknown): Promise<unknown>;
};

const browserCdp = () => cdp() as BrowserCDPSession;

describe("Marquee (browser)", () => {
  beforeEach(async () => {
    // DOM cleanup leaves the real pointer over the next fixture at the same coordinates.
    await browserCdp().send("Input.dispatchMouseEvent", {type: "mouseMoved", x: -1, y: -1});
  });

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
      <Marquee style={{width: 320}}>
        <Marquee.Content play={false}>
          <span style={{width: 80}}>First</span>
          <span style={{width: 80}}>Second</span>
          <span style={{width: 80}}>Third</span>
        </Marquee.Content>
      </Marquee>,
    );

    const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;
    const tracks = [...document.querySelectorAll<HTMLElement>('[data-slot="marquee-track"]')];
    const track = tracks[0]!;

    expect(content.getBoundingClientRect().width).toBe(320);
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
      <Marquee style={{width: 320}}>
        <Marquee.Content gap={16} play={false}>
          <span style={{width: 180}}>First</span>
          <span style={{width: 180}}>Second</span>
        </Marquee.Content>
      </Marquee>,
    );

    const tracks = [...document.querySelectorAll<HTMLElement>('[data-slot="marquee-track"]')];

    expect(tracks).toHaveLength(2);
    expect(tracks[0]!.getBoundingClientRect().right).toBeCloseTo(
      tracks[1]!.getBoundingClientRect().left,
      0,
    );
  });

  describe("adornments", () => {
    it("pins the prefix and suffix and gives the content the remaining space", async () => {
      await render(
        <Marquee style={{width: 320}}>
          <Marquee.Prefix style={{width: 40}}>@</Marquee.Prefix>
          <Marquee.Content play={false}>
            <span style={{width: 600}}>Long announcement</span>
          </Marquee.Content>
          <Marquee.Suffix style={{width: 40}}>i</Marquee.Suffix>
        </Marquee>,
      );

      const prefix = document.querySelector<HTMLElement>('[data-slot="marquee-prefix"]')!;
      const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;
      const suffix = document.querySelector<HTMLElement>('[data-slot="marquee-suffix"]')!;

      // Overflowing content must not push the adornments out or overlap them.
      expect(prefix.getBoundingClientRect().width).toBe(40);
      expect(suffix.getBoundingClientRect().width).toBe(40);
      expect(content.getBoundingClientRect().width).toBe(240);
      expect(content.getBoundingClientRect().left).toBeCloseTo(
        prefix.getBoundingClientRect().right,
        0,
      );
      expect(content.getBoundingClientRect().right).toBeCloseTo(
        suffix.getBoundingClientRect().left,
        0,
      );
    });

    it("fades only the scrolling content when gradient is enabled", async () => {
      await render(
        <Marquee style={{width: 320}}>
          <Marquee.Prefix style={{width: 40}}>@</Marquee.Prefix>
          <Marquee.Content gradient play={false}>
            <span style={{width: 600}}>Long announcement</span>
          </Marquee.Content>
        </Marquee>,
      );

      const root = document.querySelector<HTMLElement>('[data-slot="marquee"]')!;
      const prefix = document.querySelector<HTMLElement>('[data-slot="marquee-prefix"]')!;
      const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;

      expect(getComputedStyle(content).maskImage).toContain("linear-gradient");
      expect(getComputedStyle(prefix).maskImage).toBe("none");
      expect(getComputedStyle(root).maskImage).toBe("none");
    });

    it("fades along the block axis for a vertical marquee", async () => {
      await render(
        <Marquee style={{height: 320}}>
          <Marquee.Content gradient direction="up" play={false}>
            <span style={{height: 600}}>Long announcement</span>
          </Marquee.Content>
        </Marquee>,
      );

      const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;

      // Chrome omits the default `to bottom`, so the first argument is already a color stop.
      expect(getComputedStyle(content).maskImage).toMatch(/^linear-gradient\(rgba\(/);
    });
  });

  describe("scroll overflow", () => {
    it("holds content that fits still at the start edge without fades", async () => {
      await render(
        <Marquee style={{width: 320}}>
          <Marquee.Content gradient scroll="overflow">
            <span style={{width: 200}}>Short notice</span>
          </Marquee.Content>
        </Marquee>,
      );

      const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;
      const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

      await expect.poll(() => content.dataset["ready"]).toBe("true");
      expect(content.dataset["static"]).toBe("true");
      expect(document.querySelectorAll('[data-slot="marquee-track"]')).toHaveLength(1);
      expect(getComputedStyle(track).animationName).toBe("none");
      expect(getComputedStyle(content).maskImage).toBe("none");
      expect(track.getBoundingClientRect().left).toBeCloseTo(
        content.getBoundingClientRect().left,
        0,
      );
    });

    it("scrolls once the content no longer fits", async () => {
      await render(
        <Marquee style={{width: 320}}>
          <Marquee.Content scroll="overflow">
            <span style={{width: 400}}>Long announcement</span>
          </Marquee.Content>
        </Marquee>,
      );

      const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;

      await expect.poll(() => content.dataset["static"]).toBeUndefined();
      expect(document.querySelectorAll('[data-slot="marquee-track"]')).toHaveLength(2);
      expect(
        getComputedStyle(document.querySelector('[data-slot="marquee-track"]')!).animationName,
      ).toBe("marquee-left");
    });

    it("switches between still and scrolling as the content box resizes", async () => {
      await render(
        <Marquee style={{width: 320}}>
          <Marquee.Content scroll="overflow">
            <span style={{width: 400}}>Long announcement</span>
          </Marquee.Content>
        </Marquee>,
      );

      const root = document.querySelector<HTMLElement>('[data-slot="marquee"]')!;
      const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;

      await expect.poll(() => content.dataset["static"]).toBeUndefined();

      root.style.width = "480px";
      await expect.poll(() => content.dataset["static"]).toBe("true");
      expect(
        getComputedStyle(content.querySelector('[data-slot="marquee-track"]')!).transform,
      ).toBe("none");

      root.style.width = "320px";
      await expect.poll(() => content.dataset["static"]).toBeUndefined();
    });
  });

  describe("container gap", () => {
    const query = (slot: string) => document.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!;

    it("starts the content beyond the entering edge, one content box apart", async () => {
      await render(
        <Marquee style={{width: 320}}>
          <Marquee.Content gap="container" play={false}>
            <span style={{width: 200}}>Notice</span>
          </Marquee.Content>
        </Marquee>,
      );

      const content = query("marquee-content");
      const tracks = document.querySelectorAll<HTMLElement>('[data-slot="marquee-track"]');

      await expect.poll(() => content.style.getPropertyValue("--marquee-gap")).toBe("320px");
      expect(query("marquee-item").getBoundingClientRect().left).toBeCloseTo(
        content.getBoundingClientRect().right,
        0,
      );
      expect(tracks[0]!.getBoundingClientRect().width).toBeCloseTo(520, 0);
      expect(tracks[0]!.getBoundingClientRect().right).toBeCloseTo(
        tracks[1]!.getBoundingClientRect().left,
        0,
      );
    });

    it("leads along the block axis for a vertical marquee", async () => {
      await render(
        <Marquee style={{height: 120}}>
          <Marquee.Content direction="up" gap="container" play={false}>
            <span style={{height: 24}}>Notice</span>
          </Marquee.Content>
        </Marquee>,
      );

      const content = query("marquee-content");

      await expect.poll(() => content.style.getPropertyValue("--marquee-gap")).toBe("120px");
      expect(query("marquee-item").getBoundingClientRect().top).toBeCloseTo(
        content.getBoundingClientRect().bottom,
        0,
      );
    });

    it("holds content that fits at the start edge", async () => {
      await render(
        <Marquee style={{width: 320}}>
          <Marquee.Content gap="container" scroll="overflow">
            <span style={{width: 200}}>Notice</span>
          </Marquee.Content>
        </Marquee>,
      );

      const content = query("marquee-content");

      await expect.poll(() => content.style.getPropertyValue("--marquee-gap")).toBe("320px");
      expect(content.dataset["static"]).toBe("true");
      expect(query("marquee-item").getBoundingClientRect().left).toBeCloseTo(
        content.getBoundingClientRect().left,
        0,
      );
    });

    it("keeps the content at the start edge for system reduced motion", async () => {
      await browserCdp().send("Emulation.setEmulatedMedia", {
        features: [{name: "prefers-reduced-motion", value: "reduce"}],
      });
      await render(
        <Marquee style={{width: 320}}>
          <Marquee.Content gap="container">
            <span style={{width: 200}}>Notice</span>
          </Marquee.Content>
        </Marquee>,
      );

      const content = query("marquee-content");

      await expect.poll(() => content.style.getPropertyValue("--marquee-gap")).toBe("320px");
      expect(query("marquee-item").getBoundingClientRect().left).toBeCloseTo(
        content.getBoundingClientRect().left,
        0,
      );
    });
  });

  it("disables animation for system reduced motion", async () => {
    await browserCdp().send("Emulation.setEmulatedMedia", {
      features: [{name: "prefers-reduced-motion", value: "reduce"}],
    });
    await render(
      <Marquee>
        <Marquee.Content>Content</Marquee.Content>
      </Marquee>,
    );

    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    expect(getComputedStyle(track).animationName).toBe("none");
    expect(getComputedStyle(track).transform).toBe("none");
  });

  it("auto-fills short content and derives duration from pixels per second", async () => {
    await render(
      <Marquee style={{width: 320}}>
        <Marquee.Content autoFill speed={50}>
          <span style={{width: 64}}>Short</span>
        </Marquee.Content>
      </Marquee>,
    );

    const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => content.dataset["ready"]).toBe("true");
    await expect
      .poll(() => content.querySelectorAll('[data-slot="marquee-sequence"]').length)
      .toBeGreaterThan(2);

    const cycleWidth = track.getBoundingClientRect().width;
    const duration = Number.parseFloat(getComputedStyle(track).animationDuration);

    expect(duration * 50).toBeCloseTo(cycleWidth, 0);
  });

  it("measures the content box rather than the full bar for auto fill", async () => {
    await render(
      <Marquee style={{width: 320}}>
        <Marquee.Prefix style={{width: 120}}>@</Marquee.Prefix>
        <Marquee.Content autoFill gap={0} speed={50}>
          <span style={{width: 100}}>Short</span>
        </Marquee.Content>
      </Marquee>,
    );

    const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => content.dataset["ready"]).toBe("true");

    // 200px of content space over a 100px sequence needs two copies per track, not the four
    // a 320px measurement would produce.
    await expect
      .poll(() => track.querySelectorAll('[data-slot="marquee-sequence"]').length)
      .toBe(2);
    expect(track.getBoundingClientRect().width).toBeCloseTo(200, 0);
  });

  it("sizes the track to padded inline children instead of the line box", async () => {
    await render(
      <Marquee style={{width: 320}}>
        <Marquee.Content play={false}>
          <span style={{padding: "8px 16px"}}>Pill</span>
        </Marquee.Content>
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
      <Marquee style={{width: 320}}>
        <Marquee.Content pauseOnInteraction>
          <span style={{width: 160}}>Hover to pause</span>
        </Marquee.Content>
      </Marquee>,
    );

    const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => content.dataset["ready"]).toBe("true");
    expect(getComputedStyle(track).animationPlayState).toBe("running");

    await userEvent.hover(content);
    expect(getComputedStyle(track).animationPlayState).toBe("paused");
  });

  it("pauses a running marquee while its content holds focus", async () => {
    await render(
      <Marquee style={{width: 320}}>
        <Marquee.Content pauseOnInteraction>
          <a href="#focus-target" style={{width: 160}}>
            Focus to pause
          </a>
        </Marquee.Content>
      </Marquee>,
    );

    const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => content.dataset["ready"]).toBe("true");
    expect(content.matches(":hover")).toBe(false);
    expect(content.matches(":focus-within")).toBe(false);
    expect(getComputedStyle(track).animationPlayState).toBe("running");

    content.querySelector("a")!.focus();
    expect(getComputedStyle(track).animationPlayState).toBe("paused");
  });

  it("keeps running on hover and focus without pauseOnInteraction", async () => {
    await render(
      <Marquee style={{width: 320}}>
        <Marquee.Content>
          <a href="#focus-target" style={{width: 160}}>
            Never pauses
          </a>
        </Marquee.Content>
      </Marquee>,
    );

    const content = document.querySelector<HTMLElement>('[data-slot="marquee-content"]')!;
    const track = document.querySelector<HTMLElement>('[data-slot="marquee-track"]')!;

    await expect.poll(() => content.dataset["ready"]).toBe("true");

    await userEvent.hover(content);
    content.querySelector("a")!.focus();
    expect(getComputedStyle(track).animationPlayState).toBe("running");
  });
});

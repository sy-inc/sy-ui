import type {BottomBarProps} from "@/components/bottom-bar";

import {render} from "@sy-inc/testing/browser";
import {StrictMode} from "react";
import {hydrateRoot} from "react-dom/client";
import {renderToString} from "react-dom/server";
import {page} from "vitest/browser";

import {BottomBar} from "@/components/bottom-bar";

import "../../../../styles/dist/sy-inc.min.css";

const TRANSPARENT = "rgba(0, 0, 0, 0)";
const KEYS = ["b1", "b2", "b3", "b4"];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const HoverBottomBar = ({selectionStyle}: Pick<BottomBarProps, "selectionStyle">) => (
  <>
    {/* Read settled hover styles instead of mid-transition values. */}
    <style>{".bottom-bar__link { transition: none !important; }"}</style>
    <BottomBar aria-label="Primary navigation" position="static" selectionStyle={selectionStyle}>
      <BottomBar.Item isActive href="#home">
        Home
      </BottomBar.Item>
      <BottomBar.Item href="#profile">Profile</BottomBar.Item>
    </BottomBar>
  </>
);

const IndicatorBottomBar = ({activeKey}: {activeKey: string}) => (
  <BottomBar aria-label="Primary navigation" position="static">
    {KEYS.map((key) => (
      <BottomBar.Item key={key} href={`#${key}`} isActive={key === activeKey}>
        <BottomBar.Label>{key.toUpperCase()}</BottomBar.Label>
      </BottomBar.Item>
    ))}
  </BottomBar>
);

const settledOn = (name: string) => {
  const link = page.getByRole("link", {name}).element();
  const indicator = link.querySelector<HTMLElement>('[data-slot="bottom-bar-indicator"]')!;
  const a = indicator.getBoundingClientRect();
  const b = link.getBoundingClientRect();

  return {
    offset: [Math.round(a.left - b.left), Math.round(a.top - b.top), Math.round(a.width - b.width)],
    translate: indicator.style.translate,
  };
};

describe("BottomBar (browser)", () => {
  it("renders a hover fill on inactive items with the indicator style", async () => {
    await render(<HoverBottomBar selectionStyle="indicator" />);

    const profile = page.getByRole("link", {name: "Profile"});

    await profile.hover();

    expect(getComputedStyle(profile.element()).backgroundColor).not.toBe(TRANSPARENT);
  });

  it.each(["color", "underline"] as const)(
    "renders only a color change on hover with the %s style",
    async (selectionStyle) => {
      await render(<HoverBottomBar selectionStyle={selectionStyle} />);

      const profile = page.getByRole("link", {name: "Profile"});

      // Previous cases may leave the pointer over Profile at the same position.
      await page.getByRole("link", {name: "Home"}).hover();
      const restColor = getComputedStyle(profile.element()).color;

      await profile.hover();

      const hovered = getComputedStyle(profile.element());

      expect(hovered.backgroundColor).toBe(TRANSPARENT);
      expect(hovered.color).not.toBe(restColor);
    },
  );

  describe("indicator", () => {
    // StrictMode + hydration double-invokes the layout effect that used to leak the overrides.
    it("settles on an active item that is not the first after a strict hydration", async () => {
      document.body.innerHTML = "";
      const container = document.createElement("div");
      const tree = (
        <StrictMode>
          <IndicatorBottomBar activeKey="b4" />
        </StrictMode>
      );

      container.innerHTML = renderToString(tree);
      document.body.appendChild(container);
      const root = hydrateRoot(container, tree);

      onTestFinished(() => {
        root.unmount();
        container.remove();
      });
      await wait(2000);

      expect(settledOn("B4")).toEqual({offset: [0, 0, 0], translate: ""});
    });

    it("slides to the new active item and settles there", async () => {
      const view = await render(<IndicatorBottomBar activeKey="b1" />);

      await view.rerender(<IndicatorBottomBar activeKey="b3" />);

      await expect.poll(() => settledOn("B3")).toEqual({offset: [0, 0, 0], translate: ""});
    });
  });
});

import type {BottomBarProps} from "@/components/bottom-bar";

import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {BottomBar} from "@/components/bottom-bar";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

const HoverBottomBar = ({selectionStyle}: Pick<BottomBarProps, "selectionStyle">) => (
  <>
    {/* Read settled hover styles instead of mid-transition values. */}
    <style>{".bottom-bar__link { transition: none !important; }"}</style>
    <BottomBar
      aria-label="Primary navigation"
      position="static"
      selectedKey="#home"
      selectionStyle={selectionStyle}
    >
      <BottomBar.Item id="#home">Home</BottomBar.Item>
      <BottomBar.Item id="#profile">Profile</BottomBar.Item>
    </BottomBar>
  </>
);

describe("BottomBar (browser)", () => {
  it("renders a hover fill on unselected items with the indicator style", async () => {
    await render(<HoverBottomBar selectionStyle="indicator" />);

    const profile = page.getByRole("tab", {name: "Profile"});

    await profile.hover();

    expect(getComputedStyle(profile.element()).backgroundColor).not.toBe(TRANSPARENT);
  });

  it.each(["color", "underline"] as const)(
    "renders only a color change on hover with the %s style",
    async (selectionStyle) => {
      await render(<HoverBottomBar selectionStyle={selectionStyle} />);

      const profile = page.getByRole("tab", {name: "Profile"});
      const restColor = getComputedStyle(profile.element()).color;

      await profile.hover();

      const hovered = getComputedStyle(profile.element());

      expect(hovered.backgroundColor).toBe(TRANSPARENT);
      expect(hovered.color).not.toBe(restColor);
    },
  );
});

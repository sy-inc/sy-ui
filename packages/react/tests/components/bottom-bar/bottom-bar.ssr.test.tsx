import {ssrSmoke} from "@sy-inc/testing/helpers";

import {BottomBar} from "@/components/bottom-bar";

describe("BottomBar SSR", () => {
  it("renders Tabs-based navigation without a hydration mismatch", async () => {
    await ssrSmoke(
      <BottomBar aria-label="Primary navigation" defaultSelectedKey="#home">
        <BottomBar.Item id="#home">
          <BottomBar.Icon>
            <span />
          </BottomBar.Icon>
          <BottomBar.Label>Home</BottomBar.Label>
        </BottomBar.Item>
        <BottomBar.Item id="#profile">
          <BottomBar.Label>Profile</BottomBar.Label>
        </BottomBar.Item>
      </BottomBar>,
    );
  });
});

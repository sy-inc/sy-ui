import {ssrSmoke} from "@sy-inc/testing/helpers";

import {BottomBar} from "@/components/bottom-bar";

const TestBottomBar = ({currentHref}: {currentHref: string}) => (
  <BottomBar aria-label="Primary navigation">
    <BottomBar.Item href="/home" isActive={currentHref === "/home"}>
      <BottomBar.Icon>
        <span />
      </BottomBar.Icon>
      <BottomBar.Label>Home</BottomBar.Label>
    </BottomBar.Item>
    <BottomBar.Item href="/profile" isActive={currentHref === "/profile"}>
      <BottomBar.Label>Profile</BottomBar.Label>
    </BottomBar.Item>
  </BottomBar>
);

describe("BottomBar SSR", () => {
  it("renders link navigation without a hydration mismatch", async () => {
    await ssrSmoke(<TestBottomBar currentHref="/home" />);
  });

  it("renders without an active destination without a hydration mismatch", async () => {
    await ssrSmoke(<TestBottomBar currentHref="/settings" />);
  });
});

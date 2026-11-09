import {ssrSmoke} from "@sy-inc/testing/helpers";

import {DrawerFixture} from "./fixtures";

describe("Drawer SSR", () => {
  it("renders without hydration mismatch when closed", async () => {
    await ssrSmoke(<DrawerFixture />);
  });

  it("supports CSS snap lengths during client SSR", async () => {
    await ssrSmoke(<DrawerFixture defaultOpen snapPoints={["12rem", "calc(100% - 48px)"]} />);
  });

  it("renders without hydration mismatch when defaultOpen", async () => {
    await ssrSmoke(<DrawerFixture defaultOpen snapPoints={[0.4, 0.8]} />);
  });
});

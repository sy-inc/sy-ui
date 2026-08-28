import {ssrSmoke} from "@sy-inc/testing/helpers";

import {DrawerFixture} from "./fixtures";

describe("Drawer SSR", () => {
  it("renders without hydration mismatch when closed", async () => {
    await ssrSmoke(<DrawerFixture />);
  });

  it("renders without hydration mismatch when defaultOpen", async () => {
    await ssrSmoke(<DrawerFixture defaultOpen />);
  });
});

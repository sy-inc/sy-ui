import {ssrSmoke} from "@sy-ui/testing/helpers";

import {SidebarFixture} from "./fixtures";

describe("Sidebar SSR", () => {
  it("renders without hydration mismatch when expanded", async () => {
    await ssrSmoke(<SidebarFixture />);
  });

  it("renders without hydration mismatch when collapsed", async () => {
    await ssrSmoke(<SidebarFixture defaultOpen={false} />);
  });
});

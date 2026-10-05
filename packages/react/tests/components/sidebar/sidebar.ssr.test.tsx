import {ssrSmoke} from "@sy-inc/testing/helpers";
import {renderToString} from "react-dom/server";

import {SidebarFixture} from "./fixtures";

describe("Sidebar SSR", () => {
  it("renders without hydration mismatch when expanded", async () => {
    await ssrSmoke(<SidebarFixture />);
  });

  it("renders without hydration mismatch when collapsed", async () => {
    await ssrSmoke(<SidebarFixture defaultOpen={false} />);
  });

  it("renders the undecided state for CSS to collapse below the breakpoint", async () => {
    const html = renderToString(<SidebarFixture collapseBreakpoint="xl" />);

    expect(html).toContain("sidebar--auto-collapse-xl");
    expect(html).not.toContain("sidebar--collapsed");
    await ssrSmoke(<SidebarFixture collapseBreakpoint="xl" />);
  });
});

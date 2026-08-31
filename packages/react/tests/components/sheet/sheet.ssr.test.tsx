import {ssrSmoke} from "@sy-inc/testing/helpers";

import {SheetFixture} from "./fixtures";

describe("Sheet SSR", () => {
  it("renders without hydration mismatch when closed", async () => {
    await ssrSmoke(<SheetFixture />);
  });

  it("renders without hydration mismatch when defaultOpen", async () => {
    await ssrSmoke(<SheetFixture defaultOpen snapPoints={[0.4, 0.8]} />);
  });
});

import {ssrSmoke} from "@sy-inc/testing/helpers";

import {ViewStackFixture} from "./fixtures";

describe("ViewStack SSR", () => {
  it("renders the current page without hydration mismatch", async () => {
    await ssrSmoke(<ViewStackFixture />);
  });

  it("renders a force-mounted inactive page without hydration mismatch", async () => {
    await ssrSmoke(<ViewStackFixture forceMountInfo initialKey="plan" />);
  });
});

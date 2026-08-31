import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Segment} from "@/components/segment";

describe("Segment SSR", () => {
  it("renders without hydration mismatch", async () => {
    await ssrSmoke(
      <Segment separators aria-label="View" selectedKey="grid">
        <Segment.Item id="grid">Grid</Segment.Item>
        <Segment.Item id="list">List</Segment.Item>
      </Segment>,
    );
  });
});

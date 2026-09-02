import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Timeline} from "@/components/timeline";

describe("Timeline SSR", () => {
  it("renders the compound structure without a hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <Timeline aria-label="Release timeline">
        <Timeline.Item status="current">
          <Timeline.Rail />
          <Timeline.Content>Private beta</Timeline.Content>
        </Timeline.Item>
      </Timeline>,
    );

    expect(html).toContain('data-slot="timeline"');
    expect(html).toContain('data-slot="timeline-item"');
    expect(html).toContain('data-slot="timeline-marker"');
    expect(html).toContain('aria-current="true"');
  });
});

import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Widget} from "@/components/widget";

describe("Widget SSR", () => {
  it("renders without hydration mismatch when composed", async () => {
    await ssrSmoke(
      <Widget>
        <Widget.Header>
          <Widget.Title>Monthly revenue</Widget.Title>
          <Widget.Legend>
            <Widget.LegendItem color="var(--primary)">Revenue</Widget.LegendItem>
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content>Chart</Widget.Content>
      </Widget>,
    );
  });
});

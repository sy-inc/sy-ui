import {ssrSmoke} from "@sy-inc/testing/helpers";

import {ListView} from "@/components/list-view";

describe("ListView SSR", () => {
  it("renders without a hydration mismatch", async () => {
    await ssrSmoke(
      <ListView aria-label="Team members">
        <ListView.Item id="maya" textValue="Maya Chen">
          Maya Chen
        </ListView.Item>
      </ListView>,
    );
  });
});

import {ssrSmoke} from "@sy-inc/testing/helpers";

import {TextShimmer} from "@/components/text-shimmer";

describe("TextShimmer SSR", () => {
  it("renders without a hydration mismatch", async () => {
    await ssrSmoke(<TextShimmer>Thinking...</TextShimmer>);
  });
});

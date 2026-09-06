import {ssrSmoke} from "@sy-inc/testing/helpers";

import {MessageList} from "@/components/message-list";

describe("MessageList SSR", () => {
  it("renders and hydrates without a mismatch", async () => {
    const {html} = await ssrSmoke(<MessageList>Server-rendered message</MessageList>);

    expect(html).toContain('data-slot="message-list"');
    expect(html).toContain("Server-rendered message");
  });
});

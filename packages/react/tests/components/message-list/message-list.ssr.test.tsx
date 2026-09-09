import {ssrSmoke} from "@sy-inc/testing/helpers";

import {MessageList} from "@/components/message-list";

describe("MessageList SSR", () => {
  it("renders and hydrates without a mismatch", async () => {
    const {html} = await ssrSmoke(
      <MessageList>
        <MessageList.Viewport>
          <MessageList.Content>Server-rendered message</MessageList.Content>
          <MessageList.ScrollButton />
        </MessageList.Viewport>
      </MessageList>,
    );

    expect(html).toContain('data-slot="message-list"');
    expect(html).toContain('data-slot="message-list-viewport"');
    expect(html).toContain("Server-rendered message");
  });
});

import {ssrSmoke} from "@sy-inc/testing/helpers";

import {ChatMessage} from "@/components/chat-message";

describe("ChatMessage SSR", () => {
  it("renders message parts without hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <ChatMessage.User>
        <ChatMessage.Bubble>
          <ChatMessage.Content>Hello</ChatMessage.Content>
        </ChatMessage.Bubble>
      </ChatMessage.User>,
    );

    expect(html).toContain('data-slot="chat-message-user"');
    expect(html).toContain('data-slot="chat-message-content"');
  });
});

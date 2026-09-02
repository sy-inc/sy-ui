import {render, screen} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {Avatar} from "@/components/avatar";
import {ChatMessage} from "@/components/chat-message";

describe("ChatMessage", () => {
  it("renders assistant and user anatomy with stable slots", () => {
    render(
      <ChatMessage data-testid="root">
        <ChatMessage.Assistant>
          <ChatMessage.Avatar>
            <Avatar.Fallback>AI</Avatar.Fallback>
          </ChatMessage.Avatar>
          <ChatMessage.Body>
            <ChatMessage.Content>Helpful answer</ChatMessage.Content>
            <ChatMessage.Actions>Actions</ChatMessage.Actions>
          </ChatMessage.Body>
        </ChatMessage.Assistant>
        <ChatMessage.User>
          <ChatMessage.Bubble>Question</ChatMessage.Bubble>
        </ChatMessage.User>
      </ChatMessage>,
    );

    expect(screen.getByText("Helpful answer")).toBeInTheDocument();
    expect(screen.getByTestId("root")).toHaveAttribute("data-slot", "chat-message-root");

    for (const slot of ["assistant", "avatar", "body", "content", "actions", "user", "bubble"]) {
      expect(document.querySelector(`[data-slot="chat-message-${slot}"]`)).toBeInTheDocument();
    }
  });

  it("supports native div props and refs on message parts", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <ChatMessage.User
        ref={ref}
        className="custom-message"
        data-state="sent"
        data-testid="message"
      >
        <ChatMessage.Bubble>Question</ChatMessage.Bubble>
      </ChatMessage.User>,
    );

    const message = screen.getByTestId("message");

    expect(message).toHaveAttribute("data-state", "sent");
    expect(message).toHaveClass("custom-message");
    expect(ref.current).toBe(message);
  });

  it("preserves Avatar props while defaulting to the compact size", () => {
    render(
      <>
        <ChatMessage.Avatar data-testid="default">
          <Avatar.Fallback>AI</Avatar.Fallback>
        </ChatMessage.Avatar>
        <ChatMessage.Avatar color="accent" data-testid="large" size="lg">
          <Avatar.Fallback>AI</Avatar.Fallback>
        </ChatMessage.Avatar>
      </>,
    );

    expect(screen.getByTestId("default")).toHaveClass("avatar--sm");
    expect(screen.getByTestId("large")).toHaveClass("avatar--lg");
  });
});

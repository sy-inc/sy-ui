import {messageListVariants as styles} from "@sy-inc/styles";
import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {MessageList as PublicMessageList, messageListVariants} from "@sy-inc/react";
import {
  MessageList,
  MessageListContent,
  MessageListRoot,
  MessageListScrollButton,
  MessageListViewport,
  MessageList as SubpathMessageList,
} from "@sy-inc/react/message-list";

const scrolling = vi.hoisted(() => ({
  contentRef: vi.fn(),
  isNearBottom: true,
  scrollRef: vi.fn(),
  scrollToBottom: vi.fn(),
}));

vi.mock("use-stick-to-bottom", () => ({useStickToBottom: () => scrolling}));

beforeEach(() => {
  scrolling.isNearBottom = true;
  scrolling.contentRef.mockClear();
  scrolling.scrollRef.mockClear();
  scrolling.scrollToBottom.mockClear();
});

const Conversation = ({label = "回到底部"}: {label?: string}) => (
  <MessageList>
    <MessageList.Viewport>
      <MessageList.Content>Message</MessageList.Content>
      <MessageList.ScrollButton aria-label={label} />
    </MessageList.Viewport>
  </MessageList>
);

describe("MessageList", () => {
  it("exposes the component, parts, and styles through public package entries", () => {
    expect(PublicMessageList).toBe(MessageList);
    expect(SubpathMessageList).toBe(MessageList);
    expect(messageListVariants).toBe(styles);
    expect(MessageList.Root).toBe(MessageListRoot);
    expect(MessageList.Viewport).toBe(MessageListViewport);
    expect(MessageList.Content).toBe(MessageListContent);
    expect(MessageList.ScrollButton).toBe(MessageListScrollButton);
  });

  it("supports props and refs on every part and binds the hook to viewport and content", () => {
    const rootRef = createRef<HTMLDivElement>();
    const viewportRef = createRef<HTMLDivElement>();
    const contentRef = createRef<HTMLDivElement>();

    render(
      <MessageList ref={rootRef} className="custom-root" id="conversation">
        <MessageList.Viewport
          ref={viewportRef}
          aria-label="Customer messages"
          className="custom-viewport"
        >
          <MessageList.Content ref={contentRef} className="custom-content">
            Message content
          </MessageList.Content>
          <MessageList.ScrollButton />
        </MessageList.Viewport>
      </MessageList>,
    );

    expect(rootRef.current).toHaveAttribute("id", "conversation");
    expect(rootRef.current).toHaveAttribute("data-slot", "message-list");
    expect(rootRef.current).toHaveClass("custom-root");
    expect(viewportRef.current).toBe(screen.getByRole("region", {name: "Customer messages"}));
    expect(viewportRef.current).toHaveAttribute("data-slot", "message-list-viewport");
    expect(viewportRef.current).toHaveAttribute("tabindex", "0");
    expect(viewportRef.current).toHaveClass("custom-viewport");
    expect(contentRef.current).toBe(screen.getByText("Message content"));
    expect(contentRef.current).toHaveAttribute("data-slot", "message-list-content");
    expect(contentRef.current).toHaveClass("custom-content");
    expect(scrolling.scrollRef).toHaveBeenCalledWith(viewportRef.current);
    expect(scrolling.contentRef).toHaveBeenCalledWith(contentRef.current);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(rootRef.current).not.toHaveAttribute("aria-live");
  });

  it("supports a labeled arrow and keyboard activation away from the bottom", async () => {
    scrolling.isNearBottom = false;
    const user = setupUser();

    render(<Conversation />);

    const button = screen.getByRole("button", {name: "回到底部"});

    expect(button).toHaveAttribute("data-slot", "message-list-scroll-button");
    expect(button.parentElement).toHaveAttribute("data-slot", "message-list-scroll-button-dock");
    await user.tab();
    expect(screen.getByRole("region", {name: "Messages"})).toHaveFocus();
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(scrolling.scrollToBottom).toHaveBeenCalledWith("smooth");
  });

  it("supports reduced motion for the scroll button", async () => {
    scrolling.isNearBottom = false;
    const media = vi.spyOn(window, "matchMedia").mockReturnValue({matches: true} as MediaQueryList);
    const user = setupUser();

    try {
      render(<Conversation label="Scroll to latest message" />);
      await user.click(screen.getByRole("button", {name: "Scroll to latest message"}));
      expect(scrolling.scrollToBottom).toHaveBeenCalledWith("instant");
    } finally {
      media.mockRestore();
    }
  });

  it("supports placing the scroll button outside the content, e.g. inside a composer", async () => {
    scrolling.isNearBottom = false;
    const onPress = vi.fn();
    const user = setupUser();

    render(
      <MessageList>
        <MessageList.Viewport>
          <MessageList.Content>Message</MessageList.Content>
          <footer>
            <MessageList.ScrollButton className="custom-arrow" onPress={onPress}>
              ↓
            </MessageList.ScrollButton>
            <input aria-label="Composer" />
          </footer>
        </MessageList.Viewport>
      </MessageList>,
    );

    const button = screen.getByRole("button", {name: "Scroll to latest message"});

    expect(button).toHaveClass("custom-arrow");
    expect(button).toHaveTextContent("↓");
    await user.click(button);
    expect(scrolling.scrollToBottom).toHaveBeenCalledWith("smooth");
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

import {messageListVariants as styles} from "@sy-inc/styles";
import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {MessageList as PublicMessageList, messageListVariants} from "@sy-inc/react";
import {MessageList as SubpathMessageList} from "@sy-inc/react/message-list";

import {MessageList, MessageListRoot} from "@/components/message-list";

const scrolling = vi.hoisted(() => ({
  contentRef: vi.fn(),
  isNearBottom: true,
  scrollRef: vi.fn(),
  scrollToBottom: vi.fn(),
}));

vi.mock("use-stick-to-bottom", () => ({useStickToBottom: () => scrolling}));

beforeEach(() => {
  scrolling.isNearBottom = true;
  scrolling.scrollToBottom.mockClear();
});

describe("MessageList", () => {
  it("exposes the component and styles through public package entries", () => {
    expect(PublicMessageList).toBe(MessageList);
    expect(SubpathMessageList).toBe(MessageList);
    expect(messageListVariants).toBe(styles);
  });

  it("supports root and viewport props, refs, and public slots", () => {
    const rootRef = createRef<HTMLDivElement>();
    const viewportRef = createRef<HTMLDivElement>();

    render(
      <MessageList
        ref={rootRef}
        className="custom-root"
        id="conversation"
        viewportProps={{
          "aria-label": "Customer messages",
          className: "custom-viewport",
          ref: viewportRef,
        }}
      >
        Message content
      </MessageList>,
    );

    expect(MessageList.Root).toBe(MessageListRoot);
    expect(rootRef.current).toHaveAttribute("id", "conversation");
    expect(rootRef.current).toHaveAttribute("data-slot", "message-list");
    expect(rootRef.current).toHaveClass("custom-root");
    expect(viewportRef.current).toBe(screen.getByRole("region", {name: "Customer messages"}));
    expect(viewportRef.current).toHaveAttribute("data-slot", "message-list-viewport");
    expect(viewportRef.current).toHaveAttribute("tabindex", "0");
    expect(viewportRef.current).toHaveClass("custom-viewport");
    expect(screen.getByText("Message content")).toHaveAttribute(
      "data-slot",
      "message-list-content",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(rootRef.current).not.toHaveAttribute("aria-live");
  });

  it("supports a labeled arrow and keyboard activation away from the bottom", async () => {
    scrolling.isNearBottom = false;
    const user = setupUser();

    render(<MessageList scrollToBottomLabel="回到底部">Message</MessageList>);

    const button = screen.getByRole("button", {name: "回到底部"});

    expect(button).toHaveAttribute("data-slot", "message-list-scroll-button");
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
      render(<MessageList>Message</MessageList>);
      await user.click(screen.getByRole("button", {name: "Scroll to latest message"}));
      expect(scrolling.scrollToBottom).toHaveBeenCalledWith("instant");
    } finally {
      media.mockRestore();
    }
  });
});

import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {MessageBubble} from "@/components/message-bubble";

describe("MessageBubble", () => {
  it("renders all images before one caption regardless of input order", () => {
    const {container} = render(
      <MessageBubble
        content={
          <>
            {"Before image. "}
            <img alt="First" src="/first.jpg" />
            <>
              {"Between images. "}
              <img alt="Second" src="/second.jpg" />
            </>
            After image.
          </>
        }
        time="09:41"
      />,
    );

    const bubble = container.querySelector('[data-slot="message-bubble-content"]')!;
    const caption = bubble.querySelector('[data-slot="message-bubble-text"]')!;

    expect([...bubble.children].map((child) => child.tagName)).toEqual(["IMG", "IMG", "DIV"]);
    expect(screen.getAllByRole("img").map((image) => image.getAttribute("alt"))).toEqual([
      "First",
      "Second",
    ]);
    expect(caption).toHaveTextContent("Before image. Between images. After image.09:41");
    expect(caption.querySelector("time")).not.toBeNull();
  });

  it("renders null with default props and blank content", () => {
    const {container} = render(<MessageBubble />);

    expect(container).toBeEmptyDOMElement();

    const blank = render(<MessageBubble content={" \n\t "} time="09:41" />);

    expect(blank.container).toBeEmptyDOMElement();

    for (const content of [null, false, [], [null, "  ", false]]) {
      expect(render(<MessageBubble content={content} />).container).toBeEmptyDOMElement();
    }
  });

  it("renders image-only content with its alternative text and timestamp", () => {
    render(
      <MessageBubble
        content={<img alt="Mountain at sunset" height={400} src="/mountain.jpg" width={600} />}
        time="09:41"
      />,
    );

    expect(screen.getByRole("img", {name: "Mountain at sunset"})).toHaveAttribute(
      "src",
      "/mountain.jpg",
    );
    expect(screen.getByText("09:41").tagName).toBe("TIME");
  });

  it("supports mixed content and keyboard access to links", async () => {
    const user = setupUser();

    render(
      <MessageBubble
        content={
          <>
            Read <a href="https://example.test/guide">the guide</a> for details.
          </>
        }
        time="09:42"
      />,
    );

    const link = screen.getByRole("link", {name: "the guide"});

    expect(link).toHaveAttribute("href", "https://example.test/guide");
    await user.tab();
    expect(link).toHaveFocus();
    expect(link.parentElement).toHaveTextContent("Read the guide for details.09:42");
  });

  it("preserves text content and whitespace without interpreting it", () => {
    const content = "  <b>literal</b>\n  https://example.test/path  ";
    const {container} = render(<MessageBubble content={content} />);

    const bubble = container.querySelector<HTMLElement>('[data-slot="message-bubble-content"]')!;

    expect(bubble.textContent).toBe(content);
    expect(bubble.querySelector("b")).toBeNull();
  });

  it("applies default direction, custom root classes, and public slots", () => {
    const {container} = render(<MessageBubble className="consumer-hook" content="Hello" />);

    const root = container.firstElementChild!;

    expect(root).toHaveAttribute("data-slot", "message-bubble");
    expect(root).toHaveAttribute("data-direction", "received");
    expect(root).toHaveClass("consumer-hook");
    expect(root.querySelector('[data-slot="message-bubble-content"]')).toHaveAttribute(
      "data-slot",
      "message-bubble-content",
    );
  });

  it("supports sent direction and only renders meaningful times", () => {
    const {container} = render(<MessageBubble content="Hello" direction="sent" time=" 09:41 " />);

    expect(container.firstElementChild).toHaveAttribute("data-direction", "sent");
    expect(container.querySelector('[data-slot="message-bubble-time"]')).toHaveTextContent("09:41");
    expect(container.querySelector('[data-slot="message-bubble-time"]')?.textContent).toBe(
      " 09:41 ",
    );

    for (const time of [null, undefined, "", " \n "]) {
      const result = render(<MessageBubble content="Hello" time={time} />);

      expect(result.container.querySelector('[data-slot="message-bubble-time"]')).toBeNull();
    }
  });

  it("keeps content before time in static non-interactive markup", () => {
    const {container} = render(<MessageBubble content="Message" time="09:41" />);

    const root = container.firstElementChild!;
    const content = root.querySelector('[data-slot="message-bubble-content"]')!;
    const time = root.querySelector('[data-slot="message-bubble-time"]')!;

    expect(content.contains(time)).toBe(true);
    expect(
      content.querySelector('[data-slot="message-bubble-text"]')?.firstChild?.textContent,
    ).toBe("Message");
    expect(root.querySelector("button")).toBeNull();
    expect(root).not.toHaveAttribute("tabindex");
    expect(root).not.toHaveAttribute("aria-live");
  });
});

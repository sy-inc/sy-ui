import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {MessageBubble} from "@/components/message-bubble";

describe("MessageBubble", () => {
  it("renders the composed parts in the order they are written", () => {
    const {container} = render(
      <MessageBubble>
        <MessageBubble.Content>
          <img alt="First" src="/first.jpg" />
          <img alt="Second" src="/second.jpg" />
          <MessageBubble.Text>
            Caption text
            <MessageBubble.Time>09:41</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>,
    );

    const content = container.querySelector('[data-slot="message-bubble-content"]')!;
    const text = content.querySelector('[data-slot="message-bubble-text"]')!;

    expect([...content.children].map((child) => child.tagName)).toEqual(["IMG", "IMG", "DIV"]);
    expect(screen.getAllByRole("img").map((image) => image.getAttribute("alt"))).toEqual([
      "First",
      "Second",
    ]);
    expect(text).toHaveTextContent("Caption text09:41");
    expect(text.querySelector("time")).not.toBeNull();
  });

  it("renders an image-only bubble when the text part is omitted", () => {
    const {container} = render(
      <MessageBubble>
        <MessageBubble.Content>
          <img alt="Mountain at sunset" height={400} src="/mountain.jpg" width={600} />
          <MessageBubble.Time>09:41</MessageBubble.Time>
        </MessageBubble.Content>
      </MessageBubble>,
    );

    expect(screen.getByRole("img", {name: "Mountain at sunset"})).toHaveAttribute(
      "src",
      "/mountain.jpg",
    );
    expect(screen.getByText("09:41").tagName).toBe("TIME");
    expect(container.querySelector('[data-slot="message-bubble-text"]')).toBeNull();
  });

  it("supports mixed content and keyboard access to links", async () => {
    const user = setupUser();

    render(
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>
            Read <a href="https://example.test/guide">the guide</a> for details.
            <MessageBubble.Time>09:42</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>,
    );

    const link = screen.getByRole("link", {name: "the guide"});

    expect(link).toHaveAttribute("href", "https://example.test/guide");
    await user.tab();
    expect(link).toHaveFocus();
    expect(link.parentElement).toHaveTextContent("Read the guide for details.09:42");
  });

  it("preserves text content and whitespace without interpreting it", () => {
    const content = "  <b>literal</b>\n  https://example.test/path  ";
    const {container} = render(
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>{content}</MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>,
    );

    const bubble = container.querySelector<HTMLElement>('[data-slot="message-bubble-content"]')!;

    expect(bubble.textContent).toBe(content);
    expect(bubble.querySelector("b")).toBeNull();
  });

  it("applies the default direction, custom root classes, and public slots", () => {
    const {container} = render(
      <MessageBubble className="consumer-hook">
        <MessageBubble.Content>
          <MessageBubble.Text>Hello</MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>,
    );

    const root = container.firstElementChild!;

    expect(root).toHaveAttribute("data-slot", "message-bubble");
    expect(root).toHaveAttribute("data-direction", "received");
    expect(root).toHaveClass("consumer-hook");
    expect(root.querySelector('[data-slot="message-bubble-content"]')).not.toBeNull();
    expect(root.querySelector('[data-slot="message-bubble-text"]')).not.toBeNull();
  });

  it("supports the sent direction and renders the time verbatim", () => {
    const {container} = render(
      <MessageBubble direction="sent">
        <MessageBubble.Content>
          <MessageBubble.Text>
            Hello
            <MessageBubble.Time> 09:41 </MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>,
    );

    expect(container.firstElementChild).toHaveAttribute("data-direction", "sent");
    expect(container.querySelector('[data-slot="message-bubble-time"]')?.textContent).toBe(
      " 09:41 ",
    );
  });

  it("exposes an aria-hidden spacer carrying the time for the text flow", () => {
    const {container} = render(
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>
            Hello
            <MessageBubble.Time>09:41</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>,
    );

    const spacer = container.querySelector("[data-time]")!;

    expect(spacer).toHaveAttribute("aria-hidden", "true");
    expect(spacer).toHaveAttribute("data-time", "09:41");
    expect(spacer.textContent).toBe("");
  });

  it("keeps content before time in static non-interactive markup", () => {
    const {container} = render(
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>
            Message
            <MessageBubble.Time>09:41</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>,
    );

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

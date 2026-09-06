import {render} from "@sy-inc/testing/browser";
import {useState} from "react";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {MessageBubble} from "@/components/message-bubble";
import {MessageList} from "@/components/message-list";

import "../../../../styles/dist/sy-inc.min.css";

const Conversation = () => {
  const [last, setLast] = useState(100);
  const [showImage, setShowImage] = useState(false);

  return (
    <>
      <Button onPress={() => setLast((value) => value + 1)}>Add message</Button>
      <Button onPress={() => setShowImage(true)}>Load image</Button>
      <MessageList scrollToBottomLabel="回到底部" viewportProps={{"aria-label": "客服消息记录"}}>
        {Array.from({length: 100}, (_, index) => {
          const id = last - 99 + index;

          return (
            <MessageBubble
              key={id}
              content={
                <>
                  {`Message ${id}: Please check my order and confirm the expected delivery date.`}
                  {index % 10 === 9 ? (
                    <a href="https://example.test/orders">Order details</a>
                  ) : null}
                  {showImage && index === 99 ? (
                    <img
                      alt="Order screenshot"
                      src={
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="320"><rect width="240" height="320" fill="teal"/></svg>'
                      }
                    />
                  ) : null}
                </>
              }
              direction={index % 2 === 0 ? "received" : "sent"}
              time="09:41"
            />
          );
        })}
      </MessageList>
    </>
  );
};

const getViewport = () => page.getByRole("region", {name: "客服消息记录"}).element() as HTMLElement;
const bottomGap = (viewport: HTMLElement) =>
  viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;
const arrow = () => page.getByRole("button", {name: "回到底部"});

const readHistory = async (viewport: HTMLElement) => {
  viewport.focus();
  await userEvent.keyboard("{Home}");
  await expect.poll(() => viewport.scrollTop).toBe(0);
  await expect.element(arrow()).toBeVisible();
};

describe("MessageList (browser)", () => {
  it("supports a floating arrow and smooth scrolling through 100 messages", async () => {
    await render(<Conversation />);

    const viewport = getViewport();

    expect(viewport.querySelectorAll('[data-slot="message-bubble"]')).toHaveLength(100);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight * 5);
    await expect.poll(() => bottomGap(viewport)).toBeLessThanOrEqual(1);
    await expect.element(arrow()).not.toBeInTheDocument();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await readHistory(viewport);
      const arrowRect = arrow().element().getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();

      expect(arrowRect.bottom).toBeLessThan(viewportRect.bottom);
      expect(arrowRect.right).toBeLessThan(viewportRect.right);
      expect(arrowRect.width).toBeGreaterThanOrEqual(44);

      const positions: number[] = [];
      const recordScroll = () => positions.push(viewport.scrollTop);
      const destination = viewport.scrollHeight - viewport.clientHeight;

      viewport.addEventListener("scroll", recordScroll);
      await arrow().click();
      await expect
        .poll(() => bottomGap(viewport), {interval: 16, timeout: 3000})
        .toBeLessThanOrEqual(1);
      viewport.removeEventListener("scroll", recordScroll);

      expect(positions.some((position) => position > 0 && position < destination - 1)).toBe(true);
      await expect.element(arrow()).not.toBeInTheDocument();
      const lastMessage = viewport.querySelector('[data-slot="message-bubble"]:last-child')!;

      expect(lastMessage.getBoundingClientRect().bottom).toBeLessThanOrEqual(viewportRect.bottom);
    }
  });

  it("supports new messages and image growth while respecting history browsing", async () => {
    await render(<Conversation />);
    const viewport = getViewport();

    await expect.poll(() => bottomGap(viewport)).toBeLessThanOrEqual(1);
    await page.getByRole("button", {name: "Load image"}).click();
    await (
      page.getByRole("img", {name: "Order screenshot"}).element() as HTMLImageElement
    ).decode();
    await expect.poll(() => bottomGap(viewport)).toBeLessThanOrEqual(1);

    await readHistory(viewport);
    await page.getByRole("button", {name: "Add message"}).click();
    await expect.element(page.getByText(/Message 101:/)).toBeInTheDocument();
    expect(viewport.querySelectorAll('[data-slot="message-bubble"]')).toHaveLength(100);
    expect(bottomGap(viewport)).toBeGreaterThan(viewport.clientHeight);
    await expect.element(arrow()).toBeVisible();

    await arrow().click();
    await expect.poll(() => bottomGap(viewport), {timeout: 3000}).toBeLessThanOrEqual(1);
    await page.getByRole("button", {name: "Add message"}).click();
    await expect.element(page.getByText(/Message 102:/)).toBeInTheDocument();
    await expect.poll(() => bottomGap(viewport)).toBeLessThanOrEqual(1);
  });

  it("renders short and empty lists without a scroll button", async () => {
    await render(
      <>
        <MessageList viewportProps={{"aria-label": "Empty"}} />
        <MessageList viewportProps={{"aria-label": "Short"}}>
          <MessageBubble content="Hello" />
        </MessageList>
      </>,
    );

    await expect.element(page.getByRole("button")).not.toBeInTheDocument();
  });
});

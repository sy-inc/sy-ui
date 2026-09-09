import type {Meta, StoryObj} from "@storybook/react";

import {useRef, useState} from "react";

import {Button} from "../button";
import {Input} from "../input";
import {MessageBubble} from "../message-bubble";

import {MessageList} from ".";

const meta: Meta<typeof MessageList> = {
  component: MessageList,
  tags: ["autodocs"],
  title: "Components/MessageList",
};

export default meta;

type Story = StoryObj<typeof MessageList>;

const bubble = (id: number, withMedia = false) => (
  <MessageBubble
    key={id}
    direction={id % 2 === 0 ? "received" : "sent"}
    time={`09:${String(Math.floor((id % 100) / 2)).padStart(2, "0")}`}
    content={
      <>
        {`第 ${id} 条消息：${id % 2 === 0 ? "客户咨询订单配送进度，请帮忙确认预计送达时间。" : "客服回复：已经为您查询订单，我们会及时同步最新进度。"}`}
        {withMedia && id % 10 === 9 ? (
          <>
            {"\n"}
            <a href="https://example.com/orders">查看订单详情</a>
            <img
              alt={`第 ${id} 条消息的订单截图`}
              decoding="async"
              height={120}
              src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="240" height="120" fill="teal"/><path d="M24 32h140M24 56h192M24 80h96" stroke="white" stroke-width="8"/></svg>'
              width={240}
            />
          </>
        ) : null}
      </>
    }
  />
);

const useWindow = () => {
  const [last, setLast] = useState(100);
  const ids = Array.from({length: 100}, (_, offset) => last - 99 + offset);

  return {ids, push: () => setLast((value) => value + 1)};
};

export const Default: Story = {
  render: (args) => (
    <MessageList {...args}>
      <MessageList.Viewport aria-label="客服消息记录">
        <MessageList.Content>
          <MessageBubble content="How can I help you?" time="09:41" />
          <MessageBubble content="Please check my order." direction="sent" time="09:42" />
        </MessageList.Content>
        <MessageList.ScrollButton aria-label="回到底部" />
      </MessageList.Viewport>
    </MessageList>
  ),
};

export const HundredMessages: Story = {
  render: function Render() {
    const viewportRef = useRef<HTMLDivElement>(null);
    const {ids, push} = useWindow();

    return (
      <>
        <Button onPress={() => viewportRef.current?.scrollTo({behavior: "instant", top: 0})}>
          查看最早消息
        </Button>
        <Button onPress={push}>模拟新消息（保留 100 条）</Button>
        <MessageList>
          <MessageList.Viewport ref={viewportRef} aria-label="客服消息记录">
            <MessageList.Content>{ids.map((id) => bubble(id, true))}</MessageList.Content>
            <MessageList.ScrollButton aria-label="回到底部" />
          </MessageList.Viewport>
        </MessageList>
      </>
    );
  },
};

/** The viewport is the page scroller; the arrow docks inside the sticky composer. */
export const PageScroller: Story = {
  parameters: {layout: "fullscreen"},
  render: function Render() {
    const {ids, push} = useWindow();

    return (
      <MessageList>
        <MessageList.Viewport aria-label="客服消息记录" className="h-dvh rounded-none border-0">
          <header className="sticky top-0 z-10 border-b border-border bg-surface p-3 font-medium">
            客服会话
          </header>
          <MessageList.Content>{ids.map((id) => bubble(id))}</MessageList.Content>
          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border bg-surface p-3">
            <MessageList.ScrollButton aria-label="回到底部" />
            <div className="flex gap-2">
              <Input fullWidth aria-label="输入消息" placeholder="输入消息…" />
              <Button onPress={push}>发送</Button>
            </div>
          </div>
        </MessageList.Viewport>
      </MessageList>
    );
  },
};

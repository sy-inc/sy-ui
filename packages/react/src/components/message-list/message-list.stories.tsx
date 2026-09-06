import type {Meta, StoryObj} from "@storybook/react";

import {useRef, useState} from "react";

import {Button} from "../button";
import {MessageBubble} from "../message-bubble";

import {MessageList} from ".";

const meta: Meta<typeof MessageList> = {
  component: MessageList,
  tags: ["autodocs"],
  title: "Components/MessageList",
};

export default meta;

type Story = StoryObj<typeof MessageList>;

export const Default: Story = {
  render: (args) => (
    <MessageList {...args}>
      <MessageBubble content="How can I help you?" time="09:41" />
      <MessageBubble content="Please check my order." direction="sent" time="09:42" />
    </MessageList>
  ),
};

export const HundredMessages: Story = {
  render: function Render() {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [lastMessage, setLastMessage] = useState(100);

    return (
      <>
        <Button onPress={() => viewportRef.current?.scrollTo({behavior: "instant", top: 0})}>
          查看最早消息
        </Button>
        <Button onPress={() => setLastMessage((last) => last + 1)}>
          模拟新消息（保留 100 条）
        </Button>
        <MessageList
          scrollToBottomLabel="回到底部"
          viewportProps={{"aria-label": "客服消息记录", ref: viewportRef}}
        >
          {Array.from({length: 100}, (_, offset) => {
            const id = lastMessage - 99 + offset;

            return (
              <MessageBubble
                key={id}
                content={
                  <>
                    {`第 ${id} 条消息：${id % 2 === 0 ? "客户咨询订单配送进度，请帮忙确认预计送达时间。" : "客服回复：已经为您查询订单，我们会及时同步最新进度。"}`}
                    {id % 10 === 9 ? (
                      <>
                        {"\n"}
                        <a href="https://example.com/orders">查看订单详情</a>
                        <img
                          alt={`第 ${id} 条消息的订单截图`}
                          decoding="async"
                          height={120}
                          src={
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="240" height="120" fill="teal"/><path d="M24 32h140M24 56h192M24 80h96" stroke="white" stroke-width="8"/></svg>'
                          }
                          width={240}
                        />
                      </>
                    ) : null}
                  </>
                }
                direction={id % 2 === 0 ? "received" : "sent"}
                time={`09:${String(Math.floor((id % 100) / 2)).padStart(2, "0")}`}
              />
            );
          })}
        </MessageList>
      </>
    );
  },
};

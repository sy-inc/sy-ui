import type {Meta, StoryObj} from "@storybook/react";

import {MessageBubble} from "./message-bubble";

const meta: Meta<typeof MessageBubble> = {
  component: MessageBubble,
  tags: ["autodocs"],
  title: "Components/MessageBubble",
};

export default meta;

type Story = StoryObj<typeof MessageBubble>;

export const Default: Story = {
  args: {
    content: "A message without a timestamp",
  },
};

export const States: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <MessageBubble content="Received, short with time" time="09:41" />
      <MessageBubble content="Sent, short with time" direction="sent" time="09:42" />
      <MessageBubble
        content="This message has enough words for its final line to decide whether the time fits beside it."
        time="09:43"
      />
      <MessageBubble
        content={"Leading and trailing whitespace   \nexplicit newline"}
        time="09:44"
      />
      <MessageBubble
        content="https://example.com/a-very-long-url-without-natural-breaks"
        time="09:45"
      />
      <MessageBubble content="No visible timestamp" time="   " />
      <MessageBubble content="Dark mode is token driven" direction="sent" time="09:46" />
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div className="w-48">
      <MessageBubble
        content="A narrow container wraps the message and keeps the timestamp clear."
        time="A longer time"
      />
    </div>
  ),
};

export const ImagesAndLinks: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <MessageBubble
        content={
          <img
            alt="Mountain landscape reflected in a lake"
            decoding="async"
            height={400}
            loading="lazy"
            src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&h=400&fit=crop"
            width={600}
          />
        }
        time="09:41"
      />
      <MessageBubble
        content={
          <>
            Here is the <a href="https://example.com/guide">travel guide</a> for this trip.
          </>
        }
        direction="sent"
        time="09:42"
      />
      <MessageBubble
        content={
          <>
            <img
              alt="Mountain landscape reflected in a lake"
              decoding="async"
              height={400}
              loading="lazy"
              src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&h=400&fit=crop"
              width={600}
            />
            Shall we go here? <a href="https://example.com/trip">View the itinerary</a>
          </>
        }
        direction="sent"
        time="09:43"
      />
    </div>
  ),
};

export const ThemeAndBoundaryMatrix: Story = {
  render: () => (
    <div className="grid max-w-xl gap-3">
      <div className="w-64" data-theme="light">
        <MessageBubble content="Exact-fit timestamp boundary" time="09:47" />
        <MessageBubble content="Exact-fit timestamp boundary" time="A longer time" />
      </div>
      <div className="w-48" data-theme="dark">
        <MessageBubble
          content={"  Leading and trailing whitespace  \nwith an explicit newline"}
          time="09:48"
        />
        <MessageBubble content="" time="09:49" />
      </div>
    </div>
  ),
};

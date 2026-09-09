import type {Meta, StoryObj} from "@storybook/react";

import {MessageBubble} from "./index";

const meta: Meta<typeof MessageBubble> = {
  component: MessageBubble,
  tags: ["autodocs"],
  title: "Components/MessageBubble",
};

export default meta;

type Story = StoryObj<typeof MessageBubble>;

const photo = (
  <img
    alt="Mountain landscape reflected in a lake"
    decoding="async"
    height={400}
    loading="lazy"
    src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&h=400&fit=crop"
    width={600}
  />
);

export const Default: Story = {
  render: () => (
    <MessageBubble>
      <MessageBubble.Content>
        <MessageBubble.Text>A message without a timestamp</MessageBubble.Text>
      </MessageBubble.Content>
    </MessageBubble>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>
            Received, short with time
            <MessageBubble.Time>09:41</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
      <MessageBubble direction="sent">
        <MessageBubble.Content>
          <MessageBubble.Text>
            Sent, short with time
            <MessageBubble.Time>09:42</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>
            This message has enough words for its final line to decide whether the time fits beside
            it.
            <MessageBubble.Time>09:43</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>
            {"Leading and trailing whitespace   \nexplicit newline"}
            <MessageBubble.Time>09:44</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>
            https://example.com/a-very-long-url-without-natural-breaks
            <MessageBubble.Time>09:45</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>No timestamp part rendered</MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
      <MessageBubble direction="sent">
        <MessageBubble.Content>
          <MessageBubble.Text>
            Dark mode is token driven
            <MessageBubble.Time>09:46</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
    </div>
  ),
};

export const Narrow: Story = {
  render: () => (
    <div className="w-48">
      <MessageBubble>
        <MessageBubble.Content>
          <MessageBubble.Text>
            A narrow container wraps the message and keeps the timestamp clear.
            <MessageBubble.Time>A longer time</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
    </div>
  ),
};

/** Drop `Text` for an image-only bubble: the time then floats over the picture. */
export const ImagesAndLinks: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <MessageBubble>
        <MessageBubble.Content>
          {photo}
          <MessageBubble.Time>09:41</MessageBubble.Time>
        </MessageBubble.Content>
      </MessageBubble>
      <MessageBubble direction="sent">
        <MessageBubble.Content>
          <MessageBubble.Text>
            Here is the <a href="https://example.com/guide">travel guide</a> for this trip.
            <MessageBubble.Time>09:42</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
      <MessageBubble direction="sent">
        <MessageBubble.Content>
          {photo}
          <MessageBubble.Text>
            Shall we go here? <a href="https://example.com/trip">View the itinerary</a>
            <MessageBubble.Time>09:43</MessageBubble.Time>
          </MessageBubble.Text>
        </MessageBubble.Content>
      </MessageBubble>
    </div>
  ),
};

export const ThemeAndBoundaryMatrix: Story = {
  render: () => (
    <div className="grid max-w-xl gap-3">
      <div className="w-64" data-theme="light">
        <MessageBubble>
          <MessageBubble.Content>
            <MessageBubble.Text>
              Exact-fit timestamp boundary
              <MessageBubble.Time>09:47</MessageBubble.Time>
            </MessageBubble.Text>
          </MessageBubble.Content>
        </MessageBubble>
        <MessageBubble>
          <MessageBubble.Content>
            <MessageBubble.Text>
              Exact-fit timestamp boundary
              <MessageBubble.Time>A longer time</MessageBubble.Time>
            </MessageBubble.Text>
          </MessageBubble.Content>
        </MessageBubble>
      </div>
      <div className="w-48" data-theme="dark">
        <MessageBubble>
          <MessageBubble.Content>
            <MessageBubble.Text>
              {"  Leading and trailing whitespace  \nwith an explicit newline"}
              <MessageBubble.Time>09:48</MessageBubble.Time>
            </MessageBubble.Text>
          </MessageBubble.Content>
        </MessageBubble>
      </div>
    </div>
  ),
};

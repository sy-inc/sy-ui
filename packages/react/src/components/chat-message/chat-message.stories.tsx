import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";

import {Avatar} from "../avatar";
import {Button} from "../button";
import {Tooltip} from "../tooltip";

import {ChatMessage} from "./index";

const actionDefinitions = [
  ["Copy", "gravity-ui:copy"],
  ["Good response", "gravity-ui:thumb-up"],
  ["Bad response", "gravity-ui:thumb-down"],
  ["Regenerate", "gravity-ui:arrow-rotate-right"],
] as const;

const Actions = () => (
  <ChatMessage.Actions>
    {actionDefinitions.map(([label, icon]) => (
      <Tooltip key={label}>
        <Button isIconOnly aria-label={label} size="sm" variant="ghost">
          <Icon aria-hidden icon={icon} />
        </Button>
        <Tooltip.Content>{label}</Tooltip.Content>
      </Tooltip>
    ))}
  </ChatMessage.Actions>
);

const AssistantMessage = ({children}: {children: string}) => (
  <ChatMessage.Assistant>
    <ChatMessage.Avatar>
      <Avatar.Fallback>AI</Avatar.Fallback>
    </ChatMessage.Avatar>
    <ChatMessage.Body>
      <ChatMessage.Content>{children}</ChatMessage.Content>
      <Actions />
    </ChatMessage.Body>
  </ChatMessage.Assistant>
);

const UserMessage = ({children}: {children: string}) => (
  <ChatMessage.User>
    <ChatMessage.Bubble>
      <ChatMessage.Content>{children}</ChatMessage.Content>
    </ChatMessage.Bubble>
  </ChatMessage.User>
);

const Conversation = ({long}: {long?: boolean}) => (
  <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
    <ChatMessage className="mx-auto max-w-[714px]">
      <UserMessage>
        {long
          ? "Could you explain how a reusable chat message layout should handle a longer request on a narrow screen without creating horizontal overflow?"
          : "Can you explain how compound components help AI chat UIs stay SDK-agnostic?"}
      </UserMessage>
      <AssistantMessage>
        {long
          ? "Use composable layout parts: keep the message body shrinkable, let content wrap naturally, and compose existing avatars and action buttons rather than adding message-specific controls."
          : "Compound components let you compose message layout explicitly while keeping state in your app layer."}
      </AssistantMessage>
    </ChatMessage>
  </div>
);

const meta = {
  component: ChatMessage,
  parameters: {layout: "fullscreen"},
  title: "Components/ChatMessage",
} satisfies Meta<typeof ChatMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Conversation />,
};

export const NarrowLongContent: Story = {
  render: () => <Conversation long />,
  parameters: {viewport: {defaultViewport: "mobile1"}},
};

"use client";

import type {AvatarProps} from "../avatar";
import type {ComponentProps} from "react";

import {chatMessageVariants} from "@sy-inc/styles";

import {Avatar} from "../avatar";

const slots = chatMessageVariants();

type Slot = Exclude<keyof typeof slots, "avatar">;

interface ChatMessagePartProps extends ComponentProps<"div"> {}

/* Layout-only parts: a div with a stable class + data-slot. */
const part = (slot: Slot, name: string) => {
  const Part = ({className, ...props}: ChatMessagePartProps) => (
    <div className={slots[slot]({className})} data-slot={`chat-message-${slot}`} {...props} />
  );

  Part.displayName = `SY INC.ChatMessage.${name}`;

  return Part;
};

const ChatMessageRoot = part("root", "Root");
const ChatMessageAssistant = part("assistant", "Assistant");
const ChatMessageUser = part("user", "User");
const ChatMessageBody = part("body", "Body");
const ChatMessageBubble = part("bubble", "Bubble");
const ChatMessageContent = part("content", "Content");
const ChatMessageActions = part("actions", "Actions");

interface ChatMessageAvatarProps extends AvatarProps {}

const ChatMessageAvatar = ({className, size = "sm", ...props}: ChatMessageAvatarProps) => (
  <Avatar
    {...props}
    className={slots.avatar({className})}
    data-slot="chat-message-avatar"
    size={size}
  />
);

ChatMessageAvatar.displayName = "SY INC.ChatMessage.Avatar";

export {
  ChatMessageRoot,
  ChatMessageAssistant,
  ChatMessageUser,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageBubble,
  ChatMessageContent,
  ChatMessageActions,
};

export type {
  ChatMessagePartProps as ChatMessageRootProps,
  ChatMessagePartProps as ChatMessageAssistantProps,
  ChatMessagePartProps as ChatMessageUserProps,
  ChatMessageAvatarProps,
  ChatMessagePartProps as ChatMessageBodyProps,
  ChatMessagePartProps as ChatMessageBubbleProps,
  ChatMessagePartProps as ChatMessageContentProps,
  ChatMessagePartProps as ChatMessageActionsProps,
};

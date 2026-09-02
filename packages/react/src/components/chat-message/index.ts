import type {ComponentProps} from "react";

import {
  ChatMessageActions,
  ChatMessageAssistant,
  ChatMessageAvatar,
  ChatMessageBody,
  ChatMessageBubble,
  ChatMessageContent,
  ChatMessageRoot,
  ChatMessageUser,
} from "./chat-message";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const ChatMessage = Object.assign(ChatMessageRoot, {
  Root: ChatMessageRoot,
  Assistant: ChatMessageAssistant,
  User: ChatMessageUser,
  Avatar: ChatMessageAvatar,
  Body: ChatMessageBody,
  Bubble: ChatMessageBubble,
  Content: ChatMessageContent,
  Actions: ChatMessageActions,
});

export type ChatMessage = {
  Props: ComponentProps<typeof ChatMessageRoot>;
  RootProps: ComponentProps<typeof ChatMessageRoot>;
  AssistantProps: ComponentProps<typeof ChatMessageAssistant>;
  UserProps: ComponentProps<typeof ChatMessageUser>;
  AvatarProps: ComponentProps<typeof ChatMessageAvatar>;
  BodyProps: ComponentProps<typeof ChatMessageBody>;
  BubbleProps: ComponentProps<typeof ChatMessageBubble>;
  ContentProps: ComponentProps<typeof ChatMessageContent>;
  ActionsProps: ComponentProps<typeof ChatMessageActions>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
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
  ChatMessageRootProps,
  ChatMessageRootProps as ChatMessageProps,
  ChatMessageAssistantProps,
  ChatMessageUserProps,
  ChatMessageAvatarProps,
  ChatMessageBodyProps,
  ChatMessageBubbleProps,
  ChatMessageContentProps,
  ChatMessageActionsProps,
} from "./chat-message";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {chatMessageVariants} from "@sy-inc/styles";

import type {ComponentProps} from "react";

import {
  MessageBubbleContent,
  MessageBubbleRoot,
  MessageBubbleText,
  MessageBubbleTime,
} from "./message-bubble";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const MessageBubble = Object.assign(MessageBubbleRoot, {
  Content: MessageBubbleContent,
  Root: MessageBubbleRoot,
  Text: MessageBubbleText,
  Time: MessageBubbleTime,
});

export type MessageBubble = {
  Props: ComponentProps<typeof MessageBubbleRoot>;
  RootProps: ComponentProps<typeof MessageBubbleRoot>;
  ContentProps: ComponentProps<typeof MessageBubbleContent>;
  TextProps: ComponentProps<typeof MessageBubbleText>;
  TimeProps: ComponentProps<typeof MessageBubbleTime>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {MessageBubbleRoot, MessageBubbleContent, MessageBubbleText, MessageBubbleTime};

export type {
  MessageBubbleRootProps,
  MessageBubbleRootProps as MessageBubbleProps,
  MessageBubbleContentProps,
  MessageBubbleTextProps,
  MessageBubbleTimeProps,
} from "./message-bubble";
export {messageBubbleVariants, type MessageBubbleVariants} from "@sy-inc/styles";

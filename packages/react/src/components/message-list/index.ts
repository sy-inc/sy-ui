import type {ComponentProps} from "react";

import {
  MessageListContent,
  MessageListRoot,
  MessageListScrollButton,
  MessageListViewport,
} from "./message-list";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const MessageList = Object.assign(MessageListRoot, {
  Content: MessageListContent,
  Root: MessageListRoot,
  ScrollButton: MessageListScrollButton,
  Viewport: MessageListViewport,
});

export type MessageList = {
  Props: ComponentProps<typeof MessageListRoot>;
  RootProps: ComponentProps<typeof MessageListRoot>;
  ViewportProps: ComponentProps<typeof MessageListViewport>;
  ContentProps: ComponentProps<typeof MessageListContent>;
  ScrollButtonProps: ComponentProps<typeof MessageListScrollButton>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {MessageListRoot, MessageListViewport, MessageListContent, MessageListScrollButton};

export type {
  MessageListRootProps,
  MessageListRootProps as MessageListProps,
  MessageListViewportProps,
  MessageListContentProps,
  MessageListScrollButtonProps,
} from "./message-list";
export {messageListVariants, type MessageListVariants} from "@sy-inc/styles";

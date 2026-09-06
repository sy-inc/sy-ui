import type {ComponentProps} from "react";

import {MessageListRoot} from "./message-list";

export const MessageList = Object.assign(MessageListRoot, {
  Root: MessageListRoot,
});

export type MessageList = {
  Props: ComponentProps<typeof MessageListRoot>;
  RootProps: ComponentProps<typeof MessageListRoot>;
};

export {MessageListRoot};
export type {MessageListRootProps, MessageListRootProps as MessageListProps} from "./message-list";
export {messageListVariants, type MessageListVariants} from "@sy-inc/styles";

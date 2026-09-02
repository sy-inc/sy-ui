import type {ComponentProps} from "react";

import {
  PromptInputAction,
  PromptInputAttachments,
  PromptInputContent,
  PromptInputFooter,
  PromptInputQueue,
  PromptInputQueueItem,
  PromptInputQueueItemActions,
  PromptInputQueueItemBody,
  PromptInputQueueItemContent,
  PromptInputQueueItemHandle,
  PromptInputQueueItemIcon,
  PromptInputQueueItemMore,
  PromptInputQueueItemRemove,
  PromptInputRoot,
  PromptInputSend,
  PromptInputShell,
  PromptInputTextArea,
  PromptInputToolbar,
  PromptInputToolbarEnd,
  PromptInputToolbarStart,
} from "./prompt-input";

/* -------------------------------------------------------------------------------------------------
 * Compound component
 * -----------------------------------------------------------------------------------------------*/
export const PromptInput = Object.assign(PromptInputRoot, {
  Root: PromptInputRoot,
  Shell: PromptInputShell,
  Content: PromptInputContent,
  Attachments: PromptInputAttachments,
  TextArea: PromptInputTextArea,
  Toolbar: PromptInputToolbar,
  ToolbarStart: PromptInputToolbarStart,
  ToolbarEnd: PromptInputToolbarEnd,
  Action: PromptInputAction,
  Send: PromptInputSend,
  Footer: PromptInputFooter,
  Queue: Object.assign(PromptInputQueue, {
    Item: Object.assign(PromptInputQueueItem, {
      Handle: PromptInputQueueItemHandle,
      Body: PromptInputQueueItemBody,
      Icon: PromptInputQueueItemIcon,
      Content: PromptInputQueueItemContent,
      Actions: PromptInputQueueItemActions,
      Remove: PromptInputQueueItemRemove,
      More: PromptInputQueueItemMore,
    }),
  }),
});

export type PromptInput = {
  Props: ComponentProps<typeof PromptInputRoot>;
  RootProps: ComponentProps<typeof PromptInputRoot>;
};

export * from "./prompt-input";
export type {PromptInputRootProps as PromptInputProps} from "./prompt-input";

export {promptInputQueueClasses, promptInputVariants} from "@sy-inc/styles";
export type {PromptInputVariants} from "@sy-inc/styles";

import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const messageBubbleVariants = tv({
  defaultVariants: {
    direction: "received",
  },
  slots: {
    content: "message-bubble__content",
    root: "message-bubble",
    text: "message-bubble__text",
    time: "message-bubble__time",
    timeSpace: "message-bubble__time-space",
  },
  variants: {
    direction: {
      received: {root: "message-bubble--received"},
      sent: {root: "message-bubble--sent"},
    },
  },
});

export type MessageBubbleVariants = VariantProps<typeof messageBubbleVariants>;

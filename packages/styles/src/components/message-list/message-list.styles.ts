import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const messageListVariants = tv({
  slots: {
    content: "message-list__content",
    root: "message-list",
    scrollButton: "message-list__scroll-button",
    viewport: "message-list__viewport",
  },
});

export type MessageListVariants = VariantProps<typeof messageListVariants>;

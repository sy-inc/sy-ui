import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const promptInputVariants = tv({
  defaultVariants: {
    size: "md",
    variant: "primary",
  },
  slots: {
    action: "prompt-input__action",
    attachments: "prompt-input__attachments",
    base: "prompt-input",
    content: "prompt-input__content",
    footer: "prompt-input__footer",
    send: "prompt-input__send",
    shell: "prompt-input__shell",
    textarea: "prompt-input__textarea",
    toolbar: "prompt-input__toolbar",
    toolbarEnd: "prompt-input__toolbar-end",
    toolbarStart: "prompt-input__toolbar-start",
  },
  variants: {
    size: {
      lg: {
        base: "prompt-input--lg",
      },
      md: {
        base: "prompt-input--md",
      },
      sm: {
        base: "prompt-input--sm",
      },
    },
    variant: {
      primary: {
        shell: "prompt-input__shell--primary",
      },
      secondary: {
        shell: "prompt-input__shell--secondary",
      },
    },
  },
});

/** The queue has no variants: plain BEM class names are enough. */
export const promptInputQueueClasses = {
  action: "prompt-input__queue-item-action",
  actions: "prompt-input__queue-item-actions",
  base: "prompt-input__queue",
  body: "prompt-input__queue-item-body",
  content: "prompt-input__queue-item-content",
  dropIndicator: "prompt-input__queue-drop-indicator",
  handle: "prompt-input__queue-item-handle",
  icon: "prompt-input__queue-item-icon",
  item: "prompt-input__queue-item",
} as const;

export type PromptInputVariants = VariantProps<typeof promptInputVariants>;

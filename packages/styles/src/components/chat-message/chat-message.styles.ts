import {tv} from "tailwind-variants";

export const chatMessageVariants = tv({
  slots: {
    actions: "chat-message__actions",
    /* The block is the conversation, so a message row is an element of it. */
    assistant: "chat-message__row chat-message__row--assistant",
    avatar: "chat-message__avatar",
    body: "chat-message__body",
    bubble: "chat-message__bubble",
    content: "chat-message__content",
    root: "chat-message",
    user: "chat-message__row chat-message__row--user",
  },
});

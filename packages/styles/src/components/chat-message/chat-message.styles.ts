import {tv} from "tailwind-variants";

export const chatMessageVariants = tv({
  slots: {
    actions: "chat-message__actions",
    assistant: "chat-message--assistant",
    avatar: "chat-message__avatar",
    body: "chat-message__body",
    bubble: "chat-message__bubble",
    content: "chat-message__content",
    root: "chat-message",
    user: "chat-message--user",
  },
});

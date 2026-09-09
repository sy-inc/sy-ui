"use client";

import type {MessageBubbleVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {messageBubbleVariants} from "@sy-inc/styles";

import {composeSlotClassName} from "../../utils/compose";

/* The non-root parts carry no variant, so their classes are constant. */
const slots = messageBubbleVariants();

/* -------------------------------------------------------------------------------------------------
 * MessageBubble Root — the row that aligns the bubble to one side.
 * -----------------------------------------------------------------------------------------------*/
export interface MessageBubbleRootProps
  extends ComponentPropsWithRef<"div">, MessageBubbleVariants {}

export const MessageBubbleRoot = ({
  className,
  direction = "received",
  ...props
}: MessageBubbleRootProps) => {
  const slots = messageBubbleVariants({direction});

  return (
    <div
      {...props}
      className={composeSlotClassName(slots.root, className)}
      data-direction={direction}
      data-slot="message-bubble"
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * MessageBubble Content — the painted bubble. Holds Text, images, and Time.
 * -----------------------------------------------------------------------------------------------*/
export interface MessageBubbleContentProps extends ComponentPropsWithRef<"div"> {}

export const MessageBubbleContent = ({className, ...props}: MessageBubbleContentProps) => (
  <div
    {...props}
    className={composeSlotClassName(slots.content, className)}
    data-slot="message-bubble-content"
  />
);

/* -------------------------------------------------------------------------------------------------
 * MessageBubble Text — the message body. Omit it for an image-only bubble.
 * -----------------------------------------------------------------------------------------------*/
export interface MessageBubbleTextProps extends ComponentPropsWithRef<"div"> {}

export const MessageBubbleText = ({className, ...props}: MessageBubbleTextProps) => (
  <div
    {...props}
    className={composeSlotClassName(slots.text, className)}
    data-slot="message-bubble-text"
  />
);

/* -------------------------------------------------------------------------------------------------
 * MessageBubble Time — the timestamp pinned to the bubble corner.
 *
 * The timestamp is absolutely positioned, so it also renders an invisible inline
 * copy that reserves room on the last line of text. Place Time inside Text to
 * get that reservation; place it directly in Content for an image-only bubble,
 * where the copy is dropped by CSS.
 * -----------------------------------------------------------------------------------------------*/
export interface MessageBubbleTimeProps extends ComponentPropsWithRef<"time"> {
  children?: string;
}

export const MessageBubbleTime = ({children, className, ...props}: MessageBubbleTimeProps) => (
  <>
    <span aria-hidden="true" className={slots.timeSpace()} data-time={children} />
    <time
      {...props}
      className={composeSlotClassName(slots.time, className)}
      data-slot="message-bubble-time"
    >
      {children}
    </time>
  </>
);

MessageBubbleRoot.displayName = "SY INC.MessageBubble";
MessageBubbleContent.displayName = "SY INC.MessageBubble.Content";
MessageBubbleText.displayName = "SY INC.MessageBubble.Text";
MessageBubbleTime.displayName = "SY INC.MessageBubble.Time";

"use client";

import {messageBubbleVariants} from "@sy-inc/styles";
import React, {Children, Fragment, isValidElement} from "react";

import {composeSlotClassName} from "../../utils/compose";

export interface MessageBubbleProps {
  className?: string;
  content?: React.ReactNode;
  direction?: "sent" | "received";
  ref?: React.Ref<HTMLDivElement>;
  time?: string | null;
}

export const MessageBubble = ({
  className,
  content,
  direction = "received",
  ref,
  time,
}: MessageBubbleProps) => {
  const slots = messageBubbleVariants({direction});
  const hasTime = Boolean(time?.trim());
  const images: React.ReactNode[] = [];
  const caption: React.ReactNode[] = [];
  const collect = (children: React.ReactNode) => {
    Children.forEach(children, (child) => {
      if (isValidElement<{children?: React.ReactNode}>(child) && child.type === Fragment) {
        collect(child.props.children);

        return;
      }
      if (child == null || typeof child === "boolean") return;

      const image = isValidElement(child) && (child.type === "img" || child.type === "picture");

      (image ? images : caption).push(child);
    });
  };

  collect(content);
  const hasCaption = caption.some((child) => typeof child !== "string" || child.trim().length > 0);

  if (!images.length && !hasCaption) return null;

  const imageOnly = images.length > 0 && !hasCaption;
  const timestamp = hasTime ? (
    <time className={slots.time()} data-slot="message-bubble-time">
      {time}
    </time>
  ) : null;

  return (
    <div
      ref={ref}
      className={composeSlotClassName(slots.root, className)}
      data-direction={direction}
      data-slot="message-bubble"
    >
      <div
        className={slots.content()}
        data-image-only={imageOnly || undefined}
        data-slot="message-bubble-content"
      >
        {Children.toArray(images)}
        {imageOnly ? (
          timestamp
        ) : (
          <div className={slots.text()} data-slot="message-bubble-text">
            {Children.toArray(caption)}
            {hasTime ? (
              <span aria-hidden="true" className={slots.timeSpace()} data-time={time} />
            ) : null}
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

MessageBubble.displayName = "SY INC.MessageBubble";

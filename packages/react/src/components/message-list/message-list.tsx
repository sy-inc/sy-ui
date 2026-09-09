"use client";

import type {ComponentProps, ComponentPropsWithRef} from "react";
import type {StickToBottomInstance} from "use-stick-to-bottom";

import {mergeRefs} from "@react-aria/utils";
import {messageListVariants} from "@sy-inc/styles";
import {createContext, use, useMemo} from "react";
import {useStickToBottom} from "use-stick-to-bottom";

import {composeSlotClassName} from "../../utils/compose";
import {Button} from "../button";
import {IconChevronDown} from "../icons";

const slots = messageListVariants();

const MessageListContext = createContext<StickToBottomInstance | null>(null);

const useMessageList = (part: string) => {
  const instance = use(MessageListContext);

  if (!instance) {
    throw new Error(`MessageList.${part} must be rendered inside MessageList.Root`);
  }

  return instance;
};

/* -------------------------------------------------------------------------------------------------
 * MessageList Root
 * -----------------------------------------------------------------------------------------------*/
export interface MessageListRootProps extends ComponentPropsWithRef<"div"> {}

export const MessageListRoot = ({children, className, ...props}: MessageListRootProps) => {
  const instance = useStickToBottom({initial: "instant", resize: "instant"});

  return (
    <MessageListContext value={instance}>
      <div
        {...props}
        className={composeSlotClassName(slots.root, className)}
        data-slot="message-list"
      >
        {children}
      </div>
    </MessageListContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MessageList Viewport — the scroll container. Size it; it may be the page scroller.
 * -----------------------------------------------------------------------------------------------*/
export interface MessageListViewportProps extends ComponentPropsWithRef<"div"> {}

export const MessageListViewport = ({className, ref, ...props}: MessageListViewportProps) => {
  const {scrollRef} = useMessageList("Viewport");
  const mergedRef = useMemo(() => mergeRefs<HTMLDivElement>(scrollRef, ref), [scrollRef, ref]);

  return (
    <div
      aria-label="Messages"
      role="region"
      tabIndex={0}
      {...props}
      ref={mergedRef}
      className={composeSlotClassName(slots.viewport, className)}
      data-slot="message-list-viewport"
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * MessageList Content — resize-observed message column.
 * -----------------------------------------------------------------------------------------------*/
export interface MessageListContentProps extends ComponentPropsWithRef<"div"> {}

export const MessageListContent = ({className, ref, ...props}: MessageListContentProps) => {
  const {contentRef} = useMessageList("Content");
  const mergedRef = useMemo(() => mergeRefs<HTMLDivElement>(contentRef, ref), [contentRef, ref]);

  return (
    <div
      {...props}
      ref={mergedRef}
      className={composeSlotClassName(slots.content, className)}
      data-slot="message-list-content"
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * MessageList ScrollButton — zero-height sticky dock holding the arrow while away from the bottom.
 * -----------------------------------------------------------------------------------------------*/
export interface MessageListScrollButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "className"
> {
  className?: string;
}

export const MessageListScrollButton = ({
  "aria-label": ariaLabel = "Scroll to latest message",
  children = <IconChevronDown />,
  className,
  variant = "secondary",
  ...props
}: MessageListScrollButtonProps) => {
  const {isNearBottom, scrollToBottom} = useMessageList("ScrollButton");

  return (
    <div className={slots.dock()} data-slot="message-list-scroll-button-dock">
      {!isNearBottom ? (
        <Button
          isIconOnly
          aria-label={ariaLabel}
          variant={variant}
          {...props}
          className={composeSlotClassName(slots.scrollButton, className)}
          data-slot="message-list-scroll-button"
          onPress={(event) => {
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            void scrollToBottom(reducedMotion ? "instant" : "smooth");
            props.onPress?.(event);
          }}
        >
          {children}
        </Button>
      ) : null}
    </div>
  );
};

MessageListRoot.displayName = "SY INC.MessageList";
MessageListViewport.displayName = "SY INC.MessageList.Viewport";
MessageListContent.displayName = "SY INC.MessageList.Content";
MessageListScrollButton.displayName = "SY INC.MessageList.ScrollButton";

"use client";

import type {ComponentPropsWithRef} from "react";

import {mergeRefs} from "@react-aria/utils";
import {messageListVariants} from "@sy-inc/styles";
import {useMemo} from "react";
import {useStickToBottom} from "use-stick-to-bottom";

import {composeSlotClassName} from "../../utils/compose";
import {Button} from "../button";
import {IconChevronDown} from "../icons";

export interface MessageListRootProps extends ComponentPropsWithRef<"div"> {
  /** Props and ref for the keyboard-scrollable region. */
  viewportProps?: Omit<ComponentPropsWithRef<"div">, "children" | "dangerouslySetInnerHTML">;
  /** Accessible name of the floating button. */
  scrollToBottomLabel?: string;
}

export const MessageListRoot = ({
  children,
  className,
  ref,
  scrollToBottomLabel = "Scroll to latest message",
  viewportProps = {},
  ...props
}: MessageListRootProps) => {
  const {contentRef, isNearBottom, scrollRef, scrollToBottom} = useStickToBottom({
    initial: "instant",
    resize: "instant",
  });
  const {className: viewportClassName, ref: viewportRef, ...scrollProps} = viewportProps;
  const mergedScrollRef = useMemo(
    () => mergeRefs<HTMLDivElement>(scrollRef, viewportRef),
    [scrollRef, viewportRef],
  );
  const slots = messageListVariants();

  return (
    <div
      {...props}
      ref={ref}
      className={composeSlotClassName(slots.root, className)}
      data-slot="message-list"
    >
      <div
        aria-label="Messages"
        role="region"
        tabIndex={0}
        {...scrollProps}
        ref={mergedScrollRef}
        className={composeSlotClassName(slots.viewport, viewportClassName)}
        data-slot="message-list-viewport"
      >
        <div ref={contentRef} className={slots.content()} data-slot="message-list-content">
          {children}
        </div>
      </div>
      {!isNearBottom ? (
        <Button
          isIconOnly
          aria-label={scrollToBottomLabel}
          className={slots.scrollButton()}
          data-slot="message-list-scroll-button"
          onPress={() => {
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            void scrollToBottom(reducedMotion ? "instant" : "smooth");
          }}
          variant="secondary"
        >
          <IconChevronDown />
        </Button>
      ) : null}
    </div>
  );
};

MessageListRoot.displayName = "SY INC.MessageList";

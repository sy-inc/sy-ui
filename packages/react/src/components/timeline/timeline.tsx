"use client";

import type {TimelineVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {timelineVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";

type TimelineStatus = "default" | "current" | "success" | "warning" | "danger" | "muted";
type TimelineAlign = "start" | "center";

type TimelineSlots = ReturnType<typeof timelineVariants>;

const TimelineContext = createContext<TimelineSlots | null>(null);
const TimelineItemContext = createContext<{slots: TimelineSlots; status: TimelineStatus} | null>(
  null,
);

const useTimeline = (part: string) => {
  const slots = use(TimelineContext);

  if (!slots) throw new Error(`${part} must be used within Timeline`);

  return slots;
};

const useTimelineItem = (part: string) => {
  const item = use(TimelineItemContext);

  if (!item) throw new Error(`${part} must be used within Timeline.Item`);

  return item;
};

interface TimelineRootProps
  extends Omit<ComponentPropsWithRef<"ol">, "children">, TimelineVariants {
  children: ReactNode;
}

const TimelineRoot = React.forwardRef<HTMLOListElement, TimelineRootProps>(
  ({axis, children, className, density, placement, size, ...props}, ref) => {
    const slots = React.useMemo(
      () => timelineVariants({axis, density, placement, size}),
      [axis, density, placement, size],
    );

    return (
      <TimelineContext value={slots}>
        <ol ref={ref} className={slots.base({className})} data-slot="timeline" {...props}>
          {children}
        </ol>
      </TimelineContext>
    );
  },
);

TimelineRoot.displayName = "SY INC.Timeline";

interface TimelineItemProps extends ComponentPropsWithRef<"li"> {
  align?: TimelineAlign;
  status?: TimelineStatus;
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({align = "start", className, status = "default", ...props}, ref) => {
    const slots = useTimeline("Timeline.Item");
    const item = React.useMemo(() => ({slots, status}), [slots, status]);

    return (
      <TimelineItemContext value={item}>
        <li
          ref={ref}
          aria-current={status === "current" || undefined}
          className={slots.item({className})}
          data-align={align}
          data-slot="timeline-item"
          data-status={status}
          {...props}
        />
      </TimelineItemContext>
    );
  },
);

TimelineItem.displayName = "SY INC.Timeline.Item";

interface TimelineRailProps extends ComponentPropsWithRef<"span"> {}

const TimelineRail = React.forwardRef<HTMLSpanElement, TimelineRailProps>(
  ({children, className, ...props}, ref) => {
    const {slots} = useTimelineItem("Timeline.Rail");

    return (
      <span ref={ref} className={slots.rail({className})} data-slot="timeline-rail" {...props}>
        {children ?? <TimelineMarker />}
        <span aria-hidden="true" className={slots.connector()} data-slot="timeline-connector" />
      </span>
    );
  },
);

TimelineRail.displayName = "SY INC.Timeline.Rail";

interface TimelineMarkerProps extends ComponentPropsWithRef<"span"> {}

const TimelineMarker = React.forwardRef<HTMLSpanElement, TimelineMarkerProps>(
  ({children, className, ...props}, ref) => {
    const {slots, status} = useTimelineItem("Timeline.Marker");

    return (
      <span
        ref={ref}
        aria-hidden={children == null || undefined}
        className={slots.marker({className})}
        data-slot="timeline-marker"
        data-status={status}
        {...props}
      >
        {children}
      </span>
    );
  },
);

TimelineMarker.displayName = "SY INC.Timeline.Marker";

interface TimelineContentProps extends ComponentPropsWithRef<"div"> {}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({className, ...props}, ref) => {
    const {slots} = useTimelineItem("Timeline.Content");

    return (
      <div
        ref={ref}
        className={slots.content({className})}
        data-slot="timeline-content"
        {...props}
      />
    );
  },
);

TimelineContent.displayName = "SY INC.Timeline.Content";

export {TimelineContent, TimelineItem, TimelineMarker, TimelineRail, TimelineRoot};

export type {
  TimelineAlign,
  TimelineContentProps,
  TimelineItemProps,
  TimelineMarkerProps,
  TimelineRailProps,
  TimelineRootProps,
  TimelineRootProps as TimelineProps,
  TimelineStatus,
};

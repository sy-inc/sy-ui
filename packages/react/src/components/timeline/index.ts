import type {ComponentProps} from "react";

import {
  TimelineContent,
  TimelineItem,
  TimelineMarker,
  TimelineRail,
  TimelineRoot,
} from "./timeline";

export const Timeline = Object.assign(TimelineRoot, {
  Content: TimelineContent,
  Item: TimelineItem,
  Marker: TimelineMarker,
  Rail: TimelineRail,
  Root: TimelineRoot,
});

export type Timeline = {
  ContentProps: ComponentProps<typeof TimelineContent>;
  ItemProps: ComponentProps<typeof TimelineItem>;
  MarkerProps: ComponentProps<typeof TimelineMarker>;
  Props: ComponentProps<typeof TimelineRoot>;
  RailProps: ComponentProps<typeof TimelineRail>;
  RootProps: ComponentProps<typeof TimelineRoot>;
};

export {
  TimelineContent,
  TimelineItem,
  TimelineMarker,
  TimelineRail,
  TimelineRoot,
} from "./timeline";

export type {
  TimelineAlign,
  TimelineContentProps,
  TimelineItemProps,
  TimelineMarkerProps,
  TimelineRailProps,
  TimelineRootProps,
  TimelineRootProps as TimelineProps,
  TimelineStatus,
} from "./timeline";

export {timelineVariants} from "@sy-inc/styles";
export type {TimelineVariants} from "@sy-inc/styles";

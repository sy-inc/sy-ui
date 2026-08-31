import type {ComponentProps} from "react";

import {SegmentItem, SegmentRoot} from "./segment";

export const Segment = Object.assign(SegmentRoot, {
  Root: SegmentRoot,
  Item: SegmentItem,
});

export type Segment = {
  Props: ComponentProps<typeof SegmentRoot>;
  RootProps: ComponentProps<typeof SegmentRoot>;
  ItemProps: ComponentProps<typeof SegmentItem>;
};

export {SegmentRoot, SegmentItem};
export type {SegmentRootProps, SegmentRootProps as SegmentProps, SegmentItemProps} from "./segment";
export {segmentVariants} from "@sy-inc/styles";
export type {SegmentVariants} from "@sy-inc/styles";

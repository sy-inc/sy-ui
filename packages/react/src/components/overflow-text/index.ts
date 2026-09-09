import type {ComponentProps} from "react";

import {OverflowTextContent, OverflowTextRoot, OverflowTextViewport} from "./overflow-text";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const OverflowText = Object.assign(OverflowTextRoot, {
  Root: OverflowTextRoot,
  Viewport: OverflowTextViewport,
  Content: OverflowTextContent,
});

export type OverflowText = {
  Props: ComponentProps<typeof OverflowTextRoot>;
  RootProps: ComponentProps<typeof OverflowTextRoot>;
  ViewportProps: ComponentProps<typeof OverflowTextViewport>;
  ContentProps: ComponentProps<typeof OverflowTextContent>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {OverflowTextContent, OverflowTextRoot, OverflowTextViewport};

export type {
  OverflowTextContentProps,
  OverflowTextRootProps,
  OverflowTextRootProps as OverflowTextProps,
  OverflowTextViewportProps,
} from "./overflow-text";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {overflowTextVariants} from "@sy-inc/styles";

export type {OverflowTextVariants} from "@sy-inc/styles";

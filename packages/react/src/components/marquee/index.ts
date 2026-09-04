import type {ComponentProps} from "react";

import {MarqueeContent, MarqueePrefix, MarqueeRoot, MarqueeSuffix} from "./marquee";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Marquee = Object.assign(MarqueeRoot, {
  Root: MarqueeRoot,
  Content: MarqueeContent,
  Prefix: MarqueePrefix,
  Suffix: MarqueeSuffix,
});

export type Marquee = {
  Props: ComponentProps<typeof MarqueeRoot>;
  RootProps: ComponentProps<typeof MarqueeRoot>;
  ContentProps: ComponentProps<typeof MarqueeContent>;
  PrefixProps: ComponentProps<typeof MarqueePrefix>;
  SuffixProps: ComponentProps<typeof MarqueeSuffix>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {MarqueeContent, MarqueePrefix, MarqueeRoot, MarqueeSuffix};

export type {
  MarqueeRootProps,
  MarqueeRootProps as MarqueeProps,
  MarqueeContentProps,
  MarqueePrefixProps,
  MarqueeSuffixProps,
  MarqueeDirection,
  MarqueeStyle,
} from "./marquee";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {marqueeVariants} from "@sy-inc/styles";

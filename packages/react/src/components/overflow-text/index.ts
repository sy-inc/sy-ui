import type {ComponentProps} from "react";

import {OverflowTextRoot} from "./overflow-text";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const OverflowText = Object.assign(OverflowTextRoot, {
  Root: OverflowTextRoot,
});

export type OverflowText = {
  Props: ComponentProps<typeof OverflowTextRoot>;
  RootProps: ComponentProps<typeof OverflowTextRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {OverflowTextRoot};

export type {
  OverflowTextRootProps,
  OverflowTextRootProps as OverflowTextProps,
} from "./overflow-text";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {overflowTextVariants} from "@sy-inc/styles";

export type {OverflowTextVariants} from "@sy-inc/styles";

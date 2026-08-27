import type {ComponentProps} from "react";

import {SeparatorRoot} from "./separator";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Separator = Object.assign(SeparatorRoot, {
  Root: SeparatorRoot,
});

export type Separator = {
  Props: ComponentProps<typeof SeparatorRoot>;
  RootProps: ComponentProps<typeof SeparatorRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {SeparatorRoot};

export type {SeparatorRootProps, SeparatorRootProps as SeparatorProps} from "./separator";

/* -------------------------------------------------------------------------------------------------
 * Content
 * -----------------------------------------------------------------------------------------------*/
export {SeparatorContent} from "./separator-content";

export type {SeparatorContentProps} from "./separator-content";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {separatorContentVariants, separatorVariants} from "@sy-ui/styles";

export type {SeparatorContentVariants, SeparatorVariants} from "@sy-ui/styles";

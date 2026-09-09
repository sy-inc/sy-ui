import type {ComponentProps} from "react";

import {ActionBarRoot} from "./action-bar";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const ActionBar = Object.assign(ActionBarRoot, {
  Root: ActionBarRoot,
});

export type ActionBar = {
  Props: ComponentProps<typeof ActionBarRoot>;
  RootProps: ComponentProps<typeof ActionBarRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {ActionBarRoot};

export type {ActionBarRootProps, ActionBarRootProps as ActionBarProps} from "./action-bar";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {actionBarVariants} from "@sy-inc/styles";

export type {ActionBarVariants} from "@sy-inc/styles";

import type {ComponentProps} from "react";

import {SplitViewBack, SplitViewContent, SplitViewPane, SplitViewRoot} from "./split-view";

export const SplitView = Object.assign(SplitViewRoot, {
  Root: SplitViewRoot,
  Content: SplitViewContent,
  Pane: SplitViewPane,
  Back: SplitViewBack,
});

export type SplitView = {
  Props: ComponentProps<typeof SplitViewRoot>;
  RootProps: ComponentProps<typeof SplitViewRoot>;
  ContentProps: ComponentProps<typeof SplitViewContent>;
  PaneProps: ComponentProps<typeof SplitViewPane>;
  BackProps: ComponentProps<typeof SplitViewBack>;
};

export {SplitViewRoot, SplitViewContent, SplitViewPane, SplitViewBack};
export type {
  SplitViewRootProps,
  SplitViewRootProps as SplitViewProps,
  SplitViewContentProps,
  SplitViewPaneProps,
  SplitViewBackProps,
  SplitViewPaneName,
  SplitViewTier,
  SplitViewMediumBehavior,
  SplitViewLayout,
  SplitViewPaneFocusEvent,
} from "./split-view";

export {splitViewVariants} from "@sy-inc/styles";
export type {SplitViewVariants} from "@sy-inc/styles";

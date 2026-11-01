import type {ComponentProps} from "react";

import {
  ViewStackBack,
  ViewStackHeader,
  ViewStackRoot,
  ViewStackTitle,
  ViewStackView,
  useViewStack,
} from "./view-stack";

export const ViewStack = Object.assign(ViewStackRoot, {
  Back: ViewStackBack,
  Header: ViewStackHeader,
  Root: ViewStackRoot,
  Title: ViewStackTitle,
  View: ViewStackView,
});

export type ViewStack = {
  BackProps: ComponentProps<typeof ViewStackBack>;
  HeaderProps: ComponentProps<typeof ViewStackHeader>;
  Props: ComponentProps<typeof ViewStackRoot>;
  RootProps: ComponentProps<typeof ViewStackRoot>;
  TitleProps: ComponentProps<typeof ViewStackTitle>;
  ViewProps: ComponentProps<typeof ViewStackView>;
};

export {ViewStackBack, ViewStackHeader, ViewStackRoot, ViewStackTitle, ViewStackView, useViewStack};

export type {
  ViewStackBackProps,
  ViewStackDirection,
  ViewStackHeaderProps,
  ViewStackRootProps,
  ViewStackRootProps as ViewStackProps,
  ViewStackState,
  ViewStackStateProps,
  ViewStackTitleProps,
  ViewStackViewProps,
} from "./view-stack";

export {viewStackVariants} from "@sy-inc/styles";
export type {ViewStackVariants} from "@sy-inc/styles";

import type {ComponentProps} from "react";

import {
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperRoot,
  StepperTitle,
} from "./stepper";

export const Stepper = Object.assign(StepperRoot, {
  Content: StepperContent,
  Description: StepperDescription,
  Indicator: StepperIndicator,
  Item: StepperItem,
  Root: StepperRoot,
  Title: StepperTitle,
});

export type Stepper = {
  ContentProps: ComponentProps<typeof StepperContent>;
  DescriptionProps: ComponentProps<typeof StepperDescription>;
  IndicatorProps: ComponentProps<typeof StepperIndicator>;
  ItemProps: ComponentProps<typeof StepperItem>;
  Props: ComponentProps<typeof StepperRoot>;
  RootProps: ComponentProps<typeof StepperRoot>;
  TitleProps: ComponentProps<typeof StepperTitle>;
};

export {
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperRoot,
  StepperTitle,
};

export type {
  StepperContentProps,
  StepperDescriptionProps,
  StepperIndicatorProps,
  StepperItemProps,
  StepperItemRenderProps,
  StepperItemStatus,
  StepperRootProps,
  StepperRootProps as StepperProps,
  StepperStateProps,
  StepperStatus,
  StepperTitleProps,
} from "./stepper";

export {stepperVariants} from "@sy-inc/styles";
export type {StepperVariants} from "@sy-inc/styles";

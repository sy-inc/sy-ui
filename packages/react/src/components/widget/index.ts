import type {ComponentProps} from "react";

import {
  WidgetContent,
  WidgetFooter,
  WidgetHeader,
  WidgetLegend,
  WidgetLegendItem,
  WidgetRoot,
  WidgetTitle,
} from "./widget";

export const Widget = Object.assign(WidgetRoot, {
  Root: WidgetRoot,
  Header: WidgetHeader,
  Footer: WidgetFooter,
  Title: WidgetTitle,
  Content: WidgetContent,
  Legend: WidgetLegend,
  LegendItem: WidgetLegendItem,
});

export type Widget = {
  Props: ComponentProps<typeof WidgetRoot>;
  RootProps: ComponentProps<typeof WidgetRoot>;
  HeaderProps: ComponentProps<typeof WidgetHeader>;
  FooterProps: ComponentProps<typeof WidgetFooter>;
  TitleProps: ComponentProps<typeof WidgetTitle>;
  ContentProps: ComponentProps<typeof WidgetContent>;
  LegendProps: ComponentProps<typeof WidgetLegend>;
  LegendItemProps: ComponentProps<typeof WidgetLegendItem>;
};

export {
  WidgetRoot,
  WidgetHeader,
  WidgetFooter,
  WidgetTitle,
  WidgetContent,
  WidgetLegend,
  WidgetLegendItem,
};

export type {
  WidgetRootProps,
  WidgetRootProps as WidgetProps,
  WidgetHeaderProps,
  WidgetFooterProps,
  WidgetTitleProps,
  WidgetContentProps,
  WidgetLegendProps,
  WidgetLegendItemProps,
} from "./widget";

export {widgetVariants} from "@sy-inc/styles";
export type {WidgetVariants} from "@sy-inc/styles";

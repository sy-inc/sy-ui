import type {ComponentProps} from "react";

import {
  KPIActions,
  KPIChart,
  KPIContent,
  KPIFooter,
  KPIHeader,
  KPIIcon,
  KPIProgress,
  KPIRoot,
  KPITitle,
  KPITrend,
  KPIValue,
} from "./kpi";

export const KPI = Object.assign(KPIRoot, {
  Actions: KPIActions,
  Chart: KPIChart,
  Content: KPIContent,
  Footer: KPIFooter,
  Header: KPIHeader,
  Icon: KPIIcon,
  Progress: KPIProgress,
  Root: KPIRoot,
  Title: KPITitle,
  Trend: KPITrend,
  Value: KPIValue,
});

export type KPI = {
  ActionsProps: ComponentProps<typeof KPIActions>;
  ChartProps: ComponentProps<typeof KPIChart>;
  ContentProps: ComponentProps<typeof KPIContent>;
  FooterProps: ComponentProps<typeof KPIFooter>;
  HeaderProps: ComponentProps<typeof KPIHeader>;
  IconProps: ComponentProps<typeof KPIIcon>;
  ProgressProps: ComponentProps<typeof KPIProgress>;
  Props: ComponentProps<typeof KPIRoot>;
  RootProps: ComponentProps<typeof KPIRoot>;
  TitleProps: ComponentProps<typeof KPITitle>;
  TrendProps: ComponentProps<typeof KPITrend>;
  ValueProps: ComponentProps<typeof KPIValue>;
};

export {
  KPIActions,
  KPIChart,
  KPIContent,
  KPIFooter,
  KPIHeader,
  KPIIcon,
  KPIProgress,
  KPIRoot,
  KPITitle,
  KPITrend,
  KPIValue,
};

export type {
  KPIActionsProps,
  KPIChartProps,
  KPIContentProps,
  KPIFooterProps,
  KPIHeaderProps,
  KPIIconProps,
  KPIProgressProps,
  KPIRootProps,
  KPIRootProps as KPIProps,
  KPITitleProps,
  KPITrendProps,
  KPIValueProps,
} from "./kpi";

export {kpiVariants} from "@sy-inc/styles";
export type {KPIVariants} from "@sy-inc/styles";

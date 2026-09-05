"use client";

import type {CardProps} from "../card";
import type {ProgressBarVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {useNumberFormatter} from "@react-aria/i18n";
import {kpiVariants} from "@sy-inc/styles";
import React from "react";

import {composeTwRenderProps} from "../../utils";
import {Button} from "../button";
import {Card} from "../card";
import {Chip} from "../chip";
import {IconArrowUp, IconEllipsis} from "../icons";
import {ProgressBar} from "../progress-bar";

// No variants: the slot → BEM class map is a constant, resolve it once.
const slots = kpiVariants();

export interface KPIRootProps extends CardProps {}

export type KPIHeaderProps = ComponentPropsWithRef<"div">;
export type KPIContentProps = ComponentPropsWithRef<"div">;
export type KPIIconProps = ComponentPropsWithRef<"div"> & {
  color?: "success" | "warning" | "danger";
};
export type KPITitleProps = ComponentPropsWithRef<"div">;

export interface KPIValueProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  value: number;
  children?: ReactNode | ((formatted: string) => ReactNode);
  /** Passed to `Intl.NumberFormat`; the locale comes from the nearest `I18nProvider`. */
  formatOptions?: Intl.NumberFormatOptions;
}

export interface KPITrendProps extends Omit<ComponentPropsWithRef<typeof Chip>, "color"> {
  trend?: "up" | "down" | "neutral";
}

export interface KPIProgressProps extends Omit<
  ComponentPropsWithRef<typeof ProgressBar>,
  "children" | "color"
> {
  value: number;
  color?: Extract<ProgressBarVariants["color"], "success" | "warning" | "danger">;
}

export type KPIActionsProps = ComponentPropsWithRef<typeof Button>;

export interface KPIChartProps extends ComponentPropsWithRef<"div"> {
  /** Fixed height of the chart area in pixels. @default 80 */
  height?: number;
}

export type KPIFooterProps = ComponentPropsWithRef<"div">;

const KPIRoot = ({className, ...props}: KPIRootProps) => (
  <Card {...props} className={slots.base({className})} data-slot="kpi" />
);

const KPIHeader = ({className, ...props}: KPIHeaderProps) => (
  <div {...props} className={slots.header({className})} data-slot="kpi-header" />
);

const KPIContent = ({className, ...props}: KPIContentProps) => (
  <div {...props} className={slots.content({className})} data-slot="kpi-content" />
);

const KPIIcon = ({className, color, ...props}: KPIIconProps) => (
  <div {...props} className={slots.icon({className})} data-color={color} data-slot="kpi-icon" />
);

const KPITitle = ({className, ...props}: KPITitleProps) => (
  <div {...props} className={slots.title({className})} data-slot="kpi-title" />
);

const KPIValue = ({children, className, formatOptions, value, ...props}: KPIValueProps) => {
  const formatted = useNumberFormatter(formatOptions).format(value);

  return (
    <div {...props} className={slots.value({className})} data-slot="kpi-value">
      {typeof children === "function" ? children(formatted) : (children ?? formatted)}
    </div>
  );
};

const trendColor = {
  down: "danger",
  neutral: "default",
  up: "success",
} as const;

const KPITrend = ({
  children,
  className,
  size = "sm",
  trend = "up",
  variant = "soft",
  ...props
}: KPITrendProps) => (
  <Chip
    {...props}
    className={slots.trend({className})}
    color={trendColor[trend]}
    data-slot="kpi-trend"
    data-trend={trend}
    size={size}
    variant={variant}
  >
    {trend === "up" ? (
      <IconArrowUp />
    ) : trend === "down" ? (
      <IconArrowUp className="rotate-180" />
    ) : null}
    {children}
  </Chip>
);

const KPIProgress = ({className, color = "success", value, ...props}: KPIProgressProps) => (
  <ProgressBar
    {...props}
    aria-label={props["aria-label"] ?? "Progress"}
    className={composeTwRenderProps(className, slots.progress())}
    color={color}
    data-slot="kpi-progress"
    size="sm"
    value={value}
  >
    <ProgressBar.Track>
      <ProgressBar.Fill />
    </ProgressBar.Track>
  </ProgressBar>
);

/**
 * Sized, edge-faded container for any chart (Recharts, plain SVG, ...).
 * The library ships no chart dependency; see the KPI stories for a Recharts sparkline recipe.
 */
const KPIChart = ({className, height = 80, style, ...props}: KPIChartProps) => (
  <div
    {...props}
    className={slots.chart({className})}
    data-slot="kpi-chart"
    style={{height, ...style}}
  />
);

const KPIFooter = ({className, ...props}: KPIFooterProps) => (
  <div {...props} className={slots.footer({className})} data-slot="kpi-footer" />
);

const KPIActions = ({
  "aria-label": ariaLabel = "More actions",
  children = <IconEllipsis />,
  className,
  ...props
}: KPIActionsProps) => (
  <Button
    {...props}
    isIconOnly
    aria-label={ariaLabel}
    className={composeTwRenderProps(className, slots.actions())}
    data-slot="kpi-actions"
    size="sm"
    variant="ghost"
  >
    {children}
  </Button>
);

KPIRoot.displayName = "SY INC.KPI";
KPIHeader.displayName = "SY INC.KPI.Header";
KPIContent.displayName = "SY INC.KPI.Content";
KPIIcon.displayName = "SY INC.KPI.Icon";
KPITitle.displayName = "SY INC.KPI.Title";
KPIValue.displayName = "SY INC.KPI.Value";
KPITrend.displayName = "SY INC.KPI.Trend";
KPIProgress.displayName = "SY INC.KPI.Progress";
KPIChart.displayName = "SY INC.KPI.Chart";
KPIFooter.displayName = "SY INC.KPI.Footer";
KPIActions.displayName = "SY INC.KPI.Actions";

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

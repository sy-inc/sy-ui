"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {ReactNode} from "react";

import {widgetVariants} from "@sy-inc/styles";

import {composeSlotClassName} from "../../utils/compose";
import {dom} from "../../utils/dom";

const slots = widgetVariants();

interface WidgetRootProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children: ReactNode;
  className?: string;
}

interface WidgetHeaderProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

interface WidgetTitleProps<
  E extends keyof React.JSX.IntrinsicElements = "h3",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

interface WidgetContentProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

interface WidgetLegendProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

interface WidgetLegendItemProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children: ReactNode;
  className?: string;
  /** CSS color value used by the legend marker. */
  color: string;
}

const WidgetRoot = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: WidgetRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof WidgetRootProps<E>>) => (
  <dom.div
    className={composeSlotClassName(slots.base, className)}
    data-slot="widget"
    {...(props as any)}
  >
    {children}
  </dom.div>
);

const WidgetHeader = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: WidgetHeaderProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof WidgetHeaderProps<E>>) => (
  <dom.div
    className={composeSlotClassName(slots.header, className)}
    data-slot="widget-header"
    {...(props as any)}
  />
);

const WidgetTitle = <E extends keyof React.JSX.IntrinsicElements = "h3">({
  children,
  className,
  ...props
}: WidgetTitleProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof WidgetTitleProps<E>>) => (
  <dom.h3
    className={composeSlotClassName(slots.title, className)}
    data-slot="widget-title"
    {...(props as any)}
  >
    {children}
  </dom.h3>
);

const WidgetContent = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: WidgetContentProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof WidgetContentProps<E>>) => (
  <dom.div
    className={composeSlotClassName(slots.content, className)}
    data-slot="widget-content"
    {...(props as any)}
  />
);

const WidgetLegend = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: WidgetLegendProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof WidgetLegendProps<E>>) => (
  <dom.div
    className={composeSlotClassName(slots.legend, className)}
    data-slot="widget-legend"
    {...(props as any)}
  />
);

const WidgetLegendItem = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  color,
  ...props
}: WidgetLegendItemProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof WidgetLegendItemProps<E>>) => (
  <dom.div
    className={composeSlotClassName(slots.legendItem, className)}
    data-slot="widget-legend-item"
    {...(props as any)}
  >
    <span
      aria-hidden="true"
      className="widget__legend-item-dot"
      data-slot="widget-legend-item-dot"
      style={{backgroundColor: color}}
    />
    <span className="widget__legend-item-label" data-slot="widget-legend-item-label">
      {children}
    </span>
  </dom.div>
);

WidgetRoot.displayName = "SY INC.Widget";
WidgetHeader.displayName = "SY INC.Widget.Header";
WidgetTitle.displayName = "SY INC.Widget.Title";
WidgetContent.displayName = "SY INC.Widget.Content";
WidgetLegend.displayName = "SY INC.Widget.Legend";
WidgetLegendItem.displayName = "SY INC.Widget.LegendItem";

export {WidgetRoot, WidgetHeader, WidgetTitle, WidgetContent, WidgetLegend, WidgetLegendItem};

export type {
  WidgetRootProps,
  WidgetHeaderProps,
  WidgetTitleProps,
  WidgetContentProps,
  WidgetLegendProps,
  WidgetLegendItemProps,
};

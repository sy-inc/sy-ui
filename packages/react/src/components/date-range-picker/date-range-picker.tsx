"use client";

/* Portions adapted from HeroUI v3.2.7 (Apache-2.0): https://github.com/heroui-inc/heroui/pull/6959 */

import type {DOMRenderProps} from "../../utils/dom";
import type {SurfaceVariants} from "../surface";
import type {DateRangePickerVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {DateValue} from "react-aria-components/Calendar";

import {mergeRefs} from "@react-aria/utils";
import {dateRangePickerVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {
  DateRangePicker as DateRangePickerPrimitive,
  Popover as PopoverPrimitive,
} from "react-aria-components/DateRangePicker";

import {usePickerPopoverRender} from "../../hooks/use-picker-popover-render";
import {usePickerTriggerFocus} from "../../hooks/use-picker-trigger-focus";
import {usePopoverExitHold} from "../../hooks/use-popover-exit-hold";
import {dataAttr} from "../../utils/assertion";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {IconCalendar} from "../icons";
import {SurfaceContext} from "../surface";

/* -------------------------------------------------------------------------------------------------
 * DateRangePicker Context
 * -----------------------------------------------------------------------------------------------*/
type DateRangePickerContext = {
  slots?: ReturnType<typeof dateRangePickerVariants>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const DateRangePickerContext = createContext<DateRangePickerContext>({
  triggerRef: {current: null},
});

/* -------------------------------------------------------------------------------------------------
 * DateRangePicker Root
 * -----------------------------------------------------------------------------------------------*/
interface DateRangePickerRootProps<T extends DateValue>
  extends ComponentPropsWithRef<typeof DateRangePickerPrimitive<T>>, DateRangePickerVariants {}

const DateRangePickerRoot = <T extends DateValue>({
  children,
  className,
  onOpenChange,
  ...props
}: DateRangePickerRootProps<T>) => {
  const slots = React.useMemo(() => dateRangePickerVariants(), []);
  const {handleOpenChange, triggerRef} = usePickerTriggerFocus(onOpenChange);

  const dateRangePickerContextValue = React.useMemo(
    () => ({slots, triggerRef}),
    [slots, triggerRef],
  );

  return (
    <DateRangePickerContext value={dateRangePickerContextValue}>
      <DateRangePickerPrimitive
        data-required={dataAttr(props.isRequired)}
        data-slot="date-range-picker"
        {...props}
        className={composeTwRenderProps(className, slots?.base())}
        onOpenChange={handleOpenChange}
      >
        {children}
      </DateRangePickerPrimitive>
    </DateRangePickerContext>
  );
};

DateRangePickerRoot.displayName = "SY INC.DateRangePicker";

/* -------------------------------------------------------------------------------------------------
 * DateRangePicker Trigger
 * -----------------------------------------------------------------------------------------------*/
interface DateRangePickerTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {}

const DateRangePickerTrigger = ({
  children,
  className,
  ref,
  ...props
}: DateRangePickerTriggerProps) => {
  const {slots, triggerRef} = use(DateRangePickerContext);

  const mergedRef = React.useMemo(() => mergeRefs(triggerRef, ref), [triggerRef, ref]);

  return (
    <ButtonPrimitive
      ref={mergedRef}
      className={composeTwRenderProps(className, slots?.trigger())}
      data-slot="date-range-picker-trigger"
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
};

DateRangePickerTrigger.displayName = "SY INC.DateRangePicker.Trigger";

/* -------------------------------------------------------------------------------------------------
 * DateRangePicker Trigger Indicator
 * -----------------------------------------------------------------------------------------------*/
interface DateRangePickerTriggerIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: React.ReactNode;
  className?: string;
}

const DateRangePickerTriggerIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: DateRangePickerTriggerIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DateRangePickerTriggerIndicatorProps<E>>) => {
  const {slots} = use(DateRangePickerContext);

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.triggerIndicator, className)}
      data-slot="date-range-picker-trigger-indicator"
      {...(props as any)}
    >
      {children || <IconCalendar />}
    </dom.span>
  );
};

DateRangePickerTriggerIndicator.displayName = "SY INC.DateRangePicker.TriggerIndicator";

/* -------------------------------------------------------------------------------------------------
 * DateRangePicker Range Separator
 * -----------------------------------------------------------------------------------------------*/
interface DateRangePickerRangeSeparatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const DateRangePickerRangeSeparator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children = " - ",
  className,
  ...props
}: DateRangePickerRangeSeparatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DateRangePickerRangeSeparatorProps<E>>) => {
  const {slots} = use(DateRangePickerContext);

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.rangeSeparator, className)}
      data-slot="date-range-picker-range-separator"
      {...(props as any)}
    >
      {children}
    </dom.span>
  );
};

DateRangePickerRangeSeparator.displayName = "SY INC.DateRangePicker.RangeSeparator";

/* -------------------------------------------------------------------------------------------------
 * DateRangePicker Popover
 * -----------------------------------------------------------------------------------------------*/
interface DateRangePickerPopoverProps extends Omit<
  ComponentPropsWithRef<typeof PopoverPrimitive>,
  "children"
> {
  children: React.ReactNode;
}

const DateRangePickerPopover = ({
  children,
  className,
  placement = "bottom",
  render,
  ...props
}: DateRangePickerPopoverProps) => {
  const {slots} = use(DateRangePickerContext);
  const hold = usePopoverExitHold(props);
  const popoverRender = usePickerPopoverRender(render, props.slot);

  return (
    <SurfaceContext
      value={{
        variant: "default" as SurfaceVariants["variant"],
      }}
    >
      <PopoverPrimitive
        {...props}
        {...hold}
        className={composeTwRenderProps(className, slots?.popover())}
        data-slot="date-range-picker-popover"
        placement={placement}
        render={popoverRender}
      >
        {children}
      </PopoverPrimitive>
    </SurfaceContext>
  );
};

DateRangePickerPopover.displayName = "SY INC.DateRangePicker.Popover";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  DateRangePickerRoot,
  DateRangePickerTrigger,
  DateRangePickerTriggerIndicator,
  DateRangePickerRangeSeparator,
  DateRangePickerPopover,
};

export type {
  DateRangePickerRootProps,
  DateRangePickerTriggerProps,
  DateRangePickerTriggerIndicatorProps,
  DateRangePickerRangeSeparatorProps,
  DateRangePickerPopoverProps,
};

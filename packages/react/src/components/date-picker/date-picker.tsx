"use client";

/* Portions adapted from HeroUI v3.2.7 (Apache-2.0): https://github.com/heroui-inc/heroui/pull/6959 */

import type {DOMRenderProps} from "../../utils/dom";
import type {SurfaceVariants} from "../surface";
import type {DatePickerVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";
import type {DateValue} from "react-aria-components/Calendar";

import {mergeRefs} from "@react-aria/utils";
import {datePickerVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {
  DatePicker as DatePickerPrimitive,
  Popover as PopoverPrimitive,
} from "react-aria-components/DatePicker";

import {usePickerPopoverRender} from "../../hooks/use-picker-popover-render";
import {usePickerTriggerFocus} from "../../hooks/use-picker-trigger-focus";
import {usePopoverExitHold} from "../../hooks/use-popover-exit-hold";
import {dataAttr} from "../../utils/assertion";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {IconCalendar} from "../icons";
import {SurfaceContext} from "../surface";

/* -------------------------------------------------------------------------------------------------
 * DatePicker Context
 * -----------------------------------------------------------------------------------------------*/
type DatePickerContext = {
  slots?: ReturnType<typeof datePickerVariants>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const DatePickerContext = createContext<DatePickerContext>({
  triggerRef: {current: null},
});

/* -------------------------------------------------------------------------------------------------
 * DatePicker Root
 * -----------------------------------------------------------------------------------------------*/
interface DatePickerRootProps<T extends DateValue>
  extends ComponentPropsWithRef<typeof DatePickerPrimitive<T>>, DatePickerVariants {}

const DatePickerRoot = <T extends DateValue>({
  children,
  className,
  onOpenChange,
  ...props
}: DatePickerRootProps<T>) => {
  const slots = React.useMemo(() => datePickerVariants(), []);
  const {handleOpenChange, triggerRef} = usePickerTriggerFocus(onOpenChange);

  const datePickerContextValue = React.useMemo(() => ({slots, triggerRef}), [slots, triggerRef]);

  return (
    <DatePickerContext value={datePickerContextValue}>
      <DatePickerPrimitive
        data-required={dataAttr(props.isRequired)}
        data-slot="date-picker"
        {...props}
        className={composeTwRenderProps(className, slots?.base())}
        onOpenChange={handleOpenChange}
      >
        {children}
      </DatePickerPrimitive>
    </DatePickerContext>
  );
};

DatePickerRoot.displayName = "SY INC.DatePicker";

/* -------------------------------------------------------------------------------------------------
 * DatePicker Trigger
 * -----------------------------------------------------------------------------------------------*/
interface DatePickerTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {}

const DatePickerTrigger = ({children, className, ref, ...props}: DatePickerTriggerProps) => {
  const {slots, triggerRef} = use(DatePickerContext);

  const mergedRef = React.useMemo(() => mergeRefs(triggerRef, ref), [triggerRef, ref]);

  return (
    <ButtonPrimitive
      ref={mergedRef}
      className={composeTwRenderProps(className, slots?.trigger())}
      data-slot="date-picker-trigger"
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
};

DatePickerTrigger.displayName = "SY INC.DatePicker.Trigger";

/* -------------------------------------------------------------------------------------------------
 * DatePicker Trigger Indicator
 * -----------------------------------------------------------------------------------------------*/
interface DatePickerTriggerIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: React.ReactNode;
  className?: string;
}

const DatePickerTriggerIndicator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: DatePickerTriggerIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DatePickerTriggerIndicatorProps<E>>) => {
  const {slots} = use(DatePickerContext);

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.triggerIndicator, className)}
      data-slot="date-picker-trigger-indicator"
      {...(props as any)}
    >
      {children || <IconCalendar />}
    </dom.span>
  );
};

DatePickerTriggerIndicator.displayName = "SY INC.DatePicker.TriggerIndicator";

/* -------------------------------------------------------------------------------------------------
 * DatePicker Popover
 * -----------------------------------------------------------------------------------------------*/
interface DatePickerPopoverProps extends Omit<
  ComponentPropsWithRef<typeof PopoverPrimitive>,
  "children"
> {
  children: React.ReactNode;
}

const DatePickerPopover = ({
  children,
  className,
  placement = "bottom",
  render,
  ...props
}: DatePickerPopoverProps) => {
  const {slots} = use(DatePickerContext);
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
        data-slot="date-picker-popover"
        placement={placement}
        render={popoverRender}
      >
        {children}
      </PopoverPrimitive>
    </SurfaceContext>
  );
};

DatePickerPopover.displayName = "SY INC.DatePicker.Popover";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {DatePickerRoot, DatePickerTrigger, DatePickerTriggerIndicator, DatePickerPopover};

export type {
  DatePickerRootProps,
  DatePickerTriggerProps,
  DatePickerTriggerIndicatorProps,
  DatePickerPopoverProps,
};

"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {SurfaceVariants} from "../surface";
import type {SelectVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {selectVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {Popover as PopoverPrimitive} from "react-aria-components/Popover";
import {
  Select as SelectPrimitive,
  SelectStateContext,
  SelectValue as SelectValuePrimitive,
} from "react-aria-components/Select";

import {dataAttr} from "../../utils/assertion";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {FieldSlotsGate} from "../../utils/field-slots-gate";
import {IconChevronDown} from "../icons";
import {SurfaceContext} from "../surface";

/* -------------------------------------------------------------------------------------------------
 * Select Context
 * -----------------------------------------------------------------------------------------------*/
type SelectContext = {
  slots?: ReturnType<typeof selectVariants>;
};

const SelectContext = createContext<SelectContext>({});

/* -------------------------------------------------------------------------------------------------
 * Select Root
 * -----------------------------------------------------------------------------------------------*/
interface SelectRootProps<T extends object, M extends "single" | "multiple" = "single">
  extends ComponentPropsWithRef<typeof SelectPrimitive<T, M>>, SelectVariants {
  items?: Iterable<T, M>;
}

const SelectRoot = <T extends object = object, M extends "single" | "multiple" = "single">({
  children,
  className,
  fullWidth,
  variant,
  ...props
}: SelectRootProps<T, M>) => {
  const slots = React.useMemo(() => selectVariants({fullWidth, variant}), [fullWidth, variant]);

  return (
    <FieldSlotsGate>
      <SelectContext value={{slots}}>
        <SelectPrimitive
          data-slot="select"
          {...props}
          className={composeTwRenderProps(className, slots?.base())}
        >
          {(values) => <>{typeof children === "function" ? children(values) : children}</>}
        </SelectPrimitive>
      </SelectContext>
    </FieldSlotsGate>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Select Trigger
 * -----------------------------------------------------------------------------------------------*/
interface SelectTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {}

const SelectTrigger = ({children, className, ...props}: SelectTriggerProps) => {
  const {slots} = use(SelectContext);

  return (
    <ButtonPrimitive
      className={composeTwRenderProps(className, slots?.trigger())}
      data-slot="select-trigger"
      {...props}
    >
      {(values) => <>{typeof children === "function" ? children(values) : children}</>}
    </ButtonPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Select Value
 * -----------------------------------------------------------------------------------------------*/
interface SelectValueProps extends ComponentPropsWithRef<typeof SelectValuePrimitive> {}

const SelectValue = ({children, className, ...props}: SelectValueProps) => {
  const {slots} = use(SelectContext);

  return (
    <SelectValuePrimitive
      className={composeTwRenderProps(className, slots?.value())}
      data-slot="select-value"
      {...props}
    >
      {children}
    </SelectValuePrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Select Indicator
 * -----------------------------------------------------------------------------------------------*/
interface SelectIndicatorProps<
  E extends keyof React.JSX.IntrinsicElements = "svg",
> extends DOMRenderProps<E, undefined> {
  children?: React.ReactNode;
  className?: string;
}

const SelectIndicator = <E extends keyof React.JSX.IntrinsicElements = "svg">({
  children,
  className,
  ...props
}: SelectIndicatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof SelectIndicatorProps<E>>) => {
  const {slots} = use(SelectContext);
  const state = use(SelectStateContext);
  const hasCustomIcon = React.isValidElement(children);

  /* data-slot first so wrappers (for example CellSelect) can rename it; the slot class stays ours. */
  const indicatorProps = {
    "data-slot": hasCustomIcon ? "select-indicator" : "select-default-indicator",
    ...(props as object),
    className: composeSlotClassName(slots?.indicator, className),
    "data-open": dataAttr(state?.isOpen),
  };

  if (hasCustomIcon) return React.cloneElement(children, indicatorProps);

  return <IconChevronDown {...indicatorProps} />;
};

/* -------------------------------------------------------------------------------------------------
 * Select Popover
 * -----------------------------------------------------------------------------------------------*/
interface SelectPopoverProps extends Omit<
  ComponentPropsWithRef<typeof PopoverPrimitive>,
  "children"
> {
  children: React.ReactNode;
}

const SelectPopover = ({
  children,
  className,
  placement = "bottom",
  ...props
}: SelectPopoverProps) => {
  const {slots} = use(SelectContext);

  return (
    <SurfaceContext
      value={{
        variant: "default" as SurfaceVariants["variant"],
      }}
    >
      <PopoverPrimitive
        {...props}
        className={composeTwRenderProps(className, slots?.popover())}
        data-slot="select-popover"
        placement={placement}
      >
        {children}
      </PopoverPrimitive>
    </SurfaceContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {SelectRoot, SelectTrigger, SelectValue, SelectIndicator, SelectPopover};

export type {
  SelectRootProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectIndicatorProps,
  SelectPopoverProps,
};

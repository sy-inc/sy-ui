"use client";

import type {
  SelectIndicatorProps,
  SelectPopoverProps,
  SelectRootProps,
  SelectTriggerProps,
  SelectValueProps,
} from "../select";
import type {CellSelectVariants} from "@sy-inc/styles";
import type {ComponentProps} from "react";

import {cellSelectVariants} from "@sy-inc/styles";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {IconChevronsExpandVertical} from "../icons";
import {Select} from "../select";

/* No variant changes a slot class, so the slots are constant - nothing to memoize or share via context. */
const slots = cellSelectVariants();

/* -------------------------------------------------------------------------------------------------
 * CellSelect Root
 * -----------------------------------------------------------------------------------------------*/
export interface CellSelectRootProps<T extends object, M extends "single" | "multiple" = "single">
  extends Omit<SelectRootProps<T, M>, "variant">, CellSelectVariants {}

const CellSelectRoot = <T extends object = object, M extends "single" | "multiple" = "single">({
  children,
  className,
  variant,
  ...props
}: CellSelectRootProps<T, M>) => (
  <Select.Root
    {...props}
    className={composeTwRenderProps(className, slots.base())}
    data-slot="cell-select"
    variant={variant === "secondary" ? "secondary" : "primary"}
  >
    {children}
  </Select.Root>
);

/* -------------------------------------------------------------------------------------------------
 * CellSelect Trigger
 * -----------------------------------------------------------------------------------------------*/
export interface CellSelectTriggerProps extends SelectTriggerProps {}

const CellSelectTrigger = ({className, ...props}: CellSelectTriggerProps) => (
  <Select.Trigger
    {...props}
    className={composeTwRenderProps(className, slots.trigger())}
    data-slot="cell-select-trigger"
  />
);

/* -------------------------------------------------------------------------------------------------
 * CellSelect Label
 * -----------------------------------------------------------------------------------------------*/
export interface CellSelectLabelProps extends ComponentProps<"span"> {}

const CellSelectLabel = ({className, ...props}: CellSelectLabelProps) => (
  <span
    {...props}
    className={composeSlotClassName(slots.label, className)}
    data-slot="cell-select-label"
  />
);

/* -------------------------------------------------------------------------------------------------
 * CellSelect Value
 * -----------------------------------------------------------------------------------------------*/
export interface CellSelectValueProps extends SelectValueProps {}

const CellSelectValue = ({className, ...props}: CellSelectValueProps) => (
  <Select.Value
    {...props}
    className={composeTwRenderProps(className, slots.value())}
    data-slot="cell-select-value"
  />
);

/* -------------------------------------------------------------------------------------------------
 * CellSelect Indicator
 * -----------------------------------------------------------------------------------------------*/
export interface CellSelectIndicatorProps extends SelectIndicatorProps {}

const CellSelectIndicator = ({children, className, ...props}: CellSelectIndicatorProps) => (
  <Select.Indicator
    {...props}
    className={composeSlotClassName(slots.indicator, className)}
    data-slot="cell-select-indicator"
  >
    {children ?? <IconChevronsExpandVertical />}
  </Select.Indicator>
);

/* -------------------------------------------------------------------------------------------------
 * CellSelect Popover
 * -----------------------------------------------------------------------------------------------*/
export interface CellSelectPopoverProps extends SelectPopoverProps {}

/* The popover is portalled and already sized to the trigger by select__popover - nothing to add. */
const CellSelectPopover = Select.Popover;

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  CellSelectIndicator,
  CellSelectLabel,
  CellSelectPopover,
  CellSelectRoot,
  CellSelectTrigger,
  CellSelectValue,
};

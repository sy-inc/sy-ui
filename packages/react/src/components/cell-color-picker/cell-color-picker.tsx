"use client";

import type {CellColorPickerVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {cellColorPickerVariants} from "@sy-inc/styles";
import {use} from "react";
import {ButtonContext} from "react-aria-components";
import {ColorPickerStateContext} from "react-aria-components/ColorPicker";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {ColorPicker} from "../color-picker";
import {ColorSwatch} from "../color-swatch";

/* Only the root variant changes a slot class, and it is applied at the call site. */
const slots = cellColorPickerVariants();

/* -------------------------------------------------------------------------------------------------
 * CellColorPicker Root
 * -----------------------------------------------------------------------------------------------*/
interface CellColorPickerRootProps
  extends Omit<ComponentPropsWithRef<typeof ColorPicker>, "children">, CellColorPickerVariants {
  children: ReactNode;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

/**
 * `isDisabled` and `isInvalid` are owned by the root: invalid is a data attribute
 * the CSS reads, and disabled rides React Aria's own `ButtonContext` so the
 * trigger (and anything else button-shaped in the row) picks it up without a
 * context of our own.
 */
const CellColorPickerRoot = ({
  children,
  className,
  isDisabled,
  isInvalid,
  variant,
  ...props
}: CellColorPickerRootProps) => (
  <ButtonContext value={{isDisabled}}>
    <ColorPicker
      {...props}
      className={composeSlotClassName(slots.base, className, {variant})}
      data-disabled={isDisabled ? "true" : undefined}
      data-invalid={isInvalid ? "true" : undefined}
      data-slot="cell-color-picker"
    >
      {children}
    </ColorPicker>
  </ButtonContext>
);

CellColorPickerRoot.displayName = "SY INC.CellColorPicker";

/* -------------------------------------------------------------------------------------------------
 * CellColorPicker Trigger
 * -----------------------------------------------------------------------------------------------*/
interface CellColorPickerTriggerProps extends ComponentPropsWithRef<typeof ColorPicker.Trigger> {}

const CellColorPickerTrigger = ({className, ...props}: CellColorPickerTriggerProps) => (
  <ColorPicker.Trigger
    {...props}
    className={composeTwRenderProps(className, slots.trigger())}
    data-slot="cell-color-picker-trigger"
  />
);

CellColorPickerTrigger.displayName = "SY INC.CellColorPicker.Trigger";

/* -------------------------------------------------------------------------------------------------
 * CellColorPicker Label
 * -----------------------------------------------------------------------------------------------*/
interface CellColorPickerLabelProps extends ComponentPropsWithRef<"span"> {}

/* A plain span, not `Label`: it lives inside the trigger button, which is already labelled. */
const CellColorPickerLabel = ({className, ...props}: CellColorPickerLabelProps) => (
  <span
    {...props}
    className={composeSlotClassName(slots.label, className)}
    data-slot="cell-color-picker-label"
  />
);

CellColorPickerLabel.displayName = "SY INC.CellColorPicker.Label";

/* -------------------------------------------------------------------------------------------------
 * CellColorPicker ValueDisplay
 * -----------------------------------------------------------------------------------------------*/
interface CellColorPickerValueDisplayProps extends ComponentPropsWithRef<"span"> {}

const CellColorPickerValueDisplay = ({
  children,
  className,
  ...props
}: CellColorPickerValueDisplayProps) => {
  const state = use(ColorPickerStateContext);

  return (
    <span
      {...props}
      className={composeSlotClassName(slots.valueDisplay, className)}
      data-slot="cell-color-picker-value-display"
    >
      {children ?? state?.color.toString("hex")}
    </span>
  );
};

CellColorPickerValueDisplay.displayName = "SY INC.CellColorPicker.ValueDisplay";

/* -------------------------------------------------------------------------------------------------
 * CellColorPicker Swatch
 * -----------------------------------------------------------------------------------------------*/
interface CellColorPickerSwatchProps extends ComponentPropsWithRef<typeof ColorSwatch> {}

/* 20px sits between the shared xs/sm steps, so the size delta stays local to this row. */
const CellColorPickerSwatch = ({className, ...props}: CellColorPickerSwatchProps) => (
  <ColorSwatch {...props} className={composeTwRenderProps(className, slots.swatch())} />
);

CellColorPickerSwatch.displayName = "SY INC.CellColorPicker.Swatch";

/* -------------------------------------------------------------------------------------------------
 * CellColorPicker Popover
 * -----------------------------------------------------------------------------------------------*/
interface CellColorPickerPopoverProps extends ComponentPropsWithRef<typeof ColorPicker.Popover> {}

const CellColorPickerPopover = ({
  className,
  placement = "bottom end",
  ...props
}: CellColorPickerPopoverProps) => (
  <ColorPicker.Popover
    {...props}
    className={composeTwRenderProps(className, slots.popover())}
    placement={placement}
  />
);

CellColorPickerPopover.displayName = "SY INC.CellColorPicker.Popover";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  CellColorPickerLabel,
  CellColorPickerPopover,
  CellColorPickerRoot,
  CellColorPickerSwatch,
  CellColorPickerTrigger,
  CellColorPickerValueDisplay,
};

export type {
  CellColorPickerLabelProps,
  CellColorPickerPopoverProps,
  CellColorPickerRootProps,
  CellColorPickerRootProps as CellColorPickerProps,
  CellColorPickerSwatchProps,
  CellColorPickerTriggerProps,
  CellColorPickerValueDisplayProps,
};

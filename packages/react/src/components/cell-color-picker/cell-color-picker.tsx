"use client";

import type {CellColorPickerVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {cellColorPickerVariants} from "@sy-inc/styles";
import {createContext, use} from "react";
import {ColorPickerStateContext} from "react-aria-components/ColorPicker";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {ColorPicker} from "../color-picker";
import {ColorSwatch} from "../color-swatch";

/* Only the root variant changes a slot class, and it is applied at the call site. */
const slots = cellColorPickerVariants();

/* The trigger is the only part that needs state from the root; invalid is styled from the root. */
const CellColorPickerContext = createContext<{isDisabled?: boolean}>({});

/* -------------------------------------------------------------------------------------------------
 * CellColorPicker Root
 * -----------------------------------------------------------------------------------------------*/
interface CellColorPickerRootProps
  extends Omit<ComponentPropsWithRef<typeof ColorPicker>, "children">, CellColorPickerVariants {
  children: ReactNode;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

const CellColorPickerRoot = ({
  children,
  className,
  isDisabled,
  isInvalid,
  variant,
  ...props
}: CellColorPickerRootProps) => (
  <CellColorPickerContext value={{isDisabled}}>
    <ColorPicker
      {...props}
      className={composeSlotClassName(slots.base, className, {variant})}
      data-invalid={isInvalid ? "true" : undefined}
      data-slot="cell-color-picker"
    >
      {children}
    </ColorPicker>
  </CellColorPickerContext>
);

CellColorPickerRoot.displayName = "SY INC.CellColorPicker";

/* -------------------------------------------------------------------------------------------------
 * CellColorPicker Trigger
 * -----------------------------------------------------------------------------------------------*/
interface CellColorPickerTriggerProps extends ComponentPropsWithRef<typeof ColorPicker.Trigger> {}

const CellColorPickerTrigger = ({className, isDisabled, ...props}: CellColorPickerTriggerProps) => {
  const {isDisabled: rootDisabled} = use(CellColorPickerContext);

  return (
    <ColorPicker.Trigger
      {...props}
      className={composeTwRenderProps(className, slots.trigger())}
      data-slot="cell-color-picker-trigger"
      isDisabled={isDisabled ?? rootDisabled}
    />
  );
};

CellColorPickerTrigger.displayName = "SY INC.CellColorPicker.Trigger";

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
  CellColorPickerPopover,
  CellColorPickerRoot,
  CellColorPickerSwatch,
  CellColorPickerTrigger,
  CellColorPickerValueDisplay,
};

export type {
  CellColorPickerPopoverProps,
  CellColorPickerRootProps,
  CellColorPickerRootProps as CellColorPickerProps,
  CellColorPickerSwatchProps,
  CellColorPickerTriggerProps,
  CellColorPickerValueDisplayProps,
};

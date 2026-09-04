import type {ComponentProps} from "react";

import {
  CellColorPickerPopover,
  CellColorPickerRoot,
  CellColorPickerSwatch,
  CellColorPickerTrigger,
  CellColorPickerValueDisplay,
} from "./cell-color-picker";

export const CellColorPicker = Object.assign(CellColorPickerRoot, {
  Popover: CellColorPickerPopover,
  Root: CellColorPickerRoot,
  Swatch: CellColorPickerSwatch,
  Trigger: CellColorPickerTrigger,
  ValueDisplay: CellColorPickerValueDisplay,
});

export type CellColorPicker = {
  PopoverProps: ComponentProps<typeof CellColorPickerPopover>;
  Props: ComponentProps<typeof CellColorPickerRoot>;
  RootProps: ComponentProps<typeof CellColorPickerRoot>;
  SwatchProps: ComponentProps<typeof CellColorPickerSwatch>;
  TriggerProps: ComponentProps<typeof CellColorPickerTrigger>;
  ValueDisplayProps: ComponentProps<typeof CellColorPickerValueDisplay>;
};

export {
  CellColorPickerPopover,
  CellColorPickerRoot,
  CellColorPickerSwatch,
  CellColorPickerTrigger,
  CellColorPickerValueDisplay,
};

export type {
  CellColorPickerPopoverProps,
  CellColorPickerProps,
  CellColorPickerRootProps,
  CellColorPickerSwatchProps,
  CellColorPickerTriggerProps,
  CellColorPickerValueDisplayProps,
} from "./cell-color-picker";

export {cellColorPickerVariants} from "@sy-inc/styles";
export type {CellColorPickerVariants} from "@sy-inc/styles";

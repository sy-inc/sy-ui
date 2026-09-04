import type {ComponentProps} from "react";

import {
  CellColorPickerLabel,
  CellColorPickerPopover,
  CellColorPickerRoot,
  CellColorPickerSwatch,
  CellColorPickerTrigger,
  CellColorPickerValueDisplay,
} from "./cell-color-picker";

export const CellColorPicker = Object.assign(CellColorPickerRoot, {
  Label: CellColorPickerLabel,
  Popover: CellColorPickerPopover,
  Root: CellColorPickerRoot,
  Swatch: CellColorPickerSwatch,
  Trigger: CellColorPickerTrigger,
  ValueDisplay: CellColorPickerValueDisplay,
});

export type CellColorPicker = {
  LabelProps: ComponentProps<typeof CellColorPickerLabel>;
  PopoverProps: ComponentProps<typeof CellColorPickerPopover>;
  Props: ComponentProps<typeof CellColorPickerRoot>;
  RootProps: ComponentProps<typeof CellColorPickerRoot>;
  SwatchProps: ComponentProps<typeof CellColorPickerSwatch>;
  TriggerProps: ComponentProps<typeof CellColorPickerTrigger>;
  ValueDisplayProps: ComponentProps<typeof CellColorPickerValueDisplay>;
};

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
  CellColorPickerProps,
  CellColorPickerRootProps,
  CellColorPickerSwatchProps,
  CellColorPickerTriggerProps,
  CellColorPickerValueDisplayProps,
} from "./cell-color-picker";

export {cellColorPickerVariants} from "@sy-inc/styles";
export type {CellColorPickerVariants} from "@sy-inc/styles";

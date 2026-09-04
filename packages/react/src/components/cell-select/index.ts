import type {ComponentProps} from "react";

import {
  CellSelectIndicator,
  CellSelectLabel,
  CellSelectPopover,
  CellSelectRoot,
  CellSelectTrigger,
  CellSelectValue,
} from "./cell-select";

export const CellSelect = Object.assign(CellSelectRoot, {
  Root: CellSelectRoot,
  Trigger: CellSelectTrigger,
  Label: CellSelectLabel,
  Value: CellSelectValue,
  Indicator: CellSelectIndicator,
  Popover: CellSelectPopover,
});

export type CellSelect<T extends object = object> = {
  Props: ComponentProps<typeof CellSelectRoot<T>>;
  RootProps: ComponentProps<typeof CellSelectRoot<T>>;
  TriggerProps: ComponentProps<typeof CellSelectTrigger>;
  LabelProps: ComponentProps<typeof CellSelectLabel>;
  ValueProps: ComponentProps<typeof CellSelectValue>;
  IndicatorProps: ComponentProps<typeof CellSelectIndicator>;
  PopoverProps: ComponentProps<typeof CellSelectPopover>;
};

export {
  CellSelectIndicator,
  CellSelectLabel,
  CellSelectPopover,
  CellSelectRoot,
  CellSelectTrigger,
  CellSelectValue,
};

export type {
  CellSelectIndicatorProps,
  CellSelectLabelProps,
  CellSelectPopoverProps,
  CellSelectRootProps,
  CellSelectRootProps as CellSelectProps,
  CellSelectTriggerProps,
  CellSelectValueProps,
} from "./cell-select";

export {cellSelectVariants} from "@sy-inc/styles";
export type {CellSelectVariants} from "@sy-inc/styles";

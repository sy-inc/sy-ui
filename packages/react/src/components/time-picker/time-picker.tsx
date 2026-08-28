"use client";

import React from "react";

import {TimePickerVariants, type TimePickerVariantProps} from "./time-picker.styles";

export interface TimePickerProps extends TimePickerVariantProps {
  children?: React.ReactNode;
  className?: string;
}

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  ({children, className, ...props}, ref) => {
    return (
      <div ref={ref} className={TimePickerVariants({className, ...props})}>
        {children}
      </div>
    );
  }
);

TimePicker.displayName = "SY UI.TimePicker";

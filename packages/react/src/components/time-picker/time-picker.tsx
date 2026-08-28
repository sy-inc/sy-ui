"use client";

import type {EmblaCarouselType} from "embla-carousel";
import type {ComponentPropsWithRef} from "react";

import {Time} from "@internationalized/date";
import React from "react";

import {Carousel} from "../carousel";

import {timePickerVariants} from "./time-picker.styles";

const TIME_UNITS = ["hour", "minute", "second"] as const;

export type TimePickerGranularity = (typeof TIME_UNITS)[number];

interface TimeColumnProps {
  isDisabled: boolean;
  onChange: (value: number) => void;
  unit: TimePickerGranularity;
  value: number;
}

const TimeColumn = ({isDisabled, onChange, unit, value}: TimeColumnProps) => {
  const values = Array.from({length: unit === "hour" ? 24 : 60}, (_, index) => index);
  const initialized = React.useRef(false);
  const apiRef = React.useRef<EmblaCarouselType>(undefined);
  const [options] = React.useState(() => ({
    align: "center" as const,
    containScroll: false as const,
    dragFree: "snap" as const,
    loop: true,
    startSnap: value,
  }));

  React.useEffect(() => {
    apiRef.current?.goTo(value);
  }, [value]);

  const handleApiChange = React.useCallback((api: EmblaCarouselType) => {
    apiRef.current = api;
  }, []);

  return (
    <Carousel.Root
      clickable
      aria-label={unit}
      className={timePickerVariants().unit()}
      gap={0}
      itemsPerView={5}
      options={options}
      orientation="vertical"
      slidesToScroll={1}
      onApiChange={handleApiChange}
      onSelectionChange={(_, selectedValue) => {
        if (!initialized.current) {
          initialized.current = true;

          return;
        }

        const nextValue = Number(selectedValue);

        if (nextValue !== value) onChange(nextValue);
      }}
    >
      <Carousel.Content>
        {values.map((item) => (
          <Carousel.Item
            key={item}
            className={timePickerVariants().item()}
            isDisabled={isDisabled}
            value={String(item)}
          >
            {String(item).padStart(2, "0")}
          </Carousel.Item>
        ))}
      </Carousel.Content>
    </Carousel.Root>
  );
};

export interface TimePickerProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children" | "defaultValue" | "onChange"
> {
  value?: Time;
  defaultValue?: Time;
  onChange?: (value: Time) => void;
  granularity?: TimePickerGranularity;
  isDisabled?: boolean;
}

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      className,
      defaultValue = new Time(),
      granularity = "minute",
      isDisabled = false,
      onChange,
      value,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const currentValue = value ?? uncontrolledValue;
    const units = TIME_UNITS.slice(0, TIME_UNITS.indexOf(granularity) + 1);

    const update = (unit: TimePickerGranularity, next: number) => {
      if (isDisabled) return;

      const nextValue = new Time(
        unit === "hour" ? next : currentValue.hour,
        unit === "minute" ? next : currentValue.minute,
        unit === "second" ? next : currentValue.second,
        currentValue.millisecond,
      );

      if (value === undefined) setUncontrolledValue(nextValue);
      onChange?.(nextValue);
    };

    return (
      <div
        ref={ref}
        aria-disabled={isDisabled || undefined}
        className={timePickerVariants().base({className})}
        data-disabled={isDisabled || undefined}
        data-slot="time-picker"
        {...props}
      >
        {units.map((unit) => (
          <TimeColumn
            key={unit}
            isDisabled={isDisabled}
            unit={unit}
            value={currentValue[unit]}
            onChange={(next) => update(unit, next)}
          />
        ))}
      </div>
    );
  },
);

TimePicker.displayName = "SY INC.TimePicker";

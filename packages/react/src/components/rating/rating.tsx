"use client";

import type {RatingVariants} from "@sy-inc/styles";
import type {CSSProperties, ComponentPropsWithRef, ReactNode} from "react";

import {Icon} from "@iconify/react";
import {ratingVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {
  RadioGroup as RadioGroupPrimitive,
  RadioGroupStateContext,
  Radio as RadioPrimitive,
} from "react-aria-components/RadioGroup";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";

const defaultItemLabel = (value: number) => `${value} ${value === 1 ? "star" : "stars"}`;

interface RatingContextValue {
  getItemLabel: (value: number) => string;
  icon?: ReactNode;
  slots?: ReturnType<typeof ratingVariants>;
}

const RatingContext = createContext<RatingContextValue>({getItemLabel: defaultItemLabel});

interface RatingRootProps
  extends
    Omit<
      ComponentPropsWithRef<typeof RadioGroupPrimitive>,
      "children" | "defaultValue" | "onChange" | "orientation" | "value"
    >,
    RatingVariants {
  children?: ReactNode;
  /** Initial rating when uncontrolled. */
  defaultValue?: number;
  /** Accessible label for each item. Defaults to `"3 stars"`. */
  getItemLabel?: (value: number) => string;
  icon?: ReactNode;
  onValueChange?: (value: number) => void;
  /** The rating. Pass `null` for a controlled group with nothing selected. */
  value?: number | null;
}

const RatingRoot = ({
  children,
  className,
  defaultValue,
  getItemLabel = defaultItemLabel,
  icon,
  onValueChange,
  size,
  value,
  ...props
}: RatingRootProps) => {
  const slots = React.useMemo(() => ratingVariants({size}), [size]);

  return (
    <RadioGroupPrimitive
      data-slot="rating"
      {...props}
      className={composeTwRenderProps(className, slots.base())}
      defaultValue={defaultValue == null ? undefined : String(defaultValue)}
      orientation="horizontal"
      value={value === undefined ? undefined : value === null ? null : String(value)}
      onChange={(nextValue) => {
        const nextRating = Number(nextValue);

        if (Number.isFinite(nextRating)) onValueChange?.(nextRating);
      }}
    >
      <RatingContext value={{getItemLabel, icon, slots}}>{children}</RatingContext>
    </RadioGroupPrimitive>
  );
};

RatingRoot.displayName = "SY INC.Rating";

interface RatingItemProps extends Omit<
  ComponentPropsWithRef<typeof RadioPrimitive>,
  "children" | "value"
> {
  /** Icon for this item. Defaults to the group's `icon`, then a filled star. */
  children?: ReactNode;
  value: number;
}

const RatingItem = ({children, className, value, ...props}: RatingItemProps) => {
  const {getItemLabel, icon, slots} = use(RatingContext);
  const state = use(RadioGroupStateContext);
  const rating = state?.selectedValue == null ? undefined : Number(state.selectedValue);
  const isActive = (rating ?? 0) >= value;
  const partialPercent = Math.round(
    Math.max(0, Math.min(100, ((rating ?? 0) - (value - 1)) * 100)),
  );
  // A fractional item stacks a clipped copy of the same icon on top, so the two
  // layers must be the same glyph in two colors. That is why children is a plain
  // node: a state-dependent glyph would render clipped in its unfilled form.
  const isPartial = partialPercent > 0 && partialPercent < 100;
  const content = children ?? icon ?? <Icon icon="gravity-ui:star-fill" />;

  return (
    <RadioPrimitive
      aria-label={getItemLabel(value)}
      data-active={isActive || undefined}
      data-slot="rating-item"
      {...props}
      className={composeTwRenderProps(className, slots?.item())}
      value={String(value)}
    >
      <span
        aria-hidden="true"
        className={composeSlotClassName(slots?.icon)}
        data-slot="rating-icon"
      >
        {content}
        {!!isPartial && (
          <span
            className={composeSlotClassName(slots?.partial)}
            data-slot="rating-icon-partial"
            style={{"--rating-partial": `${partialPercent}%`} as CSSProperties}
          >
            {content}
          </span>
        )}
      </span>
    </RadioPrimitive>
  );
};

RatingItem.displayName = "SY INC.Rating.Item";

export {RatingRoot, RatingItem};

export type {RatingRootProps, RatingItemProps};

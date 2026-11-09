"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {DateInputGroupVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {
  DateInputProps as DateInputPrimitiveProps,
  DateSegmentProps as DateSegmentPrimitiveProps,
} from "react-aria-components/DateField";

import {dateInputGroupVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {
  DateInput as DateInputPrimitive,
  DateSegment as DateSegmentPrimitive,
} from "react-aria-components/DateField";
import {Group as GroupPrimitive} from "react-aria-components/Group";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Context
 * -----------------------------------------------------------------------------------------------*/
type DateInputGroupContext = {
  slots?: ReturnType<typeof dateInputGroupVariants>;
};

const DateInputGroupContext = createContext<DateInputGroupContext>({});

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Root
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupRootProps
  extends ComponentPropsWithRef<typeof GroupPrimitive>, DateInputGroupVariants {}

const DateInputGroupRoot = ({
  children,
  className,
  fullWidth,
  variant,
  ...props
}: DateInputGroupRootProps) => {
  const slots = React.useMemo(
    () => dateInputGroupVariants({fullWidth, variant}),
    [fullWidth, variant],
  );

  const dateInputGroupContextValue = React.useMemo(() => ({slots}), [slots]);

  return (
    <DateInputGroupContext value={dateInputGroupContextValue}>
      <GroupPrimitive
        className={composeTwRenderProps(className, slots?.base())}
        data-slot="date-input-group"
        {...props}
      >
        {children}
      </GroupPrimitive>
    </DateInputGroupContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Prefix
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupPrefixProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const DateInputGroupPrefix = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: DateInputGroupPrefixProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DateInputGroupPrefixProps<E>>) => {
  const {slots} = use(DateInputGroupContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.prefix, className)}
      data-slot="date-input-group-prefix"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Input
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupInputProps extends DateInputPrimitiveProps {}

const DateInputGroupInput = ({className, ...props}: DateInputGroupInputProps) => {
  const {slots} = use(DateInputGroupContext);

  // RAC's DateInput reads DateField or TimeField state from context, so one primitive serves both.
  return (
    <DateInputPrimitive
      className={composeTwRenderProps(className, slots?.input())}
      data-slot="date-input-group-input"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Segment
 * -----------------------------------------------------------------------------------------------*/

interface DateInputGroupSegmentProps extends DateSegmentPrimitiveProps {
  className?: string;
}

const DateInputGroupSegment = ({className, segment, ...props}: DateInputGroupSegmentProps) => {
  const {slots} = use(DateInputGroupContext);

  return (
    <DateSegmentPrimitive
      className={composeSlotClassName(slots?.segment, className)}
      data-slot="date-input-group-segment"
      segment={segment}
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup InputContainer
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupInputContainerProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const DateInputGroupInputContainer = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: DateInputGroupInputContainerProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DateInputGroupInputContainerProps<E>>) => {
  const {slots} = use(DateInputGroupContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.inputContainer, className)}
      data-slot="date-input-group-input-container"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * DateInputGroup Suffix
 * -----------------------------------------------------------------------------------------------*/
interface DateInputGroupSuffixProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const DateInputGroupSuffix = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: DateInputGroupSuffixProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof DateInputGroupSuffixProps<E>>) => {
  const {slots} = use(DateInputGroupContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.suffix, className)}
      data-slot="date-input-group-suffix"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

DateInputGroupRoot.displayName = "SY INC.DateInputGroup";
DateInputGroupPrefix.displayName = "SY INC.DateInputGroup.Prefix";
DateInputGroupInput.displayName = "SY INC.DateInputGroup.Input";
DateInputGroupSegment.displayName = "SY INC.DateInputGroup.Segment";
DateInputGroupInputContainer.displayName = "SY INC.DateInputGroup.InputContainer";
DateInputGroupSuffix.displayName = "SY INC.DateInputGroup.Suffix";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  DateInputGroupRoot,
  DateInputGroupInput,
  DateInputGroupInputContainer,
  DateInputGroupSegment,
  DateInputGroupPrefix,
  DateInputGroupSuffix,
};

export type {
  DateInputGroupRootProps,
  DateInputGroupInputProps,
  DateInputGroupInputContainerProps,
  DateInputGroupSegmentProps,
  DateInputGroupPrefixProps,
  DateInputGroupSuffixProps,
};

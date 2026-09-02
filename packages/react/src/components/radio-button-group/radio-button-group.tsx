"use client";

import type {RadioFieldRenderProps} from "../radio";
import type {RadioButtonGroupVariants} from "@sy-inc/styles";
import type {ComponentProps, ComponentPropsWithRef, ReactNode} from "react";

import {radioButtonGroupVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {Radio} from "../radio";
import {RadioGroup} from "../radio-group";

type RadioButtonGroupContextValue = {slots?: ReturnType<typeof radioButtonGroupVariants>};

const RadioButtonGroupContext = createContext<RadioButtonGroupContextValue>({});

interface RadioButtonGroupRootProps
  extends ComponentPropsWithRef<typeof RadioGroup>, RadioButtonGroupVariants {}

const RadioButtonGroupRoot = ({
  children,
  className,
  layout,
  variant = "secondary",
  ...props
}: RadioButtonGroupRootProps) => {
  const slots = React.useMemo(() => radioButtonGroupVariants({layout}), [layout]);

  return (
    <RadioButtonGroupContext value={{slots}}>
      <RadioGroup
        {...props}
        className={composeTwRenderProps(className, slots.base())}
        data-slot="radio-button-group"
        variant={variant}
      >
        {children}
      </RadioGroup>
    </RadioButtonGroupContext>
  );
};

interface RadioButtonGroupItemProps extends ComponentPropsWithRef<typeof Radio> {}

const RadioButtonGroupItem = ({children, className, ...props}: RadioButtonGroupItemProps) => {
  const {slots} = use(RadioButtonGroupContext);

  return (
    <Radio {...props} data-slot="radio-button-group-item">
      {(state) => (
        <Radio.Content className={composeTwRenderProps(className, slots?.item())}>
          {typeof children === "function" ? children(state) : children}
        </Radio.Content>
      )}
    </Radio>
  );
};

interface RadioButtonGroupIndicatorProps extends Omit<ComponentProps<typeof dom.span>, "children"> {
  children?: ReactNode | ((state: RadioFieldRenderProps) => ReactNode);
}

const RadioButtonGroupIndicator = ({
  children,
  className,
  ...props
}: RadioButtonGroupIndicatorProps) => {
  const {slots} = use(RadioButtonGroupContext);

  return (
    <Radio.Control
      {...props}
      className={composeSlotClassName(slots?.indicator, className)}
      data-slot="radio-button-group-indicator"
    >
      <Radio.Indicator>
        {children === undefined
          ? undefined
          : (state: RadioFieldRenderProps) =>
              state.isSelected
                ? typeof children === "function"
                  ? children(state)
                  : children
                : null}
      </Radio.Indicator>
    </Radio.Control>
  );
};

interface RadioButtonGroupItemContentProps extends ComponentProps<typeof dom.span> {}

const RadioButtonGroupItemContent = ({className, ...props}: RadioButtonGroupItemContentProps) => {
  const {slots} = use(RadioButtonGroupContext);

  return (
    <dom.span
      {...props}
      className={composeSlotClassName(slots?.itemContent, className)}
      data-slot="radio-button-group-item-content"
    />
  );
};

interface RadioButtonGroupItemIconProps extends ComponentProps<typeof dom.span> {}

const RadioButtonGroupItemIcon = ({className, ...props}: RadioButtonGroupItemIconProps) => {
  const {slots} = use(RadioButtonGroupContext);

  return (
    <dom.span
      {...props}
      className={composeSlotClassName(slots?.itemIcon, className)}
      data-slot="radio-button-group-item-icon"
    />
  );
};

RadioButtonGroupRoot.displayName = "SY INC.RadioButtonGroup";
RadioButtonGroupItem.displayName = "SY INC.RadioButtonGroup.Item";
RadioButtonGroupIndicator.displayName = "SY INC.RadioButtonGroup.Indicator";
RadioButtonGroupItemContent.displayName = "SY INC.RadioButtonGroup.ItemContent";
RadioButtonGroupItemIcon.displayName = "SY INC.RadioButtonGroup.ItemIcon";

export {
  RadioButtonGroupRoot,
  RadioButtonGroupItem,
  RadioButtonGroupIndicator,
  RadioButtonGroupItemContent,
  RadioButtonGroupItemIcon,
};
export type {
  RadioButtonGroupRootProps,
  RadioButtonGroupItemProps,
  RadioButtonGroupIndicatorProps,
  RadioButtonGroupItemContentProps,
  RadioButtonGroupItemIconProps,
};

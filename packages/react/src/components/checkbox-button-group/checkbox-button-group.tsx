"use client";

import type {CheckboxFieldRenderProps} from "../checkbox";
import type {CheckboxButtonGroupVariants} from "@sy-inc/styles";
import type {ComponentProps, ComponentPropsWithRef, ReactNode} from "react";

import {checkboxButtonGroupVariants} from "@sy-inc/styles";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {Checkbox} from "../checkbox";
import {CheckboxGroup} from "../checkbox-group";

/**
 * `layout` is the only variant and it only touches `base`, so every other slot is a constant
 * class name. A module-level slot map keeps them out of context: the parts read their class
 * directly instead of subscribing to a provider that would re-render them on every root render.
 */
const slots = checkboxButtonGroupVariants();

interface CheckboxButtonGroupRootProps
  extends ComponentPropsWithRef<typeof CheckboxGroup>, CheckboxButtonGroupVariants {}

const CheckboxButtonGroupRoot = ({
  children,
  className,
  layout,
  variant = "secondary",
  ...props
}: CheckboxButtonGroupRootProps) => (
  <CheckboxGroup
    {...props}
    className={composeTwRenderProps(className, slots.base({layout}))}
    data-slot="checkbox-button-group"
    variant={variant}
  >
    {children}
  </CheckboxGroup>
);

interface CheckboxButtonGroupItemProps extends ComponentPropsWithRef<typeof Checkbox> {}

const CheckboxButtonGroupItem = ({children, className, ...props}: CheckboxButtonGroupItemProps) => (
  <Checkbox {...props} data-slot="checkbox-button-group-item">
    {(state) => (
      <Checkbox.Content className={composeTwRenderProps(className, slots.item())}>
        {typeof children === "function" ? children(state) : children}
      </Checkbox.Content>
    )}
  </Checkbox>
);

interface CheckboxButtonGroupIndicatorProps extends Omit<
  ComponentProps<typeof dom.span>,
  "children"
> {
  children?: ReactNode | ((state: CheckboxFieldRenderProps) => ReactNode);
}

const CheckboxButtonGroupIndicator = ({
  children,
  className,
  ...props
}: CheckboxButtonGroupIndicatorProps) => {
  const isCustom = children !== undefined;

  const indicator = (
    <Checkbox.Indicator>
      {isCustom
        ? (state: CheckboxFieldRenderProps) =>
            state.isSelected ? (typeof children === "function" ? children(state) : children) : null
        : undefined}
    </Checkbox.Indicator>
  );

  const slotProps = {
    ...props,
    className: composeSlotClassName(slots.indicator, className),
    "data-slot": "checkbox-button-group-indicator",
  };

  /**
   * A custom icon replaces the checkbox square rather than sitting inside it. Neutralising
   * `.checkbox__control` from here would mean out-specifying
   * `.checkbox--secondary:not(...):not(...):not(...) .checkbox__control`, so the custom branch
   * skips the control instead of fighting it.
   */
  return isCustom ? (
    <dom.span {...slotProps} data-custom="true">
      {indicator}
    </dom.span>
  ) : (
    <Checkbox.Control {...slotProps}>{indicator}</Checkbox.Control>
  );
};

interface CheckboxButtonGroupItemContentProps extends ComponentProps<typeof dom.span> {}

const CheckboxButtonGroupItemContent = ({
  className,
  ...props
}: CheckboxButtonGroupItemContentProps) => (
  <dom.span
    {...props}
    className={composeSlotClassName(slots.itemContent, className)}
    data-slot="checkbox-button-group-item-content"
  />
);

interface CheckboxButtonGroupItemIconProps extends ComponentProps<typeof dom.span> {}

const CheckboxButtonGroupItemIcon = ({className, ...props}: CheckboxButtonGroupItemIconProps) => (
  <dom.span
    {...props}
    className={composeSlotClassName(slots.itemIcon, className)}
    data-slot="checkbox-button-group-item-icon"
  />
);

CheckboxButtonGroupRoot.displayName = "SY INC.CheckboxButtonGroup";
CheckboxButtonGroupItem.displayName = "SY INC.CheckboxButtonGroup.Item";
CheckboxButtonGroupIndicator.displayName = "SY INC.CheckboxButtonGroup.Indicator";
CheckboxButtonGroupItemContent.displayName = "SY INC.CheckboxButtonGroup.ItemContent";
CheckboxButtonGroupItemIcon.displayName = "SY INC.CheckboxButtonGroup.ItemIcon";

export {
  CheckboxButtonGroupRoot,
  CheckboxButtonGroupItem,
  CheckboxButtonGroupIndicator,
  CheckboxButtonGroupItemContent,
  CheckboxButtonGroupItemIcon,
};
export type {
  CheckboxButtonGroupRootProps,
  CheckboxButtonGroupItemProps,
  CheckboxButtonGroupIndicatorProps,
  CheckboxButtonGroupItemContentProps,
  CheckboxButtonGroupItemIconProps,
};

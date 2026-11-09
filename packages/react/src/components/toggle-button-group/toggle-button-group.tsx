"use client";

/* Portions adapted from HeroUI v3.2.7 (Apache-2.0): https://github.com/heroui-inc/heroui/pull/6959 */

import type {DOMRenderProps} from "../../utils/dom";
import type {ToggleButtonGroupVariants, ToggleButtonVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {toggleButtonGroupVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {useSlottedContext} from "react-aria-components/slots";
import {
  ToggleButtonGroupContext as RACToggleButtonGroupContext,
  ToggleButtonGroup as ToggleButtonGroupPrimitive,
} from "react-aria-components/ToggleButtonGroup";

import {composeSlotClassName, composeTwRenderProps} from "../../utils";
import {dom} from "../../utils/dom";

/* -------------------------------------------------------------------------------------------------
 * ToggleButtonGroup Context
 * -----------------------------------------------------------------------------------------------*/
type ToggleButtonGroupContext = {
  slots?: ReturnType<typeof toggleButtonGroupVariants>;
  size?: ToggleButtonVariants["size"];
  isDisabled?: boolean;
};

const ToggleButtonGroupContext = createContext<ToggleButtonGroupContext>({});

/* -------------------------------------------------------------------------------------------------
 * ToggleButtonGroup Root
 * -----------------------------------------------------------------------------------------------*/
interface ToggleButtonGroupRootProps
  extends ComponentPropsWithRef<typeof ToggleButtonGroupPrimitive>, ToggleButtonGroupVariants {
  /** Size to propagate to all child ToggleButtons */
  size?: ToggleButtonVariants["size"];
  /** Whether the group buttons are visually separated (detached) instead of connected */
  isDetached?: boolean;
}

const ToggleButtonGroupRoot = ({
  children,
  className,
  fullWidth,
  isDetached = false,
  isDisabled,
  orientation: orientationProp,
  render,
  size,
  ...rest
}: ToggleButtonGroupRootProps) => {
  const racContext = useSlottedContext(RACToggleButtonGroupContext, rest.slot);
  const resolvedRender = render ?? racContext?.render;
  const orientation = orientationProp ?? racContext?.orientation ?? "horizontal";

  const slots = React.useMemo(
    () => toggleButtonGroupVariants({fullWidth, isDetached, orientation}),
    [fullWidth, isDetached, orientation],
  );

  const toggleButtonGroupContextValue = React.useMemo(
    () => ({isDisabled, size, slots}),
    [slots, size, isDisabled],
  );

  return (
    <ToggleButtonGroupContext value={toggleButtonGroupContextValue}>
      <ToggleButtonGroupPrimitive
        className={composeTwRenderProps(className, slots.base())}
        data-slot="toggle-button-group"
        isDisabled={isDisabled}
        orientation={orientation}
        {...rest}
        render={(domProps, values) => {
          if (resolvedRender) return resolvedRender(domProps, values);

          return (
            <div
              {...domProps}
              aria-orientation={
                domProps.role === "group" ? undefined : domProps["aria-orientation"]
              }
            />
          );
        }}
      >
        {children}
      </ToggleButtonGroupPrimitive>
    </ToggleButtonGroupContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * ToggleButtonGroup Separator
 * -----------------------------------------------------------------------------------------------*/
interface ToggleButtonGroupSeparatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  className?: string;
}

const ToggleButtonGroupSeparator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  className,
  ...props
}: ToggleButtonGroupSeparatorProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof ToggleButtonGroupSeparatorProps<E>>) => {
  const {slots} = use(ToggleButtonGroupContext);

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.separator, className)}
      data-slot="toggle-button-group-separator"
      {...(props as any)}
    />
  );
};

ToggleButtonGroupRoot.displayName = "SY INC.ToggleButtonGroup";
ToggleButtonGroupSeparator.displayName = "SY INC.ToggleButtonGroup.Separator";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ToggleButtonGroupRoot, ToggleButtonGroupSeparator, ToggleButtonGroupContext};

export type {ToggleButtonGroupRootProps, ToggleButtonGroupSeparatorProps};

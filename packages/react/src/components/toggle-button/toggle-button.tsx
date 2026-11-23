"use client";

import type {ToggleButtonVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {toggleButtonVariants} from "@sy-inc/styles";
import {use} from "react";
import {ToggleButton as ToggleButtonPrimitive} from "react-aria-components/ToggleButton";

import {composeTwRenderProps} from "../../utils";
import {ToggleButtonGroupContext} from "../toggle-button-group";

/* -------------------------------------------------------------------------------------------------
 * ToggleButton Root
 * -----------------------------------------------------------------------------------------------*/
interface ToggleButtonRootProps
  extends ComponentPropsWithRef<typeof ToggleButtonPrimitive>, ToggleButtonVariants {}

const ToggleButtonRoot = ({
  className,
  fullWidth,
  isIconOnly,
  size,
  variant,
  ...rest
}: ToggleButtonRootProps) => {
  const groupContext = use(ToggleButtonGroupContext);

  const styles = toggleButtonVariants({
    fullWidth,
    isIconOnly,
    // Direct prop wins over the group's size
    size: size ?? groupContext.size,
    variant,
  });

  return (
    <ToggleButtonPrimitive
      className={composeTwRenderProps(className, styles)}
      data-slot="toggle-button"
      {...rest}
    />
  );
};

ToggleButtonRoot.displayName = "SY INC.ToggleButton";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ToggleButtonRoot};

export type {ToggleButtonRootProps};

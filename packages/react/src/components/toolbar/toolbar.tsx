"use client";

import type {ToolbarVariants} from "@sy-ui/styles";
import type {ComponentPropsWithRef} from "react";

import {toolbarVariants} from "@sy-ui/styles";
import React from "react";
import {SeparatorContext} from "react-aria-components/Separator";
import {ToggleButtonGroupContext} from "react-aria-components/ToggleButtonGroup";
import {Toolbar as ToolbarPrimitive} from "react-aria-components/Toolbar";

import {composeTwRenderProps} from "../../utils";

/* -------------------------------------------------------------------------------------------------
 * Toolbar Root
 * -----------------------------------------------------------------------------------------------*/
interface ToolbarRootProps
  extends ComponentPropsWithRef<typeof ToolbarPrimitive>, ToolbarVariants {}

const ToolbarRoot = ({
  children,
  className,
  isAttached,
  orientation = "horizontal",
  ...props
}: ToolbarRootProps) => {
  const styles = React.useMemo(
    () => toolbarVariants({isAttached, orientation}),
    [isAttached, orientation],
  );

  return (
    <ToggleButtonGroupContext.Provider value={{orientation}}>
      <SeparatorContext.Provider
        value={{orientation: orientation === "horizontal" ? "vertical" : "horizontal"}}
      >
        <ToolbarPrimitive
          className={composeTwRenderProps(className, styles)}
          data-slot="toolbar"
          orientation={orientation}
          {...props}
        >
          {children}
        </ToolbarPrimitive>
      </SeparatorContext.Provider>
    </ToggleButtonGroupContext.Provider>
  );
};

ToolbarRoot.displayName = "SY UI.Toolbar";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ToolbarRoot};
export type {ToolbarRootProps};

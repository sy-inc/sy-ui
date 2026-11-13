"use client";

import type {CheckboxVariants} from "../checkbox";
import type {CheckboxGroupVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {checkboxGroupVariants} from "@sy-inc/styles";
import React, {createContext} from "react";
import {CheckboxGroup as CheckboxGroupPrimitive} from "react-aria-components/CheckboxGroup";

import {composeTwRenderProps} from "../../utils/compose";

/* -------------------------------------------------------------------------------------------------
 * CheckboxGroup Context
 * -----------------------------------------------------------------------------------------------*/
interface CheckboxGroupContext {
  variant?: CheckboxVariants["variant"];
}

const CheckboxGroupContext = createContext<CheckboxGroupContext>({});

interface CheckboxGroupProps
  extends ComponentPropsWithRef<typeof CheckboxGroupPrimitive>, CheckboxGroupVariants {
  /**
   * The axis the checkboxes are laid out along.
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
}

const CheckboxGroup = ({
  children,
  className,
  orientation = "vertical",
  variant,
  ...props
}: CheckboxGroupProps) => {
  const styles = React.useMemo(() => checkboxGroupVariants({variant}), [variant]);

  return (
    <CheckboxGroupContext.Provider value={{variant}}>
      <CheckboxGroupPrimitive
        className={composeTwRenderProps(className, styles)}
        data-orientation={orientation}
        data-slot="checkbox-group"
        {...props}
      >
        {children}
      </CheckboxGroupPrimitive>
    </CheckboxGroupContext.Provider>
  );
};

CheckboxGroup.displayName = "SY INC.CheckboxGroup";

export {CheckboxGroup, CheckboxGroupContext};
export type {CheckboxGroupProps};

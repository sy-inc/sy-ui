"use client";

import type {ListBoxVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {listboxVariants} from "@sy-inc/styles";
import React from "react";
import {ListBox as ListBoxPrimitive} from "react-aria-components/ListBox";

import {composeTwRenderProps} from "../../utils";
import {dataAttr} from "../../utils/assertion";

/* -------------------------------------------------------------------------------------------------
 * ListBox Root
 * -----------------------------------------------------------------------------------------------*/
interface ListBoxRootProps<T extends object>
  extends ComponentPropsWithRef<typeof ListBoxPrimitive<T>>, ListBoxVariants {
  className?: string;
  /** Marks the listbox invalid when it is used as a form field (e.g. multi-select). */
  isInvalid?: boolean;
}

function ListBoxRoot<T extends object>({
  className,
  isInvalid,
  render,
  variant,
  ...props
}: ListBoxRootProps<T>) {
  const styles = React.useMemo(() => listboxVariants({variant}), [variant]);

  return (
    <ListBoxPrimitive
      className={composeTwRenderProps(className, styles)}
      data-invalid={dataAttr(isInvalid)}
      data-slot="list-box"
      // RAC drops `aria-invalid` from ListBox props; re-attach it on the rendered element.
      render={
        isInvalid
          ? (domProps, renderProps) =>
              render ? (
                render({...domProps, "aria-invalid": true}, renderProps)
              ) : (
                <div {...domProps} aria-invalid />
              )
          : render
      }
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ListBoxRoot};

export type {ListBoxRootProps};

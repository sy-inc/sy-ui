"use client";

import type {ToolbarRootProps} from "../toolbar";
import type {ReactNode} from "react";

import {actionBarVariants} from "@sy-inc/styles";

import {composeTwRenderProps} from "../../utils";
import {Toolbar} from "../toolbar";

interface ActionBarRootProps extends Omit<
  ToolbarRootProps,
  "children" | "isAttached" | "orientation" | "render"
> {
  children?: ReactNode;
  /** Whether the contextual actions are available to users. */
  isOpen: boolean;
}

const ActionBarRoot = ({
  "aria-label": ariaLabel = "Actions",
  children,
  className,
  isOpen,
  ...props
}: ActionBarRootProps) => (
  <Toolbar.Root
    {...props}
    isAttached
    aria-label={ariaLabel}
    className={composeTwRenderProps(className, actionBarVariants())}
    data-open={isOpen}
    data-slot="action-bar"
    orientation="horizontal"
    render={(domProps) => (
      <div {...domProps} aria-hidden={isOpen ? undefined : true} inert={!isOpen} />
    )}
  >
    {children}
  </Toolbar.Root>
);

ActionBarRoot.displayName = "SY INC.ActionBar";

export {ActionBarRoot};
export type {ActionBarRootProps};

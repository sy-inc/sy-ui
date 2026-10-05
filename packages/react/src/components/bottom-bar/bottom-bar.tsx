"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {BottomBarVariants} from "@sy-inc/styles";
import type {ReactNode} from "react";
import type {ButtonProps, ButtonRenderProps} from "react-aria-components/Button";

import {bottomBarVariants} from "@sy-inc/styles";
import React from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {Link as LinkPrimitive} from "react-aria-components/Link";
import {SharedElementTransition} from "react-aria-components/SharedElementTransition";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {SelectionIndicator} from "../rac/selection-indicator";

const bottomBarSlots = bottomBarVariants();

type BottomBarSelectionStyle = "color" | "indicator" | "underline";

const BottomBarContext = React.createContext<BottomBarSelectionStyle>("indicator");

/* -------------------------------------------------------------------------------------------------
 * Bottom Bar Root
 * -----------------------------------------------------------------------------------------------*/
interface BottomBarRootProps
  extends
    Omit<React.ComponentPropsWithRef<"nav">, "children" | "className">,
    DOMRenderProps<"nav", undefined>,
    BottomBarVariants {
  children: ReactNode;
  className?: string;
}

const BottomBarRoot = ({
  children,
  className,
  position = "fixed",
  selectionStyle = "indicator",
  variant = "floating",
  ...props
}: BottomBarRootProps) => {
  return (
    <BottomBarContext value={selectionStyle}>
      <dom.nav
        {...props}
        data-slot="bottom-bar"
        className={composeSlotClassName(
          bottomBarVariants({position, selectionStyle, variant}).base,
          className,
        )}
      >
        {/* Scopes the indicator so it slides from the previous active item to the next. */}
        <SharedElementTransition>
          <ul className={bottomBarSlots.list()} data-slot="bottom-bar-list">
            {children}
          </ul>
        </SharedElementTransition>
      </dom.nav>
    </BottomBarContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Bottom Bar Item
 * -----------------------------------------------------------------------------------------------*/
type BottomBarItemRenderProps = Pick<
  ButtonRenderProps,
  "isDisabled" | "isFocused" | "isFocusVisible" | "isHovered" | "isPressed"
> & {
  isActive: boolean;
};

type BottomBarItemBaseProps = {
  children: ReactNode | ((values: BottomBarItemRenderProps) => ReactNode);
  /**
   * Marks the current destination. Leave every item inactive when the current page is not in the
   * bar. Sets `aria-current="page"` on links and `aria-current="true"` on buttons.
   */
  isActive?: boolean;
};

/** A link when `href` is present (route destinations), a button otherwise (in-page views). */
type BottomBarItemProps = BottomBarItemBaseProps &
  (
    | (Omit<React.ComponentPropsWithRef<typeof ButtonPrimitive>, "children"> & {href?: never})
    | (Omit<React.ComponentPropsWithRef<typeof LinkPrimitive>, "children"> & {href: string})
  );

const BottomBarItem = ({
  children,
  className,
  href,
  isActive = false,
  ...props
}: BottomBarItemProps) => {
  const selectionStyle = React.use(BottomBarContext);
  const Control = (href !== undefined ? LinkPrimitive : ButtonPrimitive) as typeof ButtonPrimitive;

  return (
    <li className={bottomBarSlots.item()} data-slot="bottom-bar-item">
      <Control
        {...(props as ButtonProps)}
        {...((href !== undefined ? {href} : {}) as object)}
        aria-current={isActive ? (href !== undefined ? "page" : "true") : undefined}
        data-active={isActive || undefined}
        data-slot="bottom-bar-link"
        className={composeTwRenderProps(
          className as ButtonProps["className"],
          bottomBarSlots.link(),
        )}
      >
        {(values) => (
          <>
            {selectionStyle !== "color" && (
              <SelectionIndicator
                aria-hidden
                className={bottomBarSlots.indicator()}
                data-slot="bottom-bar-indicator"
                isSelected={isActive}
              />
            )}
            {typeof children === "function" ? children({...values, isActive}) : children}
          </>
        )}
      </Control>
    </li>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Bottom Bar Icon
 * -----------------------------------------------------------------------------------------------*/
interface BottomBarIconProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const BottomBarIcon = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: BottomBarIconProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof BottomBarIconProps<E>>) => {
  return (
    <dom.span
      {...(props as any)}
      aria-hidden="true"
      className={composeSlotClassName(bottomBarSlots.icon, className)}
      data-slot="bottom-bar-icon"
    >
      {children}
    </dom.span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Bottom Bar Label
 * -----------------------------------------------------------------------------------------------*/
interface BottomBarLabelProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children: ReactNode;
  className?: string;
}

const BottomBarLabel = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: BottomBarLabelProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof BottomBarLabelProps<E>>) => {
  return (
    <dom.span
      className={composeSlotClassName(bottomBarSlots.label, className)}
      data-slot="bottom-bar-label"
      {...(props as any)}
    >
      {children}
    </dom.span>
  );
};

BottomBarRoot.displayName = "SY INC.BottomBar";
BottomBarItem.displayName = "SY INC.BottomBar.Item";
BottomBarIcon.displayName = "SY INC.BottomBar.Icon";
BottomBarLabel.displayName = "SY INC.BottomBar.Label";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {BottomBarRoot, BottomBarItem, BottomBarIcon, BottomBarLabel};

export type {
  BottomBarSelectionStyle,
  BottomBarRootProps,
  BottomBarItemProps,
  BottomBarItemRenderProps,
  BottomBarIconProps,
  BottomBarLabelProps,
};

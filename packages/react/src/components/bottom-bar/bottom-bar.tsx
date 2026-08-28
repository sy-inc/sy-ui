"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {TabsRootProps, TabProps as TabsTabProps} from "../tabs";
import type {BottomBarVariants} from "@sy-inc/styles";
import type {ReactNode} from "react";
import type {TabRenderProps} from "react-aria-components/Tabs";

import {bottomBarVariants} from "@sy-inc/styles";
import React from "react";

import {composeSlotClassName} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {Tabs} from "../tabs";

const bottomBarSlots = bottomBarVariants();

type BottomBarSelectionStyle = "color" | "indicator" | "underline";

const BottomBarContext = React.createContext<{selectionStyle: BottomBarSelectionStyle}>({
  selectionStyle: "indicator",
});

/* -------------------------------------------------------------------------------------------------
 * Bottom Bar Root
 * -----------------------------------------------------------------------------------------------*/
interface BottomBarRootProps
  extends
    Omit<TabsRootProps, "children" | "className" | "orientation" | "variant">,
    BottomBarVariants {
  children: ReactNode;
  className?: string;
}

const BottomBarRoot = ({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  position = "fixed",
  render,
  selectionStyle = "indicator",
  variant = "floating",
  ...props
}: BottomBarRootProps) => {
  const slots = React.useMemo(
    () => bottomBarVariants({position, selectionStyle, variant}),
    [position, selectionStyle, variant],
  );

  return (
    <BottomBarContext value={{selectionStyle}}>
      <Tabs.Root
        {...props}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={composeSlotClassName(slots.base, className)}
        orientation="horizontal"
        render={(tabsProps, tabsRenderProps) => {
          const rootProps = {
            ...tabsProps,
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledBy,
            "data-slot": "bottom-bar",
            role: "navigation",
          } as React.JSX.IntrinsicElements["div"];

          return render ? render(rootProps, tabsRenderProps) : <div {...rootProps} />;
        }}
      >
        <Tabs.List aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className={slots.list()}>
          {children}
        </Tabs.List>
      </Tabs.Root>
    </BottomBarContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Bottom Bar Item
 * -----------------------------------------------------------------------------------------------*/
type BottomBarItemRenderProps = TabRenderProps;

interface BottomBarItemProps extends Omit<TabsTabProps, "children" | "className" | "href"> {
  children: ReactNode | ((values: BottomBarItemRenderProps) => ReactNode);
  className?: TabsTabProps["className"];
  /** Stable selection key. BottomBar items intentionally do not navigate via href. */
  id: NonNullable<TabsTabProps["id"]>;
}

const BottomBarItem = ({children, className, id, ...props}: BottomBarItemProps) => {
  const {selectionStyle} = React.use(BottomBarContext);

  return (
    <Tabs.Tab {...props} className={composeSlotClassName(bottomBarSlots.link, className)} id={id}>
      {(values) => (
        <>
          {selectionStyle !== "color" && (
            <Tabs.Indicator aria-hidden className={bottomBarSlots.indicator()} />
          )}
          {typeof children === "function" ? children(values) : children}
        </>
      )}
    </Tabs.Tab>
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

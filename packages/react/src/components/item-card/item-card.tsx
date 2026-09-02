"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {ItemCardVariants} from "@sy-inc/styles";
import type {ReactNode} from "react";

import {itemCardVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";

import {composeSlotClassName} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {SurfaceContext} from "../surface";

type ItemCardContext = {slots?: ReturnType<typeof itemCardVariants>};

const ItemCardContext = createContext<ItemCardContext>({});

interface ItemCardRootProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
  /** Visual variant. @default "default" */
  variant?: ItemCardVariants["variant"];
}

const ItemCardRoot = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  variant = "default",
  ...props
}: ItemCardRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof ItemCardRootProps<E>>) => {
  const slots = React.useMemo(() => itemCardVariants({variant}), [variant]);

  const content = (
    <dom.div className={slots.base({className})} data-slot="item-card" {...(props as any)}>
      {children}
    </dom.div>
  );

  return (
    <ItemCardContext value={{slots}}>
      {variant === "outline" || variant === "transparent" ? (
        content
      ) : (
        // Allows inner components to apply "on-surface" colors for proper contrast
        <SurfaceContext value={{variant}}>{content}</SurfaceContext>
      )}
    </ItemCardContext>
  );
};

interface ItemCardIconProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const ItemCardIcon = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: ItemCardIconProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof ItemCardIconProps<E>>) => {
  const {slots} = use(ItemCardContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.icon, className)}
      data-slot="item-card-icon"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

interface ItemCardContentProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const ItemCardContent = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: ItemCardContentProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof ItemCardContentProps<E>>) => {
  const {slots} = use(ItemCardContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.content, className)}
      data-slot="item-card-content"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

interface ItemCardTitleProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const ItemCardTitle = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: ItemCardTitleProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof ItemCardTitleProps<E>>) => {
  const {slots} = use(ItemCardContext);

  return (
    <dom.span
      className={composeSlotClassName(slots?.title, className)}
      data-slot="item-card-title"
      {...(props as any)}
    >
      {children}
    </dom.span>
  );
};

interface ItemCardDescriptionProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const ItemCardDescription = <E extends keyof React.JSX.IntrinsicElements = "span">({
  children,
  className,
  ...props
}: ItemCardDescriptionProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof ItemCardDescriptionProps<E>>) => {
  const {slots} = use(ItemCardContext);

  return (
    <dom.span
      className={composeSlotClassName(slots?.description, className)}
      data-slot="item-card-description"
      {...(props as any)}
    >
      {children}
    </dom.span>
  );
};

interface ItemCardActionProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const ItemCardAction = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  ...props
}: ItemCardActionProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof ItemCardActionProps<E>>) => {
  const {slots} = use(ItemCardContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.action, className)}
      data-slot="item-card-action"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};

export {
  ItemCardRoot,
  ItemCardIcon,
  ItemCardContent,
  ItemCardTitle,
  ItemCardDescription,
  ItemCardAction,
};

export type {
  ItemCardRootProps,
  ItemCardIconProps,
  ItemCardContentProps,
  ItemCardTitleProps,
  ItemCardDescriptionProps,
  ItemCardActionProps,
};

"use client";

import type {AvatarGroupContextValue} from "./avatar-group-context";
import type {DOMRenderProps} from "../../utils/dom";
import type {AvatarGroupVariants, AvatarVariants} from "@sy-inc/styles";
import type {ReactElement, ReactNode} from "react";

import {avatarGroupVariants} from "@sy-inc/styles";
import React, {Children, isValidElement, use, useMemo} from "react";

import {composeSlotClassName} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {Avatar} from "../avatar";

import {AVATAR_GROUP_CHILD, AvatarGroupContext} from "./avatar-group-context";

interface AvatarGroupCountProps extends Omit<
  React.ComponentPropsWithRef<typeof Avatar>,
  "color" | "children"
> {
  children?: ReactNode;
  color?: AvatarVariants["color"];
}

const AvatarGroupCount = ({
  children,
  className,
  color,
  size,
  variant,
  ...props
}: AvatarGroupCountProps) => {
  const group = use(AvatarGroupContext);
  const finalSize = size ?? group.size;
  const finalColor = color ?? group.color;
  const finalVariant = variant ?? group.variant;

  return (
    <Avatar
      className={composeSlotClassName(group.slots?.count, className)}
      color={finalColor}
      data-slot="avatar-group-count"
      size={finalSize}
      variant={finalVariant}
      {...props}
    >
      <Avatar.Fallback>{children}</Avatar.Fallback>
    </Avatar>
  );
};

AvatarGroupCount.displayName = "SY INC.AvatarGroup.Count";

const isCountElement = (element: ReactElement) => element.type === AvatarGroupCount;

interface AvatarGroupRootProps<E extends keyof React.JSX.IntrinsicElements = "div">
  extends DOMRenderProps<E, undefined>, AvatarGroupVariants {
  children?: ReactNode;
  className?: string;
  size?: AvatarVariants["size"];
  color?: AvatarVariants["color"];
  variant?: AvatarVariants["variant"];
  max?: number;
  overlap?: AvatarGroupVariants["overlap"];
}

const AvatarGroupRoot = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  color,
  isGrid = false,
  max,
  overlap = "clip",
  size = "md",
  variant,
  ...props
}: AvatarGroupRootProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof AvatarGroupRootProps<E>>) => {
  const slots = useMemo(() => avatarGroupVariants({isGrid, overlap}), [isGrid, overlap]);
  const context = useMemo<AvatarGroupContextValue>(
    () => ({slots, size, color, variant}),
    [slots, size, color, variant],
  );

  const avatarChildren: ReactElement[] = [];
  const countChildren: ReactElement[] = [];

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    if (isCountElement(child)) countChildren.push(child);
    else avatarChildren.push(child);
  }

  const visibleChildren = max == null ? avatarChildren : avatarChildren.slice(0, Math.max(0, max));
  const remaining = max == null ? 0 : Math.max(0, avatarChildren.length - visibleChildren.length);
  const wrappedChildren = visibleChildren.map((child) =>
    React.cloneElement(child, {[AVATAR_GROUP_CHILD]: true} as any),
  );
  const countContent =
    countChildren.length > 0 ? (
      countChildren
    ) : remaining > 0 ? (
      <AvatarGroupCount>+{remaining}</AvatarGroupCount>
    ) : null;

  return (
    <AvatarGroupContext value={context}>
      <dom.div className={slots.base({className})} data-slot="avatar-group" {...(props as any)}>
        {wrappedChildren}
        {countContent}
      </dom.div>
    </AvatarGroupContext>
  );
};

AvatarGroupRoot.displayName = "SY INC.AvatarGroup";

export {AvatarGroupRoot, AvatarGroupCount, AvatarGroupContext, AVATAR_GROUP_CHILD};
export type {AvatarGroupRootProps, AvatarGroupCountProps};
export type {AvatarGroupContextValue} from "./avatar-group-context";

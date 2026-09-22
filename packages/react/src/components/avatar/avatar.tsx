"use client";

import type {AvatarVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {avatarVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";

import {composeSlotClassName} from "../../utils/compose";
import {AvatarGroupContext} from "../avatar-group/avatar-group-context";

/* ------------------------------------------------------------------------------------------------
 * Avatar Context
 * --------------------------------------------------------------------------------------------- */
type AvatarContext = {
  slots?: ReturnType<typeof avatarVariants>;
};

const AvatarContext = createContext<AvatarContext>({});

/* -------------------------------------------------------------------------------------------------
 * Avatar Root
 * -----------------------------------------------------------------------------------------------*/
interface AvatarRootProps
  extends Omit<ComponentPropsWithRef<typeof AvatarPrimitive.Root>, "color">, AvatarVariants {
  __avatar_group_child?: boolean;
}

const AvatarRoot = ({
  __avatar_group_child: isAvatarGroupChild,
  children,
  className,
  color,
  size,
  variant,
  ...props
}: AvatarRootProps) => {
  const avatarGroupContext = use(AvatarGroupContext);
  const shouldUseContext = isAvatarGroupChild === true;
  const finalSize = size ?? (shouldUseContext ? avatarGroupContext.size : undefined);
  const finalColor = color ?? (shouldUseContext ? avatarGroupContext.color : undefined);
  const finalVariant = variant ?? (shouldUseContext ? avatarGroupContext.variant : undefined);
  const slots = React.useMemo(
    () => avatarVariants({color: finalColor, size: finalSize, variant: finalVariant}),
    [finalColor, finalSize, finalVariant],
  );
  const context = React.useMemo(() => ({slots}), [slots]);

  return (
    <AvatarContext value={context}>
      <AvatarPrimitive.Root className={slots.base({className})} {...props}>
        {children}
      </AvatarPrimitive.Root>
    </AvatarContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Avatar Image
 * -----------------------------------------------------------------------------------------------*/
interface AvatarImageProps extends ComponentPropsWithRef<typeof AvatarPrimitive.Image> {}

const AvatarImage = ({
  className,
  crossOrigin,
  loading,
  onError,
  onLoad,
  sizes,
  src,
  srcSet,
  ...props
}: AvatarImageProps) => {
  const {slots} = React.use(AvatarContext);

  return (
    <AvatarPrimitive.Image
      className={composeSlotClassName(slots?.image, className)}
      crossOrigin={crossOrigin}
      loading={loading}
      sizes={sizes}
      src={src}
      srcSet={srcSet}
      onError={onError}
      onLoad={onLoad}
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Avatar Fallback
 * -----------------------------------------------------------------------------------------------*/
interface AvatarFallbackProps extends ComponentPropsWithRef<typeof AvatarPrimitive.Fallback> {
  color?: AvatarVariants["color"];
}

const AvatarFallback = ({className, color, ...props}: AvatarFallbackProps) => {
  const {slots} = React.use(AvatarContext);

  return (
    <AvatarPrimitive.Fallback
      className={composeSlotClassName(slots?.fallback, className, {color})}
      data-slot="avatar-fallback"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {AvatarRoot, AvatarImage, AvatarFallback};

export type {AvatarRootProps, AvatarImageProps, AvatarFallbackProps};

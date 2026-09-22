import type {ComponentProps} from "react";

import {AvatarGroupCount, AvatarGroupRoot} from "./avatar-group";

export const AvatarGroup = Object.assign(AvatarGroupRoot, {
  Root: AvatarGroupRoot,
  Count: AvatarGroupCount,
});

export type AvatarGroup = {
  Props: ComponentProps<typeof AvatarGroupRoot>;
  RootProps: ComponentProps<typeof AvatarGroupRoot>;
  CountProps: ComponentProps<typeof AvatarGroupCount>;
};

export {AvatarGroupRoot, AvatarGroupCount};
export type {
  AvatarGroupRootProps,
  AvatarGroupRootProps as AvatarGroupProps,
  AvatarGroupCountProps,
} from "./avatar-group";
export {AvatarGroupContext, AVATAR_GROUP_CHILD} from "./avatar-group";
export {avatarGroupVariants} from "@sy-inc/styles";
export type {AvatarGroupVariants} from "@sy-inc/styles";

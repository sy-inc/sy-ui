"use client";

import type {AvatarVariants, avatarGroupVariants} from "@sy-inc/styles";

import {createContext} from "react";

type AvatarGroupContextValue = {
  slots?: ReturnType<typeof avatarGroupVariants>;
  size?: AvatarVariants["size"];
  color?: AvatarVariants["color"];
  variant?: AvatarVariants["variant"];
};

const AvatarGroupContext = createContext<AvatarGroupContextValue>({});
const AVATAR_GROUP_CHILD = "__avatar_group_child";

export {AvatarGroupContext, AVATAR_GROUP_CHILD};
export type {AvatarGroupContextValue};

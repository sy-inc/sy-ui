"use client";

import {Avatar, AvatarGroup} from "@sy-inc/react";

const people = ["张明", "李华", "王芳", "刘洋", "陈静"];

export function Appearance() {
  return (
    <div className="flex flex-col gap-6">
      <AvatarGroup
        aria-label="裁切头像组"
        color="accent"
        overlap="clip"
        role="group"
        size="lg"
        variant="soft"
      >
        {people.map((name) => (
          <Avatar key={name}>
            <Avatar.Fallback aria-label={name} role="img">
              {name[0]}
            </Avatar.Fallback>
          </Avatar>
        ))}
      </AvatarGroup>
      <AvatarGroup aria-label="描边头像组" color="success" overlap="ring" role="group" size="lg">
        {people.map((name) => (
          <Avatar key={name}>
            <Avatar.Fallback aria-label={name} role="img">
              {name[0]}
            </Avatar.Fallback>
          </Avatar>
        ))}
      </AvatarGroup>
    </div>
  );
}

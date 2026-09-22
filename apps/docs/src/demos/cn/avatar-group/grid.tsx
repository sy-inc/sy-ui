"use client";

import {Avatar, AvatarGroup} from "@sy-inc/react";

const people = ["张明", "李华", "王芳", "刘洋", "陈静"];

export function Grid() {
  return (
    <AvatarGroup isGrid aria-label="团队成员" color="accent" role="group" size="sm" variant="soft">
      {people.map((name) => (
        <Avatar key={name}>
          <Avatar.Fallback aria-label={name} role="img">
            {name[0]}
          </Avatar.Fallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}

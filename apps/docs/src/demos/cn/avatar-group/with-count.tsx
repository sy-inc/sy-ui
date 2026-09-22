"use client";

import {Avatar, AvatarGroup} from "@sy-inc/react";

const people = ["张明", "李华", "王芳"];

export function WithCount() {
  return (
    <AvatarGroup aria-label="团队成员" max={3} overlap="ring" role="group">
      {people.map((name) => (
        <Avatar key={name}>
          <Avatar.Fallback aria-label={name} role="img">
            {name[0]}
          </Avatar.Fallback>
        </Avatar>
      ))}
      <AvatarGroup.Count role="img" aria-label="另有 9 名团队成员">
        +9
      </AvatarGroup.Count>
    </AvatarGroup>
  );
}

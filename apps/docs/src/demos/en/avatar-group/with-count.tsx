"use client";

import {Avatar, AvatarGroup} from "@sy-inc/react";

const people = ["Ada", "Lin", "Sam"];

export function WithCount() {
  return (
    <AvatarGroup aria-label="Team" max={3} overlap="ring" role="group">
      {people.map((name) => (
        <Avatar key={name}>
          <Avatar.Fallback aria-label={name} role="img">
            {name[0]}
          </Avatar.Fallback>
        </Avatar>
      ))}
      <AvatarGroup.Count role="img" aria-label="9 more team members">
        +9
      </AvatarGroup.Count>
    </AvatarGroup>
  );
}

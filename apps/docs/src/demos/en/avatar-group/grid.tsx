"use client";

import {Avatar, AvatarGroup} from "@sy-inc/react";

const people = ["Ada", "Lin", "Sam", "Kai", "Ren"];

export function Grid() {
  return (
    <AvatarGroup isGrid aria-label="Team" color="accent" role="group" size="sm" variant="soft">
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

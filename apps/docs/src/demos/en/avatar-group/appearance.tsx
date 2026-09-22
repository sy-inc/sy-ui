"use client";

import {Avatar, AvatarGroup} from "@sy-inc/react";

const people = ["Ada", "Lin", "Sam", "Kai", "Ren"];

export function Appearance() {
  return (
    <div className="flex flex-col gap-6">
      <AvatarGroup
        aria-label="Clipped avatars"
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
      <AvatarGroup
        aria-label="Ringed avatars"
        color="success"
        overlap="ring"
        role="group"
        size="lg"
      >
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

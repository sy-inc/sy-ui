"use client";

import {Avatar, AvatarGroup} from "@sy-inc/react";

const users = [
  {
    id: 1,
    image: "https://assets.sy-inc.com/avatars/blue.jpg",
    name: "John Doe",
  },
  {
    id: 2,
    image: "https://assets.sy-inc.com/avatars/green.jpg",
    name: "Kate Wilson",
  },
  {
    id: 3,
    image: "https://assets.sy-inc.com/avatars/purple.jpg",
    name: "Emily Chen",
  },
  {
    id: 4,
    image: "https://assets.sy-inc.com/avatars/orange.jpg",
    name: "Michael Brown",
  },
  {
    id: 5,
    image: "https://assets.sy-inc.com/avatars/red.jpg",
    name: "Olivia Davis",
  },
];

export function Group() {
  return (
    <AvatarGroup aria-label="Team" color="accent" max={3} role="group">
      {users.map((user) => (
        <Avatar key={user.id}>
          <Avatar.Image alt={user.name} src={user.image} />
          <Avatar.Fallback aria-label={user.name} role="img">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar.Fallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}

"use client";

import {Avatar, AvatarGroup} from "@sy-inc/react";

const users = [
  {
    id: 1,
    image: "https://assets.sy-inc.com/avatars/blue.jpg",
    name: "张明",
  },
  {
    id: 2,
    image: "https://assets.sy-inc.com/avatars/green.jpg",
    name: "李华",
  },
  {
    id: 3,
    image: "https://assets.sy-inc.com/avatars/purple.jpg",
    name: "王芳",
  },
  {
    id: 4,
    image: "https://assets.sy-inc.com/avatars/orange.jpg",
    name: "刘洋",
  },
  {
    id: 5,
    image: "https://assets.sy-inc.com/avatars/red.jpg",
    name: "陈静",
  },
];

function initialsFromName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return parts.map((n) => n[0]).join("");
  }

  return name.slice(0, 2);
}

export function Group() {
  return (
    <AvatarGroup aria-label="团队成员" color="accent" max={3} role="group">
      {users.map((user) => (
        <Avatar key={user.id}>
          <Avatar.Image alt={user.name} src={user.image} />
          <Avatar.Fallback aria-label={user.name} role="img">
            {initialsFromName(user.name)}
          </Avatar.Fallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}

"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ComboBox,
  Description,
  Input,
  Label,
  ListBox,
} from "@sy-inc/react";

export function CustomValue() {
  const users = [
    {
      avatarUrl: "https://assets.sy-inc.com/avatars/blue.jpg",
      email: "bob@sy-inc.com",
      fallback: "B",
      id: "1",
      name: "Bob",
    },
    {
      avatarUrl: "https://assets.sy-inc.com/avatars/green.jpg",
      email: "fred@sy-inc.com",
      fallback: "F",
      id: "2",
      name: "Fred",
    },
    {
      avatarUrl: "https://assets.sy-inc.com/avatars/purple.jpg",
      email: "martha@sy-inc.com",
      fallback: "M",
      id: "3",
      name: "Martha",
    },
    {
      avatarUrl: "https://assets.sy-inc.com/avatars/red.jpg",
      email: "john@sy-inc.com",
      fallback: "J",
      id: "4",
      name: "John",
    },
    {
      avatarUrl: "https://assets.sy-inc.com/avatars/orange.jpg",
      email: "jane@sy-inc.com",
      fallback: "J",
      id: "5",
      name: "Jane",
    },
  ];

  return (
    <ComboBox className="w-[256px]">
      <Label>用户</Label>
      <ComboBox.InputGroup>
        <Input placeholder="搜索用户…" />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {users.map((user) => (
            <ListBox.Item key={user.id} id={user.id} textValue={user.name}>
              <Avatar size="sm">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Label>{user.name}</Label>
                <Description>{user.email}</Description>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

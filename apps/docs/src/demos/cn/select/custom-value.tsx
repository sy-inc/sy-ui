"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Description,
  Label,
  ListBox,
  Select,
} from "@sy-ui/react";

export function CustomValue() {
  const users = [
    {
      avatarUrl: "https://assets.sy-ui.com/avatars/blue.jpg",
      email: "bob@sy-ui.com",
      fallback: "B",
      id: "1",
      name: "Bob",
    },
    {
      avatarUrl: "https://assets.sy-ui.com/avatars/green.jpg",
      email: "fred@sy-ui.com",
      fallback: "F",
      id: "2",
      name: "Fred",
    },
    {
      avatarUrl: "https://assets.sy-ui.com/avatars/purple.jpg",
      email: "martha@sy-ui.com",
      fallback: "M",
      id: "3",
      name: "Martha",
    },
    {
      avatarUrl: "https://assets.sy-ui.com/avatars/red.jpg",
      email: "john@sy-ui.com",
      fallback: "J",
      id: "4",
      name: "John",
    },
    {
      avatarUrl: "https://assets.sy-ui.com/avatars/orange.jpg",
      email: "jane@sy-ui.com",
      fallback: "J",
      id: "5",
      name: "Jane",
    },
  ];

  return (
    <Select className="w-[256px]" placeholder="请选择用户">
      <Label>用户</Label>
      <Select.Trigger>
        <Select.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItems = state.selectedItems;

            if (selectedItems.length > 1) {
              return `${selectedItems.length} 位用户已选`;
            }

            const selectedItem = users.find((user) => user.id === selectedItems[0]?.key);

            if (!selectedItem) {
              return defaultChildren;
            }

            return (
              <div className="flex items-center gap-2">
                <Avatar className="size-4" size="sm">
                  <AvatarImage src={selectedItem.avatarUrl} />
                  <AvatarFallback>{selectedItem.fallback}</AvatarFallback>
                </Avatar>
                <span>{selectedItem.name}</span>
              </div>
            );
          }}
        </Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
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
      </Select.Popover>
    </Select>
  );
}

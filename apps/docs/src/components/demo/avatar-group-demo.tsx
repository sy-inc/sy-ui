import {Avatar, AvatarGroup} from "@sy-inc/react";

const avatars = [
  {
    image: "https://assets.sy-inc.com/avatars/blue.jpg",
    name: "Blue",
  },
  {
    image: "https://assets.sy-inc.com/avatars/green.jpg",
    name: "Green",
  },
  {
    image: "https://assets.sy-inc.com/avatars/purple.jpg",
    name: "Purple",
  },
  {
    image: "https://assets.sy-inc.com/avatars/orange.jpg",
    name: "Orange",
  },
  {
    image: "https://assets.sy-inc.com/avatars/red.jpg",
    name: "red",
  },
  {
    image: "https://assets.sy-inc.com/avatars/blue.jpg",
    name: "Blue",
  },
  {
    image: "https://assets.sy-inc.com/avatars/black.jpg",
    name: "Black",
  },
];

export function AvatarGroupDemo() {
  return (
    <div className="flex w-full justify-center">
      <AvatarGroup aria-label="Team" max={5} overlap="ring" role="group">
        {avatars.map((item, index) => (
          <Avatar key={`${item.name}-${index}`}>
            <Avatar.Image alt={item.name} src={item.image} />
            <Avatar.Fallback>
              {item.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar.Fallback>
          </Avatar>
        ))}
      </AvatarGroup>
    </div>
  );
}

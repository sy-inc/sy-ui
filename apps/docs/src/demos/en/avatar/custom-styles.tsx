import {Avatar} from "@sy-inc/react";

export function CustomStyles() {
  return (
    <Avatar className="rounded-lg">
      <Avatar.Image alt="John Doe" src="https://img.sy-ui.chat/image/avatar?w=400&h=400&u=3" />
      <Avatar.Fallback className="rounded-lg">JD</Avatar.Fallback>
    </Avatar>
  );
}

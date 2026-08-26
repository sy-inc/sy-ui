import {Avatar} from "@sy-ui/react";

export function CustomStyles() {
  return (
    <Avatar className="rounded-lg">
      <Avatar.Image alt="张三" src="https://img.sy-ui.chat/image/avatar?w=400&h=400&u=3" />
      <Avatar.Fallback className="rounded-lg">张三</Avatar.Fallback>
    </Avatar>
  );
}

import {Avatar, Badge} from "@sy-inc/react";

const AVATAR_URL = "https://assets.sy-ui.com/avatars/green.jpg";

export function BadgeColors() {
  const colors = ["default", "accent", "success", "warning", "danger"] as const;

  return (
    <div className="flex items-center gap-6">
      {colors.map((color) => (
        <Badge.Anchor key={color}>
          <Avatar>
            <Avatar.Image src={AVATAR_URL} />
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
          <Badge color={color} size="sm" />
        </Badge.Anchor>
      ))}
    </div>
  );
}

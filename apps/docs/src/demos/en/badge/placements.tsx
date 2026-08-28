import {Avatar, Badge} from "@sy-inc/react";

const AVATAR_URL = "https://assets.sy-inc.com/avatars/green.jpg";

export function BadgePlacements() {
  const placements = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

  return (
    <div className="flex items-center gap-8">
      {placements.map((placement) => (
        <div key={placement} className="flex flex-col items-center gap-2">
          <Badge.Anchor>
            <Avatar>
              <Avatar.Image src={AVATAR_URL} />
              <Avatar.Fallback>JD</Avatar.Fallback>
            </Avatar>
            <Badge color="accent" placement={placement} size="sm" />
          </Badge.Anchor>
          <span className="text-xs text-muted">{placement}</span>
        </div>
      ))}
    </div>
  );
}

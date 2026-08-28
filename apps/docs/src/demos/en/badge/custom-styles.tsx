import {Avatar, Badge} from "@sy-inc/react";

export function CustomStyles() {
  return (
    <Badge.Anchor>
      <Avatar>
        <Avatar.Image
          alt="Kate Wilson"
          src="https://assets.sy-inc.com/avatars/blue.jpg"
        />
        <Avatar.Fallback>KW</Avatar.Fallback>
      </Avatar>
      <Badge className="min-w-5 font-semibold tabular-nums" color="accent" size="sm" variant="soft">
        5
      </Badge>
    </Badge.Anchor>
  );
}

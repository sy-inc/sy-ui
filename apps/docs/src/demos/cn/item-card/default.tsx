import {CircleArrowRight, Globe} from "@gravity-ui/icons";
import {Button, ItemCard} from "@sy-inc/react";

export function Default() {
  return (
    <ItemCard className="w-full max-w-md">
      <ItemCard.Icon aria-hidden="true">
        <Globe className="size-4" />
      </ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>语言</ItemCard.Title>
        <ItemCard.Description>选择你偏好的界面语言</ItemCard.Description>
      </ItemCard.Content>
      <ItemCard.Action>
        <Button size="sm" variant="outline">
          简体中文 <CircleArrowRight className="size-4" />
        </Button>
      </ItemCard.Action>
    </ItemCard>
  );
}

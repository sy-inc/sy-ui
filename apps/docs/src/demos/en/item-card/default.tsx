import {CircleArrowRight, Globe} from "@gravity-ui/icons";
import {Button, ItemCard} from "@sy-inc/react";

export function Default() {
  return (
    <ItemCard className="w-full max-w-md">
      <ItemCard.Icon aria-hidden="true">
        <Globe className="size-4" />
      </ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>Language</ItemCard.Title>
        <ItemCard.Description>Choose your preferred language</ItemCard.Description>
      </ItemCard.Content>
      <ItemCard.Action>
        <Button size="sm" variant="outline">
          English <CircleArrowRight className="size-4" />
        </Button>
      </ItemCard.Action>
    </ItemCard>
  );
}

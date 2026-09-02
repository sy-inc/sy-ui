import {Envelope} from "@gravity-ui/icons";
import {ItemCard, Switch} from "@sy-inc/react";

export function WithSwitch() {
  return (
    <ItemCard className="w-full max-w-md">
      <ItemCard.Icon aria-hidden="true">
        <Envelope className="size-4" />
      </ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>Email notifications</ItemCard.Title>
        <ItemCard.Description>Receive product announcements</ItemCard.Description>
      </ItemCard.Content>
      <ItemCard.Action>
        <Switch defaultSelected aria-label="Enable email notifications">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
        </Switch>
      </ItemCard.Action>
    </ItemCard>
  );
}

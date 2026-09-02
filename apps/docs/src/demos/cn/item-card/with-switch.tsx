import {Envelope} from "@gravity-ui/icons";
import {ItemCard, Switch} from "@sy-inc/react";

export function WithSwitch() {
  return (
    <ItemCard className="w-full max-w-md">
      <ItemCard.Icon aria-hidden="true">
        <Envelope className="size-4" />
      </ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>邮件通知</ItemCard.Title>
        <ItemCard.Description>接收产品更新公告</ItemCard.Description>
      </ItemCard.Content>
      <ItemCard.Action>
        <Switch defaultSelected aria-label="开启邮件通知">
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

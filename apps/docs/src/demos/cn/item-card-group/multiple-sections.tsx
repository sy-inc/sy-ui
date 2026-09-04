"use client";

import type {ReactNode} from "react";

import {Globe, Key, Moon, Person} from "@gravity-ui/icons";
import {Button, ItemCard, ItemCardGroup, PressableFeedback, Switch} from "@sy-inc/react";

function Item({
  action,
  description,
  icon,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <ItemCard>
      <ItemCard.Icon aria-hidden="true">{icon}</ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>{title}</ItemCard.Title>
        <ItemCard.Description>{description}</ItemCard.Description>
      </ItemCard.Content>
      {action ? <ItemCard.Action>{action}</ItemCard.Action> : null}
    </ItemCard>
  );
}

function PressableItem({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <ItemCard<"button">
      className="w-full text-start"
      render={({children, className, ref}) => (
        <PressableFeedback ref={ref} className={className}>
          <PressableFeedback.Highlight />
          <PressableFeedback.Ripple />
          {children}
        </PressableFeedback>
      )}
    >
      <ItemCard.Icon aria-hidden="true">{icon}</ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>{title}</ItemCard.Title>
        <ItemCard.Description>{description}</ItemCard.Description>
      </ItemCard.Content>
    </ItemCard>
  );
}

export function MultipleSections() {
  return (
    <div className="w-full max-w-lg space-y-6">
      <ItemCardGroup variant="transparent">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>账户</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <ItemCardGroup>
          <PressableItem
            description="更新你的个人信息"
            icon={<Person className="size-4" />}
            title="个人资料"
          />
          <PressableItem
            description="管理密码和两步验证"
            icon={<Key className="size-4" />}
            title="安全"
          />
        </ItemCardGroup>
      </ItemCardGroup>
      <ItemCardGroup variant="transparent">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>偏好设置</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <ItemCardGroup>
          <Item
            action={
              <Button size="sm" variant="outline">
                简体中文
              </Button>
            }
            description="选择你偏好的界面语言"
            icon={<Globe className="size-4" />}
            title="语言"
          />
          <Item
            action={
              <Switch aria-label="深色模式">
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            }
            description="在应用中使用深色主题"
            icon={<Moon className="size-4" />}
            title="深色模式"
          />
        </ItemCardGroup>
      </ItemCardGroup>
    </div>
  );
}

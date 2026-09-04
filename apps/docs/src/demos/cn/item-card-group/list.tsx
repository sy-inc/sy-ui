"use client";

import type {ReactNode} from "react";

import {Cloud, Globe, Key, Moon, Person} from "@gravity-ui/icons";
import {Button, ItemCard, ItemCardGroup, Separator, Switch} from "@sy-inc/react";

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

export function List() {
  return (
    <div className="w-full max-w-lg space-y-6">
      <ItemCardGroup aria-label="账户设置">
        <Item
          action={
            <Button size="sm" variant="outline">
              更新
            </Button>
          }
          description="更新你的个人信息"
          icon={<Person className="size-4" />}
          title="个人资料"
        />
        {/* 行之间会自动分隔；显式的 Separator 会替代自动分隔线。 */}
        <Separator />
        <Item description="管理密码和两步验证" icon={<Key className="size-4" />} title="安全" />
        <Item
          action={
            <Button size="sm" variant="outline">
              同步
            </Button>
          }
          description="在设备之间同步数据"
          icon={<Cloud className="size-4" />}
          title="云同步"
        />
      </ItemCardGroup>
      <ItemCardGroup>
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>常规</ItemCardGroup.Title>
          <ItemCardGroup.Description>管理基本账户设置</ItemCardGroup.Description>
        </ItemCardGroup.Header>
        <Item
          action={
            <Button size="sm" variant="outline">
              简体中文
            </Button>
          }
          description="选择你的界面语言"
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
          description="覆盖系统主题设置"
          icon={<Moon className="size-4" />}
          title="深色模式"
        />
      </ItemCardGroup>
    </div>
  );
}

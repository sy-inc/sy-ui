"use client";

import type {ReactNode} from "react";

import {ChevronRight, Cloud, Key, Person} from "@gravity-ui/icons";
import {ItemCard, ItemCardGroup, PressableFeedback} from "@sy-inc/react";

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
      <ItemCard.Action>
        <ChevronRight aria-hidden="true" className="size-4" />
      </ItemCard.Action>
    </ItemCard>
  );
}

export function Pressable() {
  return (
    <ItemCardGroup className="w-full max-w-lg">
      <ItemCardGroup.Header>
        <ItemCardGroup.Title>账户</ItemCardGroup.Title>
        <ItemCardGroup.Description>管理你的账户设置和偏好</ItemCardGroup.Description>
      </ItemCardGroup.Header>
      <PressableItem
        description="管理你的个人信息"
        icon={<Person className="size-4" />}
        title="个人资料"
      />
      <PressableItem
        description="管理密码和两步验证"
        icon={<Key className="size-4" />}
        title="安全"
      />
      <PressableItem
        description="在设备之间同步数据"
        icon={<Cloud className="size-4" />}
        title="云同步"
      />
    </ItemCardGroup>
  );
}

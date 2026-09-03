"use client";

import {ChevronRight, Key, Person} from "@gravity-ui/icons";
import {ItemCard, PressableFeedback} from "@sy-inc/react";

const ROWS = [
  {Icon: Person, description: "管理你的账户偏好设置", title: "账户设置"},
  {Icon: Key, description: "密码与两步验证", title: "安全"},
] as const;

export function Pressable() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {ROWS.map(({Icon, description, title}) => (
        <ItemCard<"button">
          key={title}
          className="text-start"
          render={({children, className, ref}) => (
            <PressableFeedback ref={ref} className={className}>
              <PressableFeedback.Highlight />
              <PressableFeedback.Ripple />
              {children}
            </PressableFeedback>
          )}
        >
          <ItemCard.Icon aria-hidden="true">
            <Icon className="size-4" />
          </ItemCard.Icon>
          <ItemCard.Content>
            <ItemCard.Title>{title}</ItemCard.Title>
            <ItemCard.Description>{description}</ItemCard.Description>
          </ItemCard.Content>
          <ItemCard.Action>
            <ChevronRight aria-hidden="true" className="size-4" />
          </ItemCard.Action>
        </ItemCard>
      ))}
    </div>
  );
}

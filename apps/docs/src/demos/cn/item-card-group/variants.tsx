"use client";

import type {ReactNode} from "react";

import {Bell, ChevronRight, Globe, Key, Moon, Palette} from "@gravity-ui/icons";
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

const variants = [
  {
    description: "带阴影的表面",
    first: {description: "更新你的个人信息", icon: <Globe className="size-4" />, title: "个人资料"},
    second: {description: "管理密码和两步验证", icon: <Key className="size-4" />, title: "安全"},
    title: "默认",
    variant: "default",
  },
  {
    description: "次级表面，无阴影",
    first: {
      description: "选择你偏好的界面语言",
      icon: <Palette className="size-4" />,
      title: "语言",
    },
    second: {description: "主题与颜色", icon: <Moon className="size-4" />, title: "外观"},
    title: "次级",
    variant: "secondary",
  },
  {
    description: "三级表面，无阴影",
    first: {description: "在设备之间同步数据", icon: <Globe className="size-4" />, title: "云同步"},
    second: {
      description: "在应用中使用深色主题",
      icon: <Moon className="size-4" />,
      title: "深色模式",
    },
    title: "三级",
    variant: "tertiary",
  },
  {
    description: "透明背景加边框，无阴影",
    first: {description: "管理已连接的设备", icon: <Key className="size-4" />, title: "设备"},
    second: {description: "控制你的数据和隐私", icon: <Globe className="size-4" />, title: "隐私"},
    title: "轮廓",
    variant: "outline",
  },
  {
    description: "无背景、无边框、无阴影",
    first: {description: "管理提醒偏好", icon: <Bell className="size-4" />, title: "通知"},
    second: {description: "设置地区与时区", icon: <Globe className="size-4" />, title: "地区"},
    title: "透明",
    variant: "transparent",
  },
] as const;

export function Variants() {
  return (
    <div className="w-full max-w-lg space-y-3">
      {variants.map(({description, first, second, title, variant}) => (
        <ItemCardGroup key={variant} variant={variant}>
          <ItemCardGroup.Header>
            <ItemCardGroup.Title>{title}</ItemCardGroup.Title>
            <ItemCardGroup.Description>{description}</ItemCardGroup.Description>
          </ItemCardGroup.Header>
          <PressableItem {...first} />
          <PressableItem {...second} />
        </ItemCardGroup>
      ))}
    </div>
  );
}

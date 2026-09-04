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
    description: "Surface background with shadow",
    first: {
      description: "Update your personal information",
      icon: <Globe className="size-4" />,
      title: "Profile",
    },
    second: {
      description: "Manage passwords and two-factor authentication",
      icon: <Key className="size-4" />,
      title: "Security",
    },
    title: "Default",
    variant: "default",
  },
  {
    description: "Secondary surface, no shadow",
    first: {
      description: "Choose your preferred language",
      icon: <Palette className="size-4" />,
      title: "Language",
    },
    second: {
      description: "Theme and colors",
      icon: <Moon className="size-4" />,
      title: "Appearance",
    },
    title: "Secondary",
    variant: "secondary",
  },
  {
    description: "Tertiary surface, no shadow",
    first: {
      description: "Sync data across your devices",
      icon: <Globe className="size-4" />,
      title: "Cloud sync",
    },
    second: {
      description: "Use dark theme across the app",
      icon: <Moon className="size-4" />,
      title: "Dark mode",
    },
    title: "Tertiary",
    variant: "tertiary",
  },
  {
    description: "Transparent with border, no shadow",
    first: {
      description: "Manage connected devices",
      icon: <Key className="size-4" />,
      title: "Devices",
    },
    second: {
      description: "Control your data and privacy",
      icon: <Globe className="size-4" />,
      title: "Privacy",
    },
    title: "Outline",
    variant: "outline",
  },
  {
    description: "No background, no border, no shadow",
    first: {
      description: "Manage alert preferences",
      icon: <Bell className="size-4" />,
      title: "Notifications",
    },
    second: {
      description: "Set your locale and timezone",
      icon: <Globe className="size-4" />,
      title: "Region",
    },
    title: "Transparent",
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

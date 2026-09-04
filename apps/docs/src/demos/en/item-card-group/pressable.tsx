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
        <ItemCardGroup.Title>Account</ItemCardGroup.Title>
        <ItemCardGroup.Description>
          Manage your account settings and preferences
        </ItemCardGroup.Description>
      </ItemCardGroup.Header>
      <PressableItem
        description="Manage your personal information"
        icon={<Person className="size-4" />}
        title="Profile"
      />
      <PressableItem
        description="Manage passwords and two-factor authentication"
        icon={<Key className="size-4" />}
        title="Security"
      />
      <PressableItem
        description="Sync data across your devices"
        icon={<Cloud className="size-4" />}
        title="Cloud sync"
      />
    </ItemCardGroup>
  );
}

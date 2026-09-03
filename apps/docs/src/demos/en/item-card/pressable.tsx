"use client";

import {ChevronRight, Key, Person} from "@gravity-ui/icons";
import {ItemCard, PressableFeedback} from "@sy-inc/react";

const ROWS = [
  {Icon: Person, description: "Manage your account preferences", title: "Account settings"},
  {Icon: Key, description: "Passwords and two-factor authentication", title: "Security"},
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

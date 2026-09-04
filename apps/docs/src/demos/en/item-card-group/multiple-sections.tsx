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
          <ItemCardGroup.Title>Account</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <ItemCardGroup>
          <PressableItem
            description="Update your personal information"
            icon={<Person className="size-4" />}
            title="Profile"
          />
          <PressableItem
            description="Manage passwords and two-factor authentication"
            icon={<Key className="size-4" />}
            title="Security"
          />
        </ItemCardGroup>
      </ItemCardGroup>
      <ItemCardGroup variant="transparent">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Preferences</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <ItemCardGroup>
          <Item
            action={
              <Button size="sm" variant="outline">
                English
              </Button>
            }
            description="Choose your preferred language"
            icon={<Globe className="size-4" />}
            title="Language"
          />
          <Item
            action={
              <Switch aria-label="Dark mode">
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            }
            description="Use dark theme across the app"
            icon={<Moon className="size-4" />}
            title="Dark mode"
          />
        </ItemCardGroup>
      </ItemCardGroup>
    </div>
  );
}

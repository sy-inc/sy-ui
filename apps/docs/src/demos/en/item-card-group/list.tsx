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
      <ItemCardGroup aria-label="Account settings">
        <Item
          action={
            <Button size="sm" variant="outline">
              Update
            </Button>
          }
          description="Update your personal information"
          icon={<Person className="size-4" />}
          title="Profile"
        />
        {/* Rows divide themselves; an explicit Separator replaces the automatic divider. */}
        <Separator />
        <Item
          description="Manage passwords and two-factor authentication"
          icon={<Key className="size-4" />}
          title="Security"
        />
        <Item
          action={
            <Button size="sm" variant="outline">
              Sync
            </Button>
          }
          description="Sync data across your devices"
          icon={<Cloud className="size-4" />}
          title="Cloud sync"
        />
      </ItemCardGroup>
      <ItemCardGroup>
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>General</ItemCardGroup.Title>
          <ItemCardGroup.Description>Manage your basic account settings</ItemCardGroup.Description>
        </ItemCardGroup.Header>
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
          description="Override the system theme"
          icon={<Moon className="size-4" />}
          title="Dark mode"
        />
      </ItemCardGroup>
    </div>
  );
}

import type {ReactNode} from "react";

import {Display, Globe, Key, Palette, Person, Smartphone} from "@gravity-ui/icons";
import {ItemCard, ItemCardGroup} from "@sy-inc/react";

function Item({description, icon, title}: {description: string; icon: ReactNode; title: string}) {
  return (
    <ItemCard>
      <ItemCard.Icon aria-hidden="true">{icon}</ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>{title}</ItemCard.Title>
        <ItemCard.Description>{description}</ItemCard.Description>
      </ItemCard.Content>
    </ItemCard>
  );
}

export function Grid() {
  return (
    <div className="w-full max-w-3xl space-y-6">
      <ItemCardGroup layout="grid">
        <Item
          description="Personal information"
          icon={<Person className="size-4" />}
          title="Profile"
        />
        <Item
          description="Two-factor authentication and passwords"
          icon={<Key className="size-4" />}
          title="Security"
        />
        <Item
          description="Choose your interface language"
          icon={<Globe className="size-4" />}
          title="Language"
        />
        <Item
          description="Theme and colors"
          icon={<Palette className="size-4" />}
          title="Appearance"
        />
      </ItemCardGroup>
      <ItemCardGroup columns={3} layout="grid">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Devices</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <Item description="Active now" icon={<Display className="size-4" />} title="MacBook Pro" />
        <Item description="3 days ago" icon={<Display className="size-4" />} title="iMac" />
        <Item description="1 hour ago" icon={<Person className="size-4" />} title="iPhone 15" />
        <Item
          description="Available everywhere"
          icon={<Smartphone className="size-4" />}
          title="Web"
        />
      </ItemCardGroup>
    </div>
  );
}

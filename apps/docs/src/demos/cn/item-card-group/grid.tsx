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
        <Item description="个人信息" icon={<Person className="size-4" />} title="个人资料" />
        <Item description="两步验证与密码" icon={<Key className="size-4" />} title="安全" />
        <Item description="选择界面语言" icon={<Globe className="size-4" />} title="语言" />
        <Item description="主题与颜色" icon={<Palette className="size-4" />} title="外观" />
      </ItemCardGroup>
      <ItemCardGroup columns={3} layout="grid">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>设备</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <Item description="当前活跃" icon={<Display className="size-4" />} title="MacBook Pro" />
        <Item description="3 天前" icon={<Display className="size-4" />} title="iMac" />
        <Item description="1 小时前" icon={<Person className="size-4" />} title="iPhone 15" />
        <Item description="随处可用" icon={<Smartphone className="size-4" />} title="Web" />
      </ItemCardGroup>
    </div>
  );
}

import {Bell, ChevronRight, Globe, Key, Moon, Palette} from "@gravity-ui/icons";
import {ItemCard} from "@sy-inc/react";

const VARIANTS = [
  {Icon: Globe, description: "带阴影的默认表面", title: "Default", variant: "default"},
  {Icon: Palette, description: "次级表面，无阴影", title: "Secondary", variant: "secondary"},
  {Icon: Moon, description: "三级表面，无阴影", title: "Tertiary", variant: "tertiary"},
  {Icon: Key, description: "透明背景加语义边框", title: "Outline", variant: "outline"},
  {Icon: Bell, description: "无背景、无边框、无阴影", title: "Transparent", variant: "transparent"},
] as const;

export function Variants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {VARIANTS.map(({Icon, description, title, variant}) => (
        <ItemCard key={variant} variant={variant}>
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

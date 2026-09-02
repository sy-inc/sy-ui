import {Bell, ChevronRight, Globe, Key, Moon, Palette} from "@gravity-ui/icons";
import {ItemCard} from "@sy-inc/react";

const VARIANTS = [
  {
    Icon: Globe,
    description: "Surface background with shadow",
    title: "Default",
    variant: "default",
  },
  {
    Icon: Palette,
    description: "Secondary surface, no shadow",
    title: "Secondary",
    variant: "secondary",
  },
  {Icon: Moon, description: "Tertiary surface, no shadow", title: "Tertiary", variant: "tertiary"},
  {
    Icon: Key,
    description: "Transparent with a semantic border",
    title: "Outline",
    variant: "outline",
  },
  {
    Icon: Bell,
    description: "No background, border, or shadow",
    title: "Transparent",
    variant: "transparent",
  },
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

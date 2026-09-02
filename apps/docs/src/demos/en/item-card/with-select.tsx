import {Globe} from "@gravity-ui/icons";
import {ItemCard, ListBox, Select} from "@sy-inc/react";

const LANGUAGES = [
  {id: "en", label: "English"},
  {id: "es", label: "Spanish"},
  {id: "fr", label: "French"},
  {id: "ja", label: "Japanese"},
] as const;

export function WithSelect() {
  return (
    <ItemCard className="w-full max-w-md">
      <ItemCard.Icon aria-hidden="true">
        <Globe className="size-4" />
      </ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>Language</ItemCard.Title>
        <ItemCard.Description>Choose your preferred language</ItemCard.Description>
      </ItemCard.Content>
      <ItemCard.Action>
        <Select aria-label="Language" className="w-auto" defaultSelectedKey="en">
          <Select.Trigger className="h-6 min-h-6 items-center gap-2 rounded-md border-0 bg-transparent py-0 ps-1 !pe-1 text-sm text-muted shadow-none">
            <Select.Value className="flex-none" />
            <Select.Indicator className="!static !size-4 shrink-0" />
          </Select.Trigger>
          <Select.Popover className="w-[94px]">
            <ListBox>
              {LANGUAGES.map(({id, label}) => (
                <ListBox.Item key={id} id={id} textValue={label}>
                  {label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </ItemCard.Action>
    </ItemCard>
  );
}

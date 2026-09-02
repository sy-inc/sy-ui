import {Globe} from "@gravity-ui/icons";
import {ItemCard, ListBox, Select} from "@sy-inc/react";

const LANGUAGES = [
  {id: "zh", label: "简体中文"},
  {id: "en", label: "English"},
  {id: "ja", label: "日本語"},
  {id: "ko", label: "한국어"},
] as const;

export function WithSelect() {
  return (
    <ItemCard className="w-full max-w-md">
      <ItemCard.Icon aria-hidden="true">
        <Globe className="size-4" />
      </ItemCard.Icon>
      <ItemCard.Content>
        <ItemCard.Title>语言</ItemCard.Title>
        <ItemCard.Description>选择你偏好的界面语言</ItemCard.Description>
      </ItemCard.Content>
      <ItemCard.Action>
        <Select aria-label="语言" className="w-auto" defaultSelectedKey="zh">
          <Select.Trigger className="h-6 min-h-6 items-center gap-2 rounded-md border-0 bg-transparent py-0 ps-1 !pe-1 text-sm text-muted shadow-none">
            <Select.Value className="flex-none" />
            <Select.Indicator className="!static !size-4 shrink-0" />
          </Select.Trigger>
          <Select.Popover className="w-[110px]">
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

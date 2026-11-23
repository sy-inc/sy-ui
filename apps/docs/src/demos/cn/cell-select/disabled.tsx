import {CellSelect, ListBox} from "@sy-inc/react";

export function Disabled() {
  return (
    <CellSelect isDisabled aria-label="主题" className="w-[252px]" defaultValue="default">
      <CellSelect.Trigger>
        <CellSelect.Label>主题</CellSelect.Label>
        <CellSelect.Value />
        <CellSelect.Indicator />
      </CellSelect.Trigger>
      <CellSelect.Popover>
        <ListBox>
          <ListBox.Item id="default" textValue="默认">
            默认
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dark" textValue="深色">
            深色
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="system" textValue="跟随系统">
            跟随系统
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </CellSelect.Popover>
    </CellSelect>
  );
}

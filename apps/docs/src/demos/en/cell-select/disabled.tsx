import {CellSelect, ListBox} from "@sy-inc/react";

export function Disabled() {
  return (
    <CellSelect isDisabled aria-label="Theme" className="w-[252px]" defaultValue="default">
      <CellSelect.Trigger>
        <CellSelect.Label>Theme</CellSelect.Label>
        <CellSelect.Value />
        <CellSelect.Indicator />
      </CellSelect.Trigger>
      <CellSelect.Popover>
        <ListBox>
          <ListBox.Item id="default" textValue="Default">
            Default
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dark" textValue="Dark">
            Dark
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="system" textValue="System">
            System
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </CellSelect.Popover>
    </CellSelect>
  );
}

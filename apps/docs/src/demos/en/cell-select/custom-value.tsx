"use client";

import {Icon} from "@iconify/react";
import {CellSelect, ListBox} from "@sy-inc/react";

const iconSets = [
  {icon: "gravity-ui:face-fun", id: "gravity", label: "Gravity"},
  {icon: "gravity-ui:palette", id: "heroicons", label: "Heroicons"},
  {icon: "gravity-ui:planet-earth", id: "lucide", label: "Lucide"},
];

export function CustomValue() {
  return (
    <CellSelect aria-label="Icons" className="w-[252px]" defaultValue="gravity">
      <CellSelect.Trigger>
        <CellSelect.Label>Icons</CellSelect.Label>
        <CellSelect.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            const selected = iconSets.find((set) => set.id === state.selectedItems[0]?.key);

            if (isPlaceholder || !selected) return defaultChildren;

            return (
              <span className="inline-flex items-center gap-1">
                {selected.label}
                <Icon icon={selected.icon} />
              </span>
            );
          }}
        </CellSelect.Value>
        <CellSelect.Indicator />
      </CellSelect.Trigger>
      <CellSelect.Popover>
        <ListBox>
          {iconSets.map((set) => (
            <ListBox.Item key={set.id} id={set.id} textValue={set.label}>
              <span className="inline-flex items-center gap-1">
                <Icon icon={set.icon} />
                {set.label}
              </span>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </CellSelect.Popover>
    </CellSelect>
  );
}

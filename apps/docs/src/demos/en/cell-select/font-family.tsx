"use client";

import {CellSelect, ListBox} from "@sy-inc/react";

const fonts = [
  {id: "inter", label: "Inter"},
  {id: "roboto", label: "Roboto"},
  {id: "system", label: "System"},
  {id: "georgia", label: "Georgia"},
];

interface FontCellProps {
  label: string;
  variant?: "default" | "secondary";
}

/** No indicator: the trailing "Ag" sample marks the cell as a font picker. */
const FontCell = ({label, variant}: FontCellProps) => (
  <CellSelect aria-label={label} className="w-[252px]" defaultValue="inter" variant={variant}>
    <CellSelect.Trigger>
      <CellSelect.Label>{label}</CellSelect.Label>
      <CellSelect.Value>
        {({defaultChildren, isPlaceholder, state}) => {
          const selected = fonts.find((font) => font.id === state.selectedItems[0]?.key);

          if (isPlaceholder || !selected) return defaultChildren;

          return (
            <span className="inline-flex items-center gap-1">
              {selected.label}
              <span aria-hidden="true">Ag</span>
            </span>
          );
        }}
      </CellSelect.Value>
    </CellSelect.Trigger>
    <CellSelect.Popover>
      <ListBox>
        {fonts.map((font) => (
          <ListBox.Item key={font.id} id={font.id} textValue={font.label}>
            {font.label}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </CellSelect.Popover>
  </CellSelect>
);

export function FontFamily() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">Font Family</p>
      <FontCell label="Heading" />
      <FontCell label="Body" variant="secondary" />
    </div>
  );
}

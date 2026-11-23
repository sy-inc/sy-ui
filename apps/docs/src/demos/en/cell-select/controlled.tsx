"use client";

import type {Key} from "@sy-inc/react";

import {CellSelect, ListBox} from "@sy-inc/react";
import {useState} from "react";

const themes = [
  {id: "default", label: "Default"},
  {id: "dark", label: "Dark"},
  {id: "system", label: "System"},
];

export function Controlled() {
  const [value, setValue] = useState<Key | null>("default");
  const selected = themes.find((theme) => theme.id === value);

  return (
    <div className="flex flex-col gap-2">
      <CellSelect
        aria-label="Theme"
        className="w-[252px]"
        value={value}
        onChange={(key) => setValue(key)}
      >
        <CellSelect.Trigger>
          <CellSelect.Label>Theme</CellSelect.Label>
          <CellSelect.Value />
          <CellSelect.Indicator />
        </CellSelect.Trigger>
        <CellSelect.Popover>
          <ListBox>
            {themes.map((theme) => (
              <ListBox.Item key={theme.id} id={theme.id} textValue={theme.label}>
                {theme.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </CellSelect.Popover>
      </CellSelect>
      <p className="text-sm text-muted">Selected: {selected?.label ?? "None"}</p>
    </div>
  );
}

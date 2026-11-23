import {CellSelect, ListBox} from "@sy-inc/react";

const themes = [
  {id: "default", label: "Default"},
  {id: "dark", label: "Dark"},
  {id: "system", label: "System"},
];

const languages = [
  {id: "english", label: "English"},
  {id: "spanish", label: "Spanish"},
  {id: "french", label: "French"},
];

const fontSizes = [
  {id: "small", label: "Small"},
  {id: "medium", label: "Medium"},
  {id: "large", label: "Large"},
];

interface SettingCellProps {
  defaultValue: string;
  label: string;
  options: {id: string; label: string}[];
  variant?: "default" | "secondary";
}

const SettingCell = ({defaultValue, label, options, variant}: SettingCellProps) => (
  <CellSelect
    aria-label={label}
    className="w-[252px]"
    defaultValue={defaultValue}
    variant={variant}
  >
    <CellSelect.Trigger>
      <CellSelect.Label>{label}</CellSelect.Label>
      <CellSelect.Value />
      <CellSelect.Indicator />
    </CellSelect.Trigger>
    <CellSelect.Popover>
      <ListBox>
        {options.map((option) => (
          <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
            {option.label}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </CellSelect.Popover>
  </CellSelect>
);

export function SettingsGroup() {
  return (
    <div className="flex flex-col gap-2">
      <SettingCell defaultValue="default" label="Theme" options={themes} />
      <SettingCell defaultValue="english" label="Language" options={languages} />
      <SettingCell defaultValue="medium" label="Font size" options={fontSizes} />
    </div>
  );
}

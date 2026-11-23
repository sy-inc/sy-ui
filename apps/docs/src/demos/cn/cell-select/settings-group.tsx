import {CellSelect, ListBox} from "@sy-inc/react";

const themes = [
  {id: "default", label: "默认"},
  {id: "dark", label: "深色"},
  {id: "system", label: "跟随系统"},
];

const languages = [
  {id: "english", label: "英语"},
  {id: "spanish", label: "西班牙语"},
  {id: "french", label: "法语"},
];

const fontSizes = [
  {id: "small", label: "小"},
  {id: "medium", label: "中"},
  {id: "large", label: "大"},
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
      <SettingCell defaultValue="default" label="主题" options={themes} />
      <SettingCell defaultValue="english" label="语言" options={languages} />
      <SettingCell defaultValue="medium" label="字号" options={fontSizes} />
    </div>
  );
}

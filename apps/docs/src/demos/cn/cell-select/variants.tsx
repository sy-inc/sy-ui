import {CellSelect, ListBox} from "@sy-inc/react";

const themes = [
  {id: "default", label: "默认"},
  {id: "dark", label: "深色"},
  {id: "system", label: "跟随系统"},
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

export function Variants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted">default</p>
        <SettingCell defaultValue="default" label="主题" options={themes} variant="default" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted">secondary</p>
        <SettingCell defaultValue="default" label="主题" options={themes} variant="secondary" />
      </div>
    </div>
  );
}

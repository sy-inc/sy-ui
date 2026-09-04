import type {Meta, StoryObj} from "@storybook/react";

import {useState} from "react";
import {Icon} from "@iconify/react";

import {ListBox} from "../list-box";

import {CellSelect} from "./index";

const themeOptions = [
  ["default", "Default"],
  ["dark", "Dark"],
  ["system", "System"],
] as const;
const iconOptions = [
  ["gravity", "Gravity", "gravity-ui:face-fun"],
  ["heroicons", "Heroicons", "gravity-ui:palette"],
  ["lucide", "Lucide", "gravity-ui:planet-earth"],
] as const;
const fontOptions = [
  ["inter", "Inter"],
  ["roboto", "Roboto"],
  ["system", "System"],
  ["georgia", "Georgia"],
] as const;
const languageOptions = [
  ["english", "English"],
  ["spanish", "Spanish"],
  ["french", "French"],
] as const;
const fontSizeOptions = [
  ["small", "Small"],
  ["medium", "Medium"],
  ["large", "Large"],
] as const;

type StoryOption = readonly [string, string] | readonly [string, string, string];
type StoryOptions = readonly StoryOption[];
const Options = ({items = themeOptions}: {items?: StoryOptions}) => (
  <ListBox>
    {items.map(([id, label, icon]) => (
      <ListBox.Item key={id} id={id} textValue={label}>
        <span className="inline-flex items-center gap-1">
          {icon ? <Icon icon={icon} /> : null}
          {label}
        </span>
        <ListBox.ItemIndicator />
      </ListBox.Item>
    ))}
  </ListBox>
);
const SelectedValue = ({items, badge = false}: {items: StoryOptions; badge?: boolean}) => (
  <CellSelect.Value>
    {({defaultChildren, isPlaceholder, state}) => {
      const item = items.find(([id]) => id === state.selectedItems[0]?.key);
      if (isPlaceholder || !item) return defaultChildren;
      const icon = item.length === 3 ? item[2] : undefined;
      return (
        <span className="inline-flex items-center gap-1">
          {item[1]}
          {badge ? <span aria-hidden="true">Ag</span> : icon ? <Icon icon={icon} /> : null}
        </span>
      );
    }}
  </CellSelect.Value>
);

const Cell = ({
  label = "Theme",
  items,
  omitIndicator,
  valueBadge,
  ...props
}: Omit<React.ComponentProps<typeof CellSelect>, "children"> & {
  label?: string;
  items?: StoryOptions;
  omitIndicator?: boolean;
  valueBadge?: boolean;
}) => (
  <CellSelect {...props} aria-label={label} className="w-[252px]">
    <CellSelect.Trigger>
      <CellSelect.Label>{label}</CellSelect.Label>
      <SelectedValue badge={valueBadge} items={items ?? themeOptions} />
      {omitIndicator ? null : <CellSelect.Indicator />}
    </CellSelect.Trigger>
    <CellSelect.Popover>
      <Options items={items} />
    </CellSelect.Popover>
  </CellSelect>
);

const meta: Meta<typeof CellSelect> = {
  title: "Components/CellSelect",
  component: CellSelect.Root,
  parameters: {layout: "centered"},
  decorators: [
    (Story) => (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CellSelect>;

export const Usage: Story = {render: () => <Cell defaultValue="default" />};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("default");
    return (
      <div className="flex flex-col gap-2">
        <Cell value={value} onChange={(key) => setValue(String(key))} />
        <p className="text-sm text-muted">
          Selected: {themeOptions.find(([id]) => id === value)?.[1] ?? value}
        </p>
      </div>
    );
  },
};

export const CustomValue: Story = {
  render: () => (
    <CellSelect aria-label="Icons" className="w-[252px]" defaultValue="gravity">
      <CellSelect.Trigger>
        <CellSelect.Label>Icons</CellSelect.Label>
        <SelectedValue items={iconOptions} />
        <CellSelect.Indicator />
      </CellSelect.Trigger>
      <CellSelect.Popover>
        <Options items={iconOptions} />
      </CellSelect.Popover>
    </CellSelect>
  ),
};

export const Disabled: Story = {render: () => <Cell defaultValue="default" isDisabled />};

export const FontFamily: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">Font Family</p>
      <Cell defaultValue="inter" items={fontOptions} label="Heading" omitIndicator valueBadge />
      <Cell
        defaultValue="inter"
        items={fontOptions}
        label="Body"
        omitIndicator
        valueBadge
        variant="secondary"
      />
    </div>
  ),
};

export const SettingsGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Cell defaultValue="default" label="Theme" />
      <Cell defaultValue="english" items={languageOptions} label="Language" />
      <Cell defaultValue="medium" items={fontSizeOptions} label="Font size" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-muted">default</p>
        <Cell defaultValue="default" variant="default" label="Theme" />
      </div>
      <div>
        <p className="text-xs text-muted">secondary</p>
        <Cell defaultValue="default" variant="secondary" label="Theme" />
      </div>
    </div>
  ),
};

import type {Meta, StoryObj} from "@storybook/react";

import React from "react";

import {CellSlider} from "./index";

/** Shared 0–1 setup: every example only differs by label, value and variant. */
const ratio = {
  defaultValue: 0.5,
  formatOptions: {maximumFractionDigits: 2, minimumFractionDigits: 2},
  maxValue: 1,
  minValue: 0,
  step: 0.01,
} as const;

const meta: Meta<typeof CellSlider> = {
  component: CellSlider,
  decorators: [
    (Story) => (
      <div
        style={{alignItems: "center", display: "flex", height: "100vh", justifyContent: "center"}}
      >
        <div className="w-[252px]">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  title: "Components/CellSlider",
};

export default meta;

type Story = StoryObj<typeof CellSlider>;

export const Default: Story = {
  render: (args) => <CellSlider label="Spacing" {...ratio} {...args} />,
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-muted">default</span>
      <CellSlider label="Spacing" {...ratio} />
      <span className="text-sm text-muted">secondary</span>
      <CellSlider label="Spacing" variant="secondary" {...ratio} />
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledCellSlider() {
    const [value, setValue] = React.useState(0.5);

    return (
      <div className="flex flex-col gap-2">
        <CellSlider {...ratio} label="Spacing" value={value} onChange={setValue} />
        <span className="text-sm text-muted">Value: {value.toFixed(2)}</span>
      </div>
    );
  },
};

export const SettingsGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-muted">Density</span>
      <CellSlider label="Spacing" {...ratio} />
      <CellSlider label="Font Size" {...ratio} defaultValue={0.3} />
      <span className="text-sm text-muted">Corners</span>
      <CellSlider label="General Radius" {...ratio} />
      <CellSlider label="Forms Radius" {...ratio} defaultValue={0.3} />
    </div>
  ),
};

export const SecondaryGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <CellSlider label="Spacing" variant="secondary" {...ratio} />
      <CellSlider label="Font Size" variant="secondary" {...ratio} defaultValue={0.3} />
    </div>
  ),
};

export const IntegerStep: Story = {
  render: () => (
    <CellSlider defaultValue={75} label="Volume" maxValue={100} minValue={0} step={1} />
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <CellSlider isDisabled label="Spacing" {...ratio} />
      <CellSlider isDisabled label="Font Size" {...ratio} defaultValue={0.3} />
    </div>
  ),
};

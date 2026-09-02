import type {Meta, StoryObj} from "@storybook/react";

import React from "react";

import {CellSwitch} from "./cell-switch";

const meta = {
  component: CellSwitch,
  title: "Components/CellSwitch",
} satisfies Meta<typeof CellSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Animations",
    defaultSelected: true,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <CellSwitch defaultSelected>Default</CellSwitch>
      <CellSwitch defaultSelected variant="secondary">
        Secondary
      </CellSwitch>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledCellSwitch() {
    const [isSelected, setIsSelected] = React.useState(true);

    return (
      <div className="flex flex-col gap-2">
        <CellSwitch isSelected={isSelected} onChange={setIsSelected}>
          Animations
        </CellSwitch>
        <span className="text-sm text-muted">Animations: {isSelected ? "On" : "Off"}</span>
      </div>
    );
  },
};

export const SettingsGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <CellSwitch defaultSelected>Animations</CellSwitch>
      <CellSwitch>Sounds</CellSwitch>
      <CellSwitch defaultSelected>Haptics</CellSwitch>
    </div>
  ),
};

export const SecondaryGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <CellSwitch defaultSelected variant="secondary">
        Notifications
      </CellSwitch>
      <CellSwitch variant="secondary">Marketing emails</CellSwitch>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <CellSwitch defaultSelected isDisabled>
        Enabled
      </CellSwitch>
      <CellSwitch isDisabled>Disabled</CellSwitch>
    </div>
  ),
};

export const FeatureAnnouncement: Story = {
  render: () => (
    <CellSwitch
      badge="New"
      description="Keep your pages, meetings, and AI within reach."
      variant="feature"
    >
      Try the new sidebar
    </CellSwitch>
  ),
};

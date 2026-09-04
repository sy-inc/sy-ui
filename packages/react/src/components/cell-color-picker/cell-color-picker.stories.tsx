import type {Meta, StoryObj} from "@storybook/react";

import React from "react";
import {parseColor} from "react-aria-components";

import {ColorArea} from "../color-area";
import {ColorSlider} from "../color-slider";
import {ColorSwatchPicker} from "../color-swatch-picker";
import {Separator} from "../separator";

import {CellColorPicker} from "./index";

const presets = ["#3B82F6", "#22C55E", "#EF4444"];

type PickerProps = React.ComponentProps<typeof CellColorPicker> & {
  label?: string;
  triggerProps?: React.ComponentProps<typeof CellColorPicker.Trigger>;
  withPresets?: boolean;
};

const Picker = ({label = "Accent", triggerProps, withPresets, ...props}: PickerProps) => (
  <CellColorPicker {...props}>
    <CellColorPicker.Trigger {...triggerProps}>
      <CellColorPicker.Label>{label}</CellColorPicker.Label>
      <CellColorPicker.ValueDisplay />
      <CellColorPicker.Swatch />
    </CellColorPicker.Trigger>
    <CellColorPicker.Popover>
      <ColorArea
        aria-label="Color area"
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
      >
        <ColorArea.Thumb />
      </ColorArea>
      <ColorSlider aria-label="Hue" channel="hue" colorSpace="hsb">
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </ColorSlider>
      {withPresets ? (
        <>
          <Separator />
          <ColorSwatchPicker aria-label="Presets" size="xs">
            {presets.map((color) => (
              <ColorSwatchPicker.Item color={color} key={color}>
                <ColorSwatchPicker.Swatch />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>
        </>
      ) : null}
    </CellColorPicker.Popover>
  </CellColorPicker>
);

const meta: Meta<typeof CellColorPicker> = {
  component: CellColorPicker,
  parameters: {layout: "centered"},
  tags: ["autodocs"],
  title: "Components/CellColorPicker",
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-63">
      <Picker defaultValue="#3B82F6" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <span>default</span>
        <div className="w-63">
          <Picker defaultValue="#3B82F6" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span>secondary</span>
        <div className="w-63">
          <Picker defaultValue="#3B82F6" variant="secondary" />
        </div>
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = React.useState(parseColor("#3B82F6"));

    return (
      <div className="flex w-63 flex-col gap-2">
        <Picker value={value} onChange={setValue} />
        <p>Selected: {value.toString("hex")}</p>
      </div>
    );
  },
};

export const WithPresets: Story = {
  render: () => (
    <div className="w-63">
      <Picker defaultValue="#3B82F6" label="Brand Color" withPresets />
    </div>
  ),
};

export const SettingsGroup: Story = {
  render: () => (
    <div className="flex w-63 flex-col gap-2">
      <Picker defaultValue="#3B82F6" />
      <Picker defaultValue="#22C55E" label="Success" />
      <Picker defaultValue="#EF4444" label="Danger" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-63">
      <Picker defaultValue="#3B82F6" isDisabled />
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="w-63">
      <Picker defaultValue="#EF4444" isInvalid triggerProps={{"aria-describedby": "color-error"}} />
      <p id="color-error" role="alert">
        Choose an accessible brand color.
      </p>
    </div>
  ),
};

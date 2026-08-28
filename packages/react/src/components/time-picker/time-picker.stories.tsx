import type {Meta, StoryObj} from "@storybook/react";

import {TimePicker} from "./time-picker";

const meta: Meta<typeof TimePicker> = {
  title: "Components/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  args: {
    children: "TimePicker Component",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TimePicker variant="default">Default</TimePicker>
      <TimePicker variant="primary">Primary</TimePicker>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <TimePicker size="sm">Small</TimePicker>
      <TimePicker size="md">Medium</TimePicker>
      <TimePicker size="lg">Large</TimePicker>
    </div>
  ),
};

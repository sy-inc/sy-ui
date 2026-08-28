import type {Meta, StoryObj} from "@storybook/react";

import {Time} from "@internationalized/date";
import {useState} from "react";

import {TimePicker} from "./time-picker";

const meta: Meta<typeof TimePicker> = {
  title: "Components/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  args: {defaultValue: new Time(9, 30)},
};

export const WithSeconds: Story = {
  render: () => {
    const [result, setResult] = useState("14:35:20");

    return (
      <div className="flex flex-col gap-4">
        <TimePicker
          defaultValue={new Time(14, 35, 20)}
          granularity="second"
          onChange={(value) => setResult(value.toString())}
        />
        <output className="text-muted-foreground text-sm">Selected: {result}</output>
      </div>
    );
  },
};

export const CustomStyle: Story = {
  render: () => (
    <TimePicker className="rounded-xl bg-muted/40 p-2" defaultValue={new Time(14, 35)} />
  ),
};

export const Disabled: Story = {
  args: {defaultValue: new Time(9, 30), isDisabled: true},
};

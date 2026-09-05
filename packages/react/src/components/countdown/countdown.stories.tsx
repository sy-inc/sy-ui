import type {CountdownProps} from "./index";
import type {Meta, StoryObj} from "@storybook/react";

import {useState} from "react";

import {Button} from "../button";

import {Countdown} from "./index";

const meta = {
  title: "Components/Countdown",
  component: Countdown,
  parameters: {layout: "centered"},
  argTypes: {
    size: {control: "select", options: ["sm", "md", "lg"]},
    animation: {control: "select", options: ["slide", "none"]},
    endDate: {control: false},
  },
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

function SevenDaysExample(props: CountdownProps) {
  const [endDate] = useState(() => Date.now() + 7 * 24 * 60 * 60 * 1000);

  return <Countdown {...props} endDate={endDate} />;
}

export const SevenDays: Story = {
  name: "7 Days",
  args: {endDate: 0, size: "lg"},
  render: (args) => <SevenDaysExample {...args} />,
};

function SizesExample() {
  const [endDate] = useState(() => Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="flex flex-col items-center gap-8">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Countdown key={size} endDate={endDate} size={size} />
      ))}
    </div>
  );
}

export const Sizes: Story = {args: {endDate: 0}, render: () => <SizesExample />};
export const WithoutAnimation: Story = {
  args: {endDate: 0, animation: "none"},
  render: (args) => <SevenDaysExample {...args} />,
};
export const ChineseLabels: Story = {
  args: {
    endDate: 0,
    "aria-label": "倒计时",
    labels: {days: "天", hours: "时", minutes: "分", seconds: "秒"},
  },
  render: (args) => <SevenDaysExample {...args} />,
};

function CompletionExample() {
  const [endDate, setEndDate] = useState(() => Date.now() + 10_000);
  const [completed, setCompleted] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <Countdown
        completionContent="Time is up"
        endDate={endDate}
        onComplete={() => setCompleted(true)}
      />
      <span role="status">
        {completed ? "Countdown completed." : "Ten-second countdown running."}
      </span>
      <Button
        onPress={() => {
          setCompleted(false);
          setEndDate(Date.now() + 10_000);
        }}
      >
        Restart
      </Button>
    </div>
  );
}

export const Completion: Story = {args: {endDate: 0}, render: () => <CompletionExample />};

import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import React from "react";

import {Card} from "../card";

import {PressableFeedback} from "./index";

const meta: Meta<typeof PressableFeedback> = {
  component: PressableFeedback,
  parameters: {layout: "centered"},
  tags: ["autodocs"],
  title: "Components/PressableFeedback",
};

export default meta;

type Story = StoryObj<typeof PressableFeedback>;

const surface = "min-w-40 rounded-lg bg-default px-4 py-3 text-sm font-medium text-foreground";

export const Default: Story = {
  render: () => (
    <PressableFeedback className={surface}>
      <PressableFeedback.Highlight />
      <PressableFeedback.Ripple />
      Press me
    </PressableFeedback>
  ),
};

export const Comparison: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <PressableFeedback className={surface}>Nothing</PressableFeedback>
      <PressableFeedback className={surface}>
        <PressableFeedback.Highlight />
        Highlight
      </PressableFeedback>
      <PressableFeedback className={surface}>
        <PressableFeedback.Ripple />
        Ripple
      </PressableFeedback>
      <PressableFeedback className={surface}>
        <PressableFeedback.Highlight />
        <PressableFeedback.Ripple />
        Both
      </PressableFeedback>
    </div>
  ),
};

export const WithHighlight: Story = {
  render: () => (
    <PressableFeedback className={surface}>
      <PressableFeedback.Highlight />
      Highlight only
    </PressableFeedback>
  ),
};

export const WithRipple: Story = {
  render: () => (
    <PressableFeedback className={surface}>
      <PressableFeedback.Ripple />
      Ripple only
    </PressableFeedback>
  ),
};

export const Disabled: Story = {
  render: () => (
    <PressableFeedback isDisabled className={surface}>
      <PressableFeedback.Highlight />
      <PressableFeedback.Ripple />
      Disabled
    </PressableFeedback>
  ),
};

export const WithScale: Story = {
  render: () => (
    <PressableFeedback>
      <PressableFeedback.Scale className={surface}>
        <PressableFeedback.Highlight />
        Scale on press
      </PressableFeedback.Scale>
    </PressableFeedback>
  ),
};

export const HoldToConfirm: Story = {
  render: function HoldToConfirmStory() {
    const [count, setCount] = React.useState(0);

    return (
      <div className="flex flex-col items-center gap-3">
        <PressableFeedback className={`${surface} text-danger-foreground`}>
          <PressableFeedback.Highlight />
          <PressableFeedback.Progress
            className="bg-danger text-danger-foreground"
            onComplete={() => setCount((value) => value + 1)}
          >
            Hold to delete
          </PressableFeedback.Progress>
          Hold to delete
        </PressableFeedback>
        <span className="text-sm text-muted">Confirmed {count} times</span>
      </div>
    );
  },
};

export const ProgressDurations: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {[600, 1200, 2400].map((duration) => (
        <PressableFeedback key={duration} className={surface}>
          <PressableFeedback.Highlight />
          <PressableFeedback.Progress
            cancelOnRelease={false}
            className="bg-accent text-accent-foreground"
            duration={duration}
          >
            {duration}ms
          </PressableFeedback.Progress>
          {duration}ms
        </PressableFeedback>
      ))}
    </div>
  ),
};

export const ProgressSweep: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["right", "left", "up", "down"] as const).map((sweep) => (
        <PressableFeedback key={sweep} className={surface}>
          <PressableFeedback.Highlight />
          <PressableFeedback.Progress
            cancelOnRelease={false}
            className="bg-accent text-accent-foreground"
            duration={1200}
            sweep={sweep}
          >
            {sweep}
          </PressableFeedback.Progress>
          {sweep}
        </PressableFeedback>
      ))}
    </div>
  ),
};

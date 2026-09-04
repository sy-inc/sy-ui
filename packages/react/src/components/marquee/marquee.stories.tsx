import type {Meta, StoryObj} from "@storybook/react";

import {Marquee} from ".";

const itemClassName =
  "shrink-0 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent-soft-foreground";

const meta: Meta<typeof Marquee> = {
  args: {
    autoFill: false,
    delay: 0,
    direction: "left",
    gap: 16,
    gradient: false,
    pauseOnInteraction: false,
    play: true,
    speed: 50,
  },
  argTypes: {
    direction: {
      control: "select",
      options: ["left", "right", "up", "down"],
    },
  },
  component: Marquee,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Utilities/Marquee",
};

export default meta;

type Story = StoryObj<typeof Marquee>;

export const Default: Story = {
  render: (args) => (
    <Marquee className="w-96" {...args}>
      {Array.from({length: 20}, (_, index) => (
        <span key={index} className={itemClassName}>
          SY INC {index + 1}
        </span>
      ))}
    </Marquee>
  ),
};

export const Directions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      {(["left", "right", "up", "down"] as const).map((direction) => (
        <Marquee
          key={direction}
          className={direction === "left" || direction === "right" ? "w-72" : "h-48"}
          direction={direction}
        >
          {Array.from({length: 4}, (_, index) => (
            <span key={index} className={itemClassName}>
              {direction} {index + 1}
            </span>
          ))}
        </Marquee>
      ))}
    </div>
  ),
};

export const PauseOnHover: Story = {
  render: () => (
    <Marquee pauseOnInteraction className="w-96">
      {Array.from({length: 5}, (_, index) => (
        <span key={index} className={itemClassName}>
          Hover to pause {index + 1}
        </span>
      ))}
    </Marquee>
  ),
};

export const AutoFill: Story = {
  render: () => (
    <Marquee autoFill className="w-96" gap={24}>
      <span className={itemClassName}>Short sequence</span>
    </Marquee>
  ),
};

export const Gradient: Story = {
  render: () => (
    <Marquee autoFill gradient className="w-96" style={{"--marquee-gradient-width": "20%"}}>
      {Array.from({length: 3}, (_, index) => (
        <span key={index} className={itemClassName}>
          Gradient {index + 1}
        </span>
      ))}
    </Marquee>
  ),
};

/** Anything the props do not cover is reachable through the `--marquee-*` custom properties. */
export const CustomProperties: Story = {
  render: () => (
    <Marquee className="w-96" style={{"--marquee-duration": "4s", "--marquee-iterations": "3"}}>
      {Array.from({length: 5}, (_, index) => (
        <span key={index} className={itemClassName}>
          Three cycles {index + 1}
        </span>
      ))}
    </Marquee>
  ),
};

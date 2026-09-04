import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";

import {Marquee} from ".";

const itemClassName =
  "shrink-0 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent-soft-foreground";

const meta: Meta<typeof Marquee.Content> = {
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
  component: Marquee.Content,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Utilities/Marquee",
};

export default meta;

type Story = StoryObj<typeof Marquee.Content>;

export const Default: Story = {
  render: (args) => (
    <Marquee className="w-96">
      <Marquee.Content {...args}>
        {Array.from({length: 20}, (_, index) => (
          <span key={index} className={itemClassName}>
            SY INC {index + 1}
          </span>
        ))}
      </Marquee.Content>
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
        >
          <Marquee.Content direction={direction}>
            {Array.from({length: 4}, (_, index) => (
              <span key={index} className={itemClassName}>
                {direction} {index + 1}
              </span>
            ))}
          </Marquee.Content>
        </Marquee>
      ))}
    </div>
  ),
};

/** Prefix and suffix stay pinned and readable while the content scrolls between them. */
export const Adornments: Story = {
  render: () => (
    <Marquee className="border-default-200 h-8 w-96 rounded-md border">
      <Marquee.Prefix className="px-2 text-base text-danger">
        <Icon icon="gravity-ui:megaphone" />
      </Marquee.Prefix>
      <Marquee.Content gradient pauseOnInteraction className="text-sm text-danger">
        <span>Scheduled maintenance starts at 02:00 UTC and lasts about thirty minutes.</span>
      </Marquee.Content>
      <Marquee.Suffix>
        <a
          aria-label="Notice details"
          className="text-default-500 hover:text-default-700 px-2"
          href="#notice"
        >
          <Icon icon="gravity-ui:circle-info" />
        </a>
      </Marquee.Suffix>
    </Marquee>
  ),
};

export const PauseOnHover: Story = {
  render: () => (
    <Marquee className="w-96">
      <Marquee.Content pauseOnInteraction>
        {Array.from({length: 5}, (_, index) => (
          <span key={index} className={itemClassName}>
            Hover to pause {index + 1}
          </span>
        ))}
      </Marquee.Content>
    </Marquee>
  ),
};

export const AutoFill: Story = {
  render: () => (
    <Marquee className="w-96">
      <Marquee.Content autoFill gap={24}>
        <span className={itemClassName}>Short sequence</span>
      </Marquee.Content>
    </Marquee>
  ),
};

export const Gradient: Story = {
  render: () => (
    <Marquee className="w-96">
      <Marquee.Content autoFill gradient style={{"--marquee-gradient-width": "20%"}}>
        {Array.from({length: 3}, (_, index) => (
          <span key={index} className={itemClassName}>
            Gradient {index + 1}
          </span>
        ))}
      </Marquee.Content>
    </Marquee>
  ),
};

/** Anything the props do not cover is reachable through the `--marquee-*` custom properties. */
export const CustomProperties: Story = {
  render: () => (
    <Marquee className="w-96">
      <Marquee.Content style={{"--marquee-duration": "4s", "--marquee-iterations": "3"}}>
        {Array.from({length: 5}, (_, index) => (
          <span key={index} className={itemClassName}>
            Three cycles {index + 1}
          </span>
        ))}
      </Marquee.Content>
    </Marquee>
  ),
};

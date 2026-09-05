import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import React, {useState} from "react";

import {Label} from "../label";

import {Rating} from "./index";

const values = [1, 2, 3, 4, 5];

const Items = ({children}: {children?: React.ReactNode}) => (
  <>
    {values.map((value) => (
      <Rating.Item key={value} value={value}>
        {children}
      </Rating.Item>
    ))}
  </>
);

const meta: Meta<typeof Rating> = {
  component: Rating,
  decorators: [
    (Story) => (
      <div className="flex h-[calc(100vh-32px)] items-center justify-center">
        <Story />
      </div>
    ),
  ],
  parameters: {layout: "centered"},
  title: "Components/Feedback/Rating",
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  render: () => (
    <Rating aria-label="Rating" defaultValue={3}>
      <Items />
    </Rating>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <span className="text-xs leading-4 text-muted">{size}</span>
          <Rating aria-label={`${size} rating`} defaultValue={3} size={size}>
            <Items />
          </Rating>
        </div>
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(3);

    return (
      <div className="flex flex-col items-center gap-3">
        <Rating aria-label="Rating" value={value} onValueChange={setValue}>
          <Items />
        </Rating>
        <span className="text-sm text-muted">{value} stars</span>
      </div>
    );
  },
};

export const ReadOnly: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[1.5, 2.3, 3.7, 4.2, 4.8].map((value) => (
        <div key={value} className="flex items-center gap-3">
          <Rating isReadOnly aria-label={`${value} stars`} value={value}>
            <Items />
          </Rating>
          <span className="text-sm text-muted">{value}</span>
        </div>
      ))}
    </div>
  ),
};

export const CustomIconHeart: Story = {
  render: () => (
    <Rating aria-label="Heart rating" defaultValue={3} icon={<Icon icon="gravity-ui:heart-fill" />}>
      <Items />
    </Rating>
  ),
};

export const CustomIconPerItem: Story = {
  render: () => (
    <Rating
      aria-label="Icon rating"
      defaultValue={3}
      style={{"--rating-active-color": "var(--color-danger)"} as React.CSSProperties}
    >
      <Items>
        <Icon icon="gravity-ui:heart-fill" />
      </Items>
    </Rating>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Rating isDisabled aria-label="Disabled rating" defaultValue={3}>
      <Items />
    </Rating>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[
        ["Accent", "var(--color-accent)"],
        ["Danger", "var(--color-danger)"],
        ["Success", "var(--color-success)"],
      ].map(([label, color]) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="text-xs leading-4 text-muted">{label}</span>
          <Rating
            aria-label={`${label} rating`}
            defaultValue={4}
            style={{"--rating-active-color": color} as React.CSSProperties}
          >
            <Items />
          </Rating>
        </div>
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-1.5">
      <Label>How would you rate this product?</Label>
      <Rating aria-label="How would you rate this product?">
        <Items />
      </Rating>
    </div>
  ),
};

export const ProductReview: Story = {
  render: () => (
    <div className="grid w-[300px] grid-cols-[1fr_auto_28px] items-center gap-x-2 gap-y-4">
      {[
        ["Quality", 4.5],
        ["Value for money", 3.7],
        ["Design", 5],
        ["Durability", 2.3],
      ].map(([label, value]) => (
        <React.Fragment key={label as string}>
          <span className="text-sm whitespace-nowrap text-foreground">{label}</span>
          <Rating
            isReadOnly
            aria-label={`${label}: ${value} stars`}
            size="sm"
            value={value as number}
          >
            <Items />
          </Rating>
          <span className="w-7 text-right text-xs leading-4 text-muted">{value}</span>
        </React.Fragment>
      ))}
    </div>
  ),
};

import type {Meta, StoryObj} from "@storybook/react";

import {Avatar} from "../avatar";

import {AvatarGroup} from "./index";

const meta: Meta<typeof AvatarGroup> = {
  component: AvatarGroup,
  title: "Components/AvatarGroup",
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

const people = ["Ada", "Lin", "Sam", "Kai", "Ren"];

export const Stacked: Story = {
  render: () => (
    <AvatarGroup aria-label="Team" color="accent" max={3} role="group">
      {people.map((name) => (
        <Avatar key={name} aria-label={name}>
          <Avatar.Fallback>{name[0]}</Avatar.Fallback>
        </Avatar>
      ))}
    </AvatarGroup>
  ),
};

export const Grid: Story = {
  render: () => (
    <AvatarGroup isGrid aria-label="Team" role="group" size="sm">
      {people.map((name) => (
        <Avatar key={name} aria-label={name}>
          <Avatar.Fallback>{name[0]}</Avatar.Fallback>
        </Avatar>
      ))}
    </AvatarGroup>
  ),
};

export const WithCount: Story = {
  render: () => (
    <AvatarGroup aria-label="Team" max={2} overlap="ring" role="group">
      {people.map((name) => (
        <Avatar key={name} aria-label={name}>
          <Avatar.Fallback>{name[0]}</Avatar.Fallback>
        </Avatar>
      ))}
      <AvatarGroup.Count aria-label="7 more team members">+7</AvatarGroup.Count>
    </AvatarGroup>
  ),
};

import type {Meta, StoryObj} from "@storybook/react";

import {Navbar} from "./navbar";

const meta: Meta<typeof Navbar> = {
  title: "Components/Navbar",
  component: Navbar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  render: () => (
    <Navbar className="max-w-3xl">
      <Navbar.Brand className="font-semibold">Acme</Navbar.Brand>
      <Navbar.Content justify="end">
        <Navbar.Item>
          <a href="#home">Home</a>
        </Navbar.Item>
        <Navbar.Item>
          <a href="#about">About</a>
        </Navbar.Item>
      </Navbar.Content>
      <Navbar.MenuToggle />
      <Navbar.Menu>
        <Navbar.MenuItem>
          <a href="#home">Home</a>
        </Navbar.MenuItem>
        <Navbar.MenuItem>
          <a href="#about">About</a>
        </Navbar.MenuItem>
      </Navbar.Menu>
    </Navbar>
  ),
};

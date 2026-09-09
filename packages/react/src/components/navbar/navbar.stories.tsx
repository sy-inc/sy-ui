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

export const Blur: Story = {
  render: () => (
    <div className="from-primary/30 h-64 overflow-y-auto bg-linear-to-b to-transparent p-4">
      <Navbar className="max-w-3xl" variant="blur">
        <Navbar.Brand className="font-semibold">Acme</Navbar.Brand>
        <Navbar.Content justify="end">
          <Navbar.Item>
            <a href="#home">Home</a>
          </Navbar.Item>
          <Navbar.Item>
            <a href="#about">About</a>
          </Navbar.Item>
        </Navbar.Content>
      </Navbar>
      <p className="p-4 text-sm text-muted">
        Scroll: the header stays put and frosts whatever passes under it.
      </p>
      <div className="h-96" />
    </div>
  ),
};

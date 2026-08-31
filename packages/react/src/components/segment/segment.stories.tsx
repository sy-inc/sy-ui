import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import {useState} from "react";

import {Segment} from "./";

const meta: Meta<typeof Segment> = {
  component: Segment,
  parameters: {layout: "centered"},
  title: "Components/Navigation/Segment",
};

export default meta;
type Story = StoryObj<typeof Segment>;

const items = (
  <>
    <Segment.Item id="monthly">Monthly</Segment.Item>
    <Segment.Item id="yearly">Yearly</Segment.Item>
  </>
);
export const Default: Story = {
  render: () => (
    <Segment aria-label="Billing period" defaultSelectedKey="monthly">
      {items}
    </Segment>
  ),
};
export const Ghost: Story = {
  render: () => (
    <Segment aria-label="Ghost billing period" defaultSelectedKey="monthly" variant="ghost">
      {items}
    </Segment>
  ),
};
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Segment aria-label="Small billing period" defaultSelectedKey="monthly" size="sm">
        {items}
      </Segment>
      <Segment aria-label="Medium billing period" defaultSelectedKey="monthly">
        {items}
      </Segment>
      <Segment aria-label="Large billing period" defaultSelectedKey="monthly" size="lg">
        {items}
      </Segment>
    </div>
  ),
};
export const ThemeSwitcher: Story = {
  render: () => (
    <Segment aria-label="Theme" defaultSelectedKey="system">
      <Segment.Item aria-label="Light" id="light">
        <Icon icon="gravity-ui:sun" />
      </Segment.Item>
      <Segment.Item aria-label="Dark" id="dark">
        <Icon icon="gravity-ui:moon" />
      </Segment.Item>
      <Segment.Item aria-label="System" id="system">
        <Icon icon="gravity-ui:display" />
      </Segment.Item>
    </Segment>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4">
      <Segment aria-label="Disabled billing period" defaultSelectedKey="monthly" isDisabled>
        {items}
      </Segment>
      <Segment aria-label="Partially disabled billing period" defaultSelectedKey="monthly">
        <Segment.Item id="monthly">Monthly</Segment.Item>
        <Segment.Item isDisabled id="yearly">
          Yearly
        </Segment.Item>
      </Segment>
    </div>
  ),
};
export const Separators: Story = {
  render: () => (
    <Segment separators aria-label="Billing period with separators" defaultSelectedKey="monthly">
      <Segment.Item id="monthly">Monthly</Segment.Item>
      <Segment.Item id="yearly">Yearly</Segment.Item>
      <Segment.Item id="kkk">kkk</Segment.Item>
    </Segment>
  ),
};
export const WithIcons: Story = {
  render: () => (
    <Segment aria-label="Dashboard navigation" defaultSelectedKey="dashboard">
      <Segment.Item id="dashboard">
        <Icon icon="gravity-ui:layout-cells-large" />
        Dashboard
      </Segment.Item>
      <Segment.Item id="analytics">
        <Icon icon="gravity-ui:chart-column" />
        Analytics
      </Segment.Item>
      <Segment.Item id="team">
        <Icon icon="gravity-ui:persons" />
        Team
      </Segment.Item>
      <Segment.Item id="settings">
        <Icon icon="gravity-ui:gear" />
        Settings
      </Segment.Item>
    </Segment>
  ),
};

const iconExpandItems = [
  ["home", "Home", "gravity-ui:house"],
  ["chat", "Chat", "gravity-ui:comment"],
  ["meetings", "Meetings", "gravity-ui:calendar"],
  ["inbox", "Inbox", "gravity-ui:envelope"],
] as const;

export const IconExpand: Story = {
  render: () => (
    <Segment aria-label="Workspace navigation" defaultSelectedKey="meetings" variant="ghost">
      {iconExpandItems.map(([id, label, icon]) => (
        <Segment.Item key={id} aria-label={label} className="w-auto" id={id}>
          {() => (
            <>
              <Icon icon={icon} />
              <span className="segment__item-label">
                <span className="segment__item-label-inner">{label}</span>
              </span>
            </>
          )}
        </Segment.Item>
      ))}
    </Segment>
  ),
};
function ControlledStory() {
  const [selectedKey, setSelectedKey] = useState("monthly");

  return (
    <Segment
      aria-label="Controlled billing period"
      selectedKey={selectedKey}
      onSelectionChange={setSelectedKey}
    >
      {items}
    </Segment>
  );
}

export const Controlled: Story = {render: () => <ControlledStory />};

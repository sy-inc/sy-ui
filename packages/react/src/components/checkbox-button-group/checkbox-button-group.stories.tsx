import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import React from "react";

import {Button} from "../button";
import {Chip} from "../chip";
import {Description} from "../description";
import {Label} from "../label";
import {Link} from "../link";

import {CheckboxButtonGroup} from "./index";

const stackWidth = "w-[min(360px,calc(100vw-2rem))]";
const features = [
  ["security", "Security", "Real-time threat detection and prevention"],
  ["storage", "Storage", "Cloud-based storage with automatic backups"],
  ["analytics", "Analytics", "Usage reports and performance dashboards"],
] as const;
const addOns = [
  ["backups", "Backups", "Automated daily backups", "US$5.00"],
  ["monitoring", "Monitoring", "24/7 monitoring and alerts", "US$12.00"],
  ["support", "Support", "Priority email and chat support", "US$8.00"],
] as const;

const FeatureOptions = ({indicator = true}: {indicator?: boolean}) => (
  <>
    {features.map(([value, title, description]) => (
      <CheckboxButtonGroup.Item key={value} value={value}>
        {indicator ? <CheckboxButtonGroup.Indicator /> : null}
        <CheckboxButtonGroup.ItemContent>
          <Label>{title}</Label>
          <Description>{description}</Description>
        </CheckboxButtonGroup.ItemContent>
      </CheckboxButtonGroup.Item>
    ))}
  </>
);

const Price = ({amount}: {amount: string}) => (
  <span className="mt-2 text-sm font-semibold">
    {amount}
    <span className="text-xs font-normal text-muted">/mo</span>
  </span>
);

const AddOnOptions = () => (
  <>
    {addOns.map(([value, title, description, price]) => (
      <CheckboxButtonGroup.Item key={value} value={value}>
        <CheckboxButtonGroup.Indicator />
        <CheckboxButtonGroup.ItemContent>
          <Label>{title}</Label>
          <Description>{description}</Description>
          <Price amount={price} />
        </CheckboxButtonGroup.ItemContent>
      </CheckboxButtonGroup.Item>
    ))}
  </>
);

const meta: Meta<typeof CheckboxButtonGroup> = {
  title: "Components/CheckboxButtonGroup",
  component: CheckboxButtonGroup,
  parameters: {layout: "centered"},
  decorators: [
    (Story, context) =>
      context.viewMode === "story" ? (
        <div className="grid min-h-[calc(100vh-2rem)] place-items-center">
          <Story />
        </div>
      ) : (
        <Story />
      ),
  ],
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CheckboxButtonGroup>;

export const Default: Story = {
  render: () => (
    <CheckboxButtonGroup className={stackWidth} defaultValue={["security", "storage"]}>
      <Label>Select features</Label>
      <Description>Choose all that apply to your project</Description>
      <FeatureOptions />
    </CheckboxButtonGroup>
  ),
};

export const GridLayout: Story = {
  name: "Grid Layout",
  render: () => (
    <CheckboxButtonGroup
      className="w-[min(672px,calc(100vw-2rem))] grid-cols-3"
      defaultValue={["backups", "monitoring"]}
      layout="grid"
    >
      <Label className="col-span-full">Add-ons</Label>
      <AddOnOptions />
    </CheckboxButtonGroup>
  ),
};

export const NoIndicator: Story = {
  name: "No Indicator",
  render: () => (
    <CheckboxButtonGroup className={stackWidth} defaultValue={["security"]}>
      <Label>Select features</Label>
      <FeatureOptions indicator={false} />
    </CheckboxButtonGroup>
  ),
};

export const CustomIndicator: Story = {
  name: "Custom Indicator",
  render: () => (
    <CheckboxButtonGroup
      className="w-[min(672px,calc(100vw-2rem))] grid-cols-3"
      defaultValue={["updates", "alerts"]}
      layout="grid"
    >
      <Label className="col-span-full">Notification preferences</Label>
      {[
        ["updates", "Product updates", "Weekly product updates and tips", "4,200 subscribers"],
        [
          "alerts",
          "Security alerts",
          "Security alerts and maintenance notices",
          "8,100 subscribers",
        ],
        ["marketing", "Marketing", "Promotions, deals, and special offers", "2,300 subscribers"],
      ].map(([value, title, description, subscribers]) => (
        <CheckboxButtonGroup.Item key={value} value={value}>
          <CheckboxButtonGroup.Indicator>
            <Icon aria-hidden="true" icon="gravity-ui:circle-check-fill" />
          </CheckboxButtonGroup.Indicator>
          <CheckboxButtonGroup.ItemContent>
            <Label>{title}</Label>
            <Description>{description}</Description>
            <span className="mt-2 text-sm font-semibold">
              {subscribers.split(" ")[0]}{" "}
              <span className="text-xs font-normal text-muted">subscribers</span>
            </span>
          </CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      ))}
    </CheckboxButtonGroup>
  ),
};

export const IconCards: Story = {
  name: "Icon Cards",
  render: () => (
    <CheckboxButtonGroup
      className="w-[min(520px,calc(100vw-2rem))]"
      defaultValue={["2fa", "encryption"]}
    >
      <Label>Security features</Label>
      {[
        ["2fa", "2FA", "Two-factor authentication for all user accounts.", "gravity-ui:lock"],
        ["encryption", "Encryption", "Encrypt data at rest and in transit.", "gravity-ui:shield"],
        [
          "backup",
          "Cloud Backup",
          "Automated daily backups to secure cloud storage.",
          "gravity-ui:cloud",
        ],
        [
          "alerts",
          "Alert System",
          "Real-time alerts for incidents and breaches.",
          "gravity-ui:megaphone",
        ],
      ].map(([value, title, description, icon]) => (
        <CheckboxButtonGroup.Item
          className="bg-surface-secondary text-surface-secondary-foreground"
          key={value}
          value={value}
        >
          <CheckboxButtonGroup.Indicator>
            <Icon aria-hidden="true" icon="gravity-ui:circle-check-fill" />
          </CheckboxButtonGroup.Indicator>
          <CheckboxButtonGroup.ItemIcon className="absolute start-5 top-4 size-8 rounded-lg bg-background text-foreground shadow-sm [&_svg]:size-4">
            <Icon aria-hidden="true" icon={icon} />
          </CheckboxButtonGroup.ItemIcon>
          <CheckboxButtonGroup.ItemContent className="gap-2">
            <div className="flex min-h-8 items-center gap-2 ps-11">
              <Label>{title}</Label>
              {value === "2fa" ? (
                <Chip className="bg-success/20 text-success" size="sm">
                  Recommended
                </Chip>
              ) : null}
            </div>
            <Description>{description}</Description>
          </CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      ))}
    </CheckboxButtonGroup>
  ),
};

export const WithIcons: Story = {
  name: "With Icons",
  render: () => (
    <CheckboxButtonGroup
      className="w-[min(560px,calc(100vw-2rem))] grid-cols-2"
      defaultValue={["content", "analytics"]}
      layout="grid"
    >
      <Label className="col-span-full">Role permissions</Label>
      {[
        ["content", "gravity-ui:cloud", "Content Management", "Create, edit, and delete content"],
        ["users", "gravity-ui:shield", "User Administration", "Manage team members and roles"],
        ["analytics", "gravity-ui:database", "Analytics Access", "View and export reports"],
        ["settings", "gravity-ui:lock", "Settings", "Configure system preferences"],
      ].map(([value, icon, title, description]) => (
        <CheckboxButtonGroup.Item key={value} value={value}>
          <CheckboxButtonGroup.ItemIcon className="absolute start-5 top-1/2 -translate-y-1/2">
            <Icon aria-hidden="true" icon={icon} />
          </CheckboxButtonGroup.ItemIcon>
          <CheckboxButtonGroup.ItemContent className="ps-10">
            <Label>{title}</Label>
            <Description>{description}</Description>
          </CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      ))}
    </CheckboxButtonGroup>
  ),
};

export const DisabledGroup: Story = {
  name: "Disabled Group",
  render: () => (
    <CheckboxButtonGroup className={stackWidth} defaultValue={["security"]} isDisabled>
      <Label>Select features</Label>
      <Description>Feature selection is temporarily unavailable.</Description>
      <FeatureOptions />
    </CheckboxButtonGroup>
  ),
};

export const WithPressFeedback: Story = {
  name: "With Press Feedback",
  render: () => (
    <CheckboxButtonGroup
      className="w-[min(672px,calc(100vw-2rem))] grid-cols-3"
      defaultValue={["github"]}
      layout="grid"
    >
      <Label className="col-span-full">Integrations</Label>
      {[
        ["github", "GitHub", "Connect your GitHub repositories"],
        ["slack", "Slack", "Push notifications to Slack channels"],
        ["linear", "Linear", "Sync tasks with Linear projects"],
      ].map(([value, title, description]) => (
        <CheckboxButtonGroup.Item
          className="checkbox-button-group__item--pressable"
          key={value}
          value={value}
        >
          <CheckboxButtonGroup.Indicator />
          <CheckboxButtonGroup.ItemContent>
            <Label>{title}</Label>
            <Description>{description}</Description>
          </CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      ))}
    </CheckboxButtonGroup>
  ),
};

export const RenderPropChildren: Story = {
  name: "Render Prop Children",
  render: () => (
    <CheckboxButtonGroup className={stackWidth}>
      <Label>Select features</Label>
      {addOns.map(([value, title, description, price]) => (
        <CheckboxButtonGroup.Item key={value} value={value}>
          {({isSelected}) => (
            <>
              <CheckboxButtonGroup.Indicator />
              <CheckboxButtonGroup.ItemContent>
                <Label>{title}</Label>
                <Description>{description}</Description>
                <Price amount={price.replace(".00", "")} />
                {isSelected ? <span className="mt-1 text-sm text-accent">Selected</span> : null}
              </CheckboxButtonGroup.ItemContent>
            </>
          )}
        </CheckboxButtonGroup.Item>
      ))}
    </CheckboxButtonGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(["backups"]);
    return (
      <div className={`flex flex-col gap-3 ${stackWidth}`}>
        <CheckboxButtonGroup aria-label="Add-ons" value={value} onChange={setValue}>
          <Label>Add-ons</Label>
          <Description>Select the add-ons you need</Description>
          <AddOnOptions />
        </CheckboxButtonGroup>
        <p className="text-sm text-muted">Selected: {value.join(", ") || "none"}</p>
      </div>
    );
  },
};

export const SubscriptionPlans: Story = {
  name: "Subscription Plans",
  render: () => (
    <div className="flex flex-col items-center gap-4 text-center">
      <div>
        <h2 className="text-3xl font-bold">Choose a subscription</h2>
        <p className="text-muted">
          Pick a plan.{" "}
          <Link className="font-semibold text-success" href="#">
            Try a month on us!
          </Link>
        </p>
      </div>
      <CheckboxButtonGroup
        aria-label="Choose a subscription"
        className="w-[min(420px,calc(100vw-2rem))] text-left"
        defaultValue={["silver"]}
      >
        {[
          [
            "gold",
            "Gold",
            "Full suite of saving, investing, and learning tools for you and your family.",
            "US$0.40/day",
            "US$12",
          ],
          [
            "silver",
            "Silver",
            "Level up your saving and investing skills with even more tools.",
            "US$0.20/day",
            "US$6",
          ],
          [
            "bronze",
            "Bronze",
            "Investing tools to get you started on your financial journey.",
            "US$0.10/day",
            "US$3",
          ],
        ].map(([value, title, description, price, monthly]) => (
          <CheckboxButtonGroup.Item
            className="data-[selected=true]:ring-success data-[selected=true]:[&_[data-slot=description]]:text-success"
            key={value}
            value={value}
          >
            <CheckboxButtonGroup.Indicator className="data-[custom=true]:text-success">
              <Icon aria-hidden="true" icon="gravity-ui:circle-check-fill" />
            </CheckboxButtonGroup.Indicator>
            <CheckboxButtonGroup.ItemContent>
              <Label className="text-xl font-semibold">{title}</Label>
              <Description>{description}</Description>
              <p className="mt-3 text-sm font-semibold">
                {price} <span className="font-normal text-muted">({monthly} billed monthly)</span>
              </p>
            </CheckboxButtonGroup.ItemContent>
          </CheckboxButtonGroup.Item>
        ))}
      </CheckboxButtonGroup>
      <p className="max-w-[420px] text-sm text-muted">
        *APY is variable and subject to change at our discretion, without prior notice.
      </p>
      <Button className="h-11 w-[min(420px,calc(100vw-2rem))] bg-success text-base font-semibold text-white hover:bg-success/90">
        Try a month on us
      </Button>
      <Link className="font-semibold text-success" href="#">
        Compare plans
      </Link>
    </div>
  ),
};

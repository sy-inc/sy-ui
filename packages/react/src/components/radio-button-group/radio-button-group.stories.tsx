import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";
import React from "react";

import {Chip} from "../chip";
import {Description} from "../description";
import {Label} from "../label";

import {RadioButtonGroup} from "./index";

/** The group ships no width or column count — the consumer sets those. */
const stackWidth = "w-[min(360px,calc(100vw-2rem))]";

const Price = ({amount}: {amount: string}) => (
  <span className="mt-2 text-sm font-semibold">
    {amount}
    <span className="text-xs font-normal text-muted">/mo</span>
  </span>
);

const plans = [
  ["starter", "Starter", "For individuals and small projects", "US$5"],
  ["pro", "Pro", "For growing teams and businesses", "US$15"],
  ["enterprise", "Enterprise", "For large organizations at scale", "US$45"],
] as const;

const PlanOption = ({
  indicator = true,
  plan: [value, title, description, price],
}: {
  indicator?: boolean;
  plan: (typeof plans)[number];
}) => (
  <RadioButtonGroup.Item value={value}>
    {indicator ? <RadioButtonGroup.Indicator /> : null}
    <RadioButtonGroup.ItemContent>
      <Label>{title}</Label>
      <Description>{description}</Description>
      <Price amount={price} />
    </RadioButtonGroup.ItemContent>
  </RadioButtonGroup.Item>
);

const PlanOptions = ({indicator = true}: {indicator?: boolean}) => (
  <>
    {plans.map((plan) => (
      <PlanOption indicator={indicator} key={plan[0]} plan={plan} />
    ))}
  </>
);

const PlanItem = ({
  description,
  title,
  value,
}: {
  description: string;
  title: string;
  value: string;
}) => (
  <RadioButtonGroup.Item value={value}>
    <RadioButtonGroup.Indicator />
    <RadioButtonGroup.ItemContent>
      <Label>{title}</Label>
      <Description>{description}</Description>
    </RadioButtonGroup.ItemContent>
  </RadioButtonGroup.Item>
);

const meta: Meta<typeof RadioButtonGroup> = {
  title: "Components/RadioButtonGroup",
  component: RadioButtonGroup,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof RadioButtonGroup>;

export const Default: Story = {
  render: () => (
    <RadioButtonGroup className={stackWidth} defaultValue="pro">
      <Label>Select a plan</Label>
      <Description>Choose the plan that suits your needs</Description>
      <PlanOptions />
    </RadioButtonGroup>
  ),
};

export const GridLayout: Story = {
  name: "Grid Layout",
  render: () => (
    <RadioButtonGroup
      aria-label="Delivery method"
      className="max-w-[672px] sm:grid-cols-3"
      defaultValue="express"
      layout="grid"
    >
      <PlanItem description="4-10 business days" title="Standard · US$5.00" value="standard" />
      <PlanItem description="2-5 business days" title="Express · US$16.00" value="express" />
      <PlanItem description="1 business day" title="Super Fast · US$25.00" value="super-fast" />
    </RadioButtonGroup>
  ),
};

export const NoIndicator: Story = {
  name: "No Indicator",
  render: () => (
    <RadioButtonGroup aria-label="Select a plan" className={stackWidth} defaultValue="pro">
      <Label>Select a plan</Label>
      <Description>Choose the plan that suits your needs</Description>
      <PlanOptions indicator={false} />
    </RadioButtonGroup>
  ),
};

export const CustomIndicator: Story = {
  render: () => (
    <RadioButtonGroup
      aria-label="Newsletter audience"
      className={stackWidth}
      defaultValue="newsletter"
    >
      {[
        ["newsletter", "Newsletter subscribers", "Sends every Tuesday", "621 users"],
        ["customers", "Existing customers", "Sends every Thursday", "1,200 users"],
        ["trial", "Trial users", "Sends every Friday", "2,740 users"],
      ].map(([value, title, description, users]) => (
        <RadioButtonGroup.Item key={value} value={value}>
          <RadioButtonGroup.Indicator>
            <Icon aria-hidden="true" icon="gravity-ui:check" />
          </RadioButtonGroup.Indicator>
          <RadioButtonGroup.ItemContent>
            <Label>{title}</Label>
            <Description>{description}</Description>
            <span className="mt-2 text-sm font-medium">{users}</span>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      ))}
    </RadioButtonGroup>
  ),
};

export const IconCards: Story = {
  name: "Icon Cards",
  render: () => (
    <RadioButtonGroup
      aria-label="Subscription plan"
      className="max-w-[672px] sm:grid-cols-3"
      defaultValue="starter"
      layout="grid"
    >
      {[
        ["starter", "Starter", "$12", "For individuals and small projects", "gravity-ui:rocket"],
        ["growth", "Growth", "$29", "For growing teams and businesses", "gravity-ui:chart-line"],
        ["business", "Business", "$59", "For teams that need more power", "gravity-ui:persons"],
        [
          "scale",
          "Scale",
          "$149",
          "For organizations with advanced needs",
          "gravity-ui:arrow-up-right",
        ],
        [
          "enterprise",
          "Enterprise",
          "$299",
          "Custom solutions for large organizations",
          "gravity-ui:build",
        ],
      ].map(([value, title, price, description, icon]) => (
        <RadioButtonGroup.Item className="bg-muted/50" key={value} value={value}>
          <RadioButtonGroup.Indicator>
            <Icon aria-hidden="true" icon="gravity-ui:check" />
          </RadioButtonGroup.Indicator>
          <RadioButtonGroup.ItemIcon className="size-8 rounded-lg bg-background text-accent">
            <Icon aria-hidden="true" icon={icon} />
          </RadioButtonGroup.ItemIcon>
          <RadioButtonGroup.ItemContent>
            {value === "starter" ? (
              <Chip className="absolute end-12 top-4" color="success" size="sm">
                Most popular
              </Chip>
            ) : null}
            <Label>{title}</Label>
            <span className="text-xl font-semibold">
              {price}
              <span className="text-sm font-normal text-muted">/mo</span>
            </span>
            <Description>{description}</Description>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      ))}
    </RadioButtonGroup>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <RadioButtonGroup
      aria-label="Payment method"
      className="max-w-[480px] sm:grid-cols-2"
      defaultValue="card-0123"
      layout="grid"
    >
      {[
        ["card-0123", "gravity-ui:credit-card", "**** 0123", "Exp. on 01/2026"],
        ["card-8304", "gravity-ui:credit-card", "**** 8304", "Exp. on 06/2028"],
        ["paypal", "logos:paypal", "PayPal", "Pay with PayPal"],
      ].map(([value, icon, title, description]) => (
        <RadioButtonGroup.Item key={value} value={value}>
          <RadioButtonGroup.Indicator />
          <RadioButtonGroup.ItemIcon>
            <Icon aria-hidden="true" icon={icon} />
          </RadioButtonGroup.ItemIcon>
          <RadioButtonGroup.ItemContent>
            <Label>{title}</Label>
            <Description>{description}</Description>
          </RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      ))}
    </RadioButtonGroup>
  ),
};

export const DisabledGroup: Story = {
  name: "Disabled Group",
  render: () => (
    <RadioButtonGroup
      aria-label="Select a plan"
      className={stackWidth}
      defaultValue="pro"
      isDisabled
    >
      <Label>Select a plan</Label>
      <Description>Plan changes are temporarily unavailable.</Description>
      <PlanOptions />
    </RadioButtonGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("pro");

    return (
      <div className={`flex flex-col gap-3 ${stackWidth}`}>
        <RadioButtonGroup aria-label="Select a plan" value={value} onChange={setValue}>
          <Label>Select a plan</Label>
          <Description>Choose the plan that suits your needs</Description>
          <PlanOptions />
        </RadioButtonGroup>
        <p className="text-sm text-muted">Selected: {value}</p>
      </div>
    );
  },
};

export const RenderPropChildren: Story = {
  name: "Render Prop Children",
  render: () => (
    <RadioButtonGroup aria-label="Select a plan" className={stackWidth} defaultValue="pro">
      <Label>Select a plan</Label>
      <Description>Choose the plan that suits your needs</Description>
      {plans.map((plan) => (
        <RadioButtonGroup.Item key={plan[0]} value={plan[0]}>
          {({isSelected}) => (
            <RadioButtonGroup.ItemContent>
              <Label>{plan[1]}</Label>
              <Description>{plan[2]}</Description>
              {isSelected ? <span className="mt-2 text-sm text-accent">Selected</span> : null}
            </RadioButtonGroup.ItemContent>
          )}
        </RadioButtonGroup.Item>
      ))}
    </RadioButtonGroup>
  ),
};

export const DeliveryAndPayment: Story = {
  name: "Delivery And Payment",
  render: () => (
    <div className="flex flex-col gap-8">
      <RadioButtonGroup aria-label="Delivery method" className={stackWidth} defaultValue="standard">
        <Label>Delivery method</Label>
        <PlanItem description="4-10 business days · US$5.00" title="Standard" value="standard" />
        <PlanItem description="2-5 business days · US$16.00" title="Express" value="express" />
        <PlanItem description="1 business day · US$25.00" title="Super Fast" value="super-fast" />
      </RadioButtonGroup>
      <RadioButtonGroup aria-label="Payment method" className={stackWidth} defaultValue="card-0123">
        <Label>Payment method</Label>
        <PlanItem description="Exp. on 01/2026" title="**** 0123" value="card-0123" />
        <PlanItem description="Exp. on 06/2028" title="**** 8304" value="card-8304" />
        <PlanItem description="Pay with PayPal" title="PayPal" value="paypal" />
      </RadioButtonGroup>
    </div>
  ),
};

import type {Meta, StoryObj} from "@storybook/react";
import type {Key} from "react";

import {Icon} from "@iconify/react";
import React from "react";

import {Button} from "../button";

import {Stepper} from "./index";

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  argTypes: {
    color: {control: "select", options: ["default", "accent", "success", "warning", "danger"]},
    orientation: {control: "inline-radio", options: ["horizontal", "vertical"]},
    separatorMode: {control: "inline-radio", options: ["spaced", "connected"]},
    size: {control: "inline-radio", options: ["sm", "md", "lg"]},
    variant: {control: "select", options: ["primary", "secondary", "soft", "dot"]},
  },
} satisfies Meta<typeof Stepper>;

export default meta;

type Story = StoryObj<typeof meta>;

const orderSteps = [
  ["cart", "Cart"],
  ["shipping", "Shipping"],
  ["payment", "Payment"],
  ["confirmation", "Confirmation"],
] as const;

const accountSteps = [
  ["account", "Account", "Create your account"],
  ["profile", "Profile", "Set up your profile"],
  ["settings", "Settings", "Configure preferences"],
  ["review", "Review", "Review and confirm"],
] as const;

const setAdjacentStep = (
  steps: readonly (readonly [string, ...string[]])[],
  key: Key,
  offset: number,
) => {
  const index = steps.findIndex(([id]) => id === key);

  return steps[Math.max(0, Math.min(steps.length - 1, index + offset))]?.[0] ?? key;
};

const renderOrderItems = (withDescriptions = false) =>
  orderSteps.map(([id, title]) => (
    <Stepper.Item key={id} id={id}>
      <Stepper.Indicator />
      <Stepper.Content>
        <Stepper.Title>{title}</Stepper.Title>
        {withDescriptions && (
          <Stepper.Description>{`Complete ${title.toLowerCase()}`}</Stepper.Description>
        )}
      </Stepper.Content>
    </Stepper.Item>
  ));

const renderAccountItems = (withIcons = false) =>
  accountSteps.map(([id, title, description], index) => (
    <Stepper.Item key={id} id={id}>
      <Stepper.Indicator>
        {withIcons ? (
          <Icon
            aria-hidden="true"
            icon={
              [
                "gravity-ui:person",
                "gravity-ui:gear",
                "gravity-ui:lock",
                "gravity-ui:circle-check",
              ][index]
            }
          />
        ) : undefined}
      </Stepper.Indicator>
      <Stepper.Content>
        <Stepper.Title>{title}</Stepper.Title>
        <Stepper.Description>{description}</Stepper.Description>
      </Stepper.Content>
    </Stepper.Item>
  ));

const UsageExample = () => {
  const [currentKey, setCurrentKey] = React.useState<Key>("shipping");

  return (
    <Stepper
      aria-label="Order progress"
      className="w-[500px]"
      currentKey={currentKey}
      onCurrentChange={setCurrentKey}
    >
      {renderOrderItems()}
    </Stepper>
  );
};

const ControlledExample = ({
  orientation = "horizontal",
  withPanel = false,
}: {
  orientation?: "horizontal" | "vertical";
  withPanel?: boolean;
}) => {
  const [currentKey, setCurrentKey] = React.useState<Key>("account");
  const index = Math.max(
    0,
    accountSteps.findIndex(([id]) => id === currentKey),
  );
  const current = accountSteps[index]!;

  return (
    <div
      className={
        orientation === "vertical" && withPanel
          ? "grid max-w-2xl grid-cols-[minmax(16rem,1fr)_minmax(0,1fr)] gap-8"
          : "grid gap-6"
      }
    >
      <Stepper
        aria-label="Account setup"
        currentKey={currentKey}
        onCurrentChange={setCurrentKey}
        orientation={orientation}
      >
        {renderAccountItems()}
      </Stepper>
      {withPanel && (
        <div className="border-default-200 rounded-lg border p-5">
          <p className="text-default-500 text-sm">Current step</p>
          <h3 className="mt-1 text-lg font-semibold">{current[1]}</h3>
          <p className="text-default-600 mt-2 text-sm">{current[2]}</p>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button
          isDisabled={index === 0}
          onPress={() => setCurrentKey(setAdjacentStep(accountSteps, currentKey, -1))}
          variant="outline"
        >
          {orientation === "vertical" ? "Back" : "Previous"}
        </Button>
        <Button
          isDisabled={index === accountSteps.length - 1}
          onPress={() => setCurrentKey(setAdjacentStep(accountSteps, currentKey, 1))}
        >
          {orientation === "vertical" ? "Continue" : "Next"}
        </Button>
        {orientation === "horizontal" && (
          <span className="text-default-500 text-sm">{`Step ${index + 1} of ${accountSteps.length}`}</span>
        )}
      </div>
    </div>
  );
};

const ColorStepper = ({
  color,
  className,
  orientation = "horizontal",
}: {
  color: "accent" | "success" | "danger" | "warning" | "default";
  className?: string;
  orientation?: "horizontal" | "vertical";
}) => (
  <Stepper
    aria-label={`${color} order progress`}
    className={className}
    color={color}
    currentKey="shipping"
    orientation={orientation}
  >
    {renderOrderItems()}
  </Stepper>
);

const Timeline = ({
  items,
  label,
}: {
  items: readonly (readonly [string, string, string, string])[];
  label: string;
}) => (
  <Stepper aria-label={label} currentKey={items[0]![0]} orientation="vertical">
    {items.map(([id, title, description, icon]) => (
      <Stepper.Item key={id} id={id}>
        <Stepper.Indicator>
          <Icon aria-hidden="true" icon={icon} />
        </Stepper.Indicator>
        <Stepper.Content>
          <Stepper.Title>{title}</Stepper.Title>
          <Stepper.Description>{description}</Stepper.Description>
        </Stepper.Content>
      </Stepper.Item>
    ))}
  </Stepper>
);

export const Usage: Story = {render: () => <UsageExample />};

export const PackageTracking: Story = {
  render: () => (
    <div className="border-default-200 w-96 rounded-xl border p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-default-500 text-sm">Order #SY-2408</p>
          <h3 className="text-lg font-semibold">Your package is on the way</h3>
        </div>
        <Icon aria-hidden="true" className="text-xl text-accent" icon="gravity-ui:shopping-bag" />
      </div>
      <Stepper aria-label="Package tracking" currentKey="transit" orientation="vertical">
        <Stepper.Item id="ordered">
          <Stepper.Indicator>
            <Icon aria-hidden="true" icon="gravity-ui:circle-check" />
          </Stepper.Indicator>
          <Stepper.Content>
            <Stepper.Title>Order confirmed</Stepper.Title>
            <Stepper.Description>Aug 18, 9:42 AM</Stepper.Description>
          </Stepper.Content>
        </Stepper.Item>
        <Stepper.Item id="transit">
          <Stepper.Indicator>
            <Icon aria-hidden="true" icon="gravity-ui:truck" />
          </Stepper.Indicator>
          <Stepper.Content>
            <Stepper.Title>In transit</Stepper.Title>
            <Stepper.Description>Your parcel is moving through the network.</Stepper.Description>
          </Stepper.Content>
        </Stepper.Item>
        <Stepper.Item id="delivery" status="pending">
          <Stepper.Indicator>
            <Icon aria-hidden="true" icon="gravity-ui:house" />
          </Stepper.Indicator>
          <Stepper.Content>
            <Stepper.Title>Delivery</Stepper.Title>
            <Stepper.Description>Expected tomorrow</Stepper.Description>
          </Stepper.Content>
        </Stepper.Item>
      </Stepper>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="sm" variant="outline">
          <Icon aria-hidden="true" icon="gravity-ui:copy" />
          Copy tracking
        </Button>
        <Button size="sm" variant="outline">
          <Icon aria-hidden="true" icon="gravity-ui:pin" />
          View map
        </Button>
        <Button size="sm" variant="ghost">
          Support
        </Button>
      </div>
    </div>
  ),
};

export const BulletSteps: Story = {
  render: () => {
    const [currentKey, setCurrentKey] = React.useState<Key>("shipping");

    return (
      <div className="grid max-w-2xl gap-10">
        <Stepper
          aria-label="Horizontal bullet steps"
          currentKey={currentKey}
          onCurrentChange={setCurrentKey}
          variant="dot"
        >
          {renderOrderItems()}
        </Stepper>
        <Stepper
          aria-label="Vertical bullet steps"
          currentKey={currentKey}
          onCurrentChange={setCurrentKey}
          orientation="vertical"
          variant="dot"
        >
          {renderOrderItems(true)}
        </Stepper>
      </div>
    );
  },
};

export const Controlled: Story = {render: () => <ControlledExample />};

export const ControlledVertical: Story = {
  render: () => <ControlledExample orientation="vertical" withPanel />,
};

export const CustomColor: Story = {
  render: () => (
    <div className="grid gap-8">
      <ColorStepper color="accent" />
      <ColorStepper color="success" />
      <ColorStepper color="danger" />
      <ColorStepper color="warning" />
      <ColorStepper className="bg-default-900 rounded-lg p-4 text-white" color="default" />
    </div>
  ),
};

export const CustomColorVertical: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-10">
      <ColorStepper color="accent" orientation="vertical" />
      <ColorStepper color="success" orientation="vertical" />
      <ColorStepper color="danger" orientation="vertical" />
      <ColorStepper
        className="bg-default-900 rounded-lg p-4 text-white"
        color="default"
        orientation="vertical"
      />
    </div>
  ),
};

export const CustomCompletedIcon: Story = {
  render: () => {
    const [currentKey, setCurrentKey] = React.useState<Key>("payment");
    const items = (orientation: "horizontal" | "vertical") => (
      <Stepper
        aria-label={`${orientation} custom completed icon`}
        currentKey={currentKey}
        onCurrentChange={setCurrentKey}
        orientation={orientation}
      >
        {orderSteps.map(([id, title]) => (
          <Stepper.Item key={id} id={id}>
            <Stepper.Indicator>
              {({index, status}) =>
                status === "complete" ? (
                  <Icon aria-hidden="true" icon="gravity-ui:circle-check" />
                ) : (
                  index + 1
                )
              }
            </Stepper.Indicator>
            <Stepper.Content>
              <Stepper.Title>{title}</Stepper.Title>
            </Stepper.Content>
          </Stepper.Item>
        ))}
      </Stepper>
    );

    return (
      <div className="grid gap-10">
        {items("horizontal")}
        {items("vertical")}
      </div>
    );
  },
};

export const DisplayOnly: Story = {
  render: () => (
    <div className="grid gap-10">
      <Stepper aria-label="Display-only horizontal progress" currentKey="shipping">
        {renderOrderItems()}
      </Stepper>
      <Stepper
        aria-label="Display-only vertical progress"
        currentKey="shipping"
        orientation="vertical"
      >
        {renderOrderItems(true)}
      </Stepper>
    </div>
  ),
};

export const DynamicIcon: Story = {
  render: () => {
    const [currentKey, setCurrentKey] = React.useState<Key>("process");
    const icons = {
      complete: "gravity-ui:circle-check",
      current: "gravity-ui:arrows-rotate-left",
      pending: "gravity-ui:clock",
    };

    return (
      <Stepper aria-label="Upload progress" currentKey={currentKey} onCurrentChange={setCurrentKey}>
        {["Upload", "Process", "Complete"].map((title) => (
          <Stepper.Item key={title} id={title.toLowerCase()}>
            <Stepper.Indicator>
              {({status}) => (
                <Icon
                  aria-hidden="true"
                  icon={
                    icons[
                      status === "current"
                        ? "current"
                        : status === "complete"
                          ? "complete"
                          : "pending"
                    ]
                  }
                />
              )}
            </Stepper.Indicator>
            <Stepper.Content>
              <Stepper.Title>{title}</Stepper.Title>
            </Stepper.Content>
          </Stepper.Item>
        ))}
      </Stepper>
    );
  },
};

export const FreeTrialTimeline: Story = {
  render: () => (
    <Timeline
      label="Start your 14-day free trial"
      items={[
        ["today", "Today", "Create your workspace", "gravity-ui:rocket"],
        ["day-12", "In 12 days", "We will remind you before the trial ends", "gravity-ui:bell"],
        ["day-14", "In 14 days", "Choose a plan to keep your work", "gravity-ui:circle-check"],
      ]}
    />
  ),
};

export const OnboardingTimeline: Story = {
  render: () => (
    <Timeline
      label="Getting started"
      items={[
        ["account", "Account created", "Your workspace is ready", "gravity-ui:circle-check"],
        [
          "integrations",
          "Set up integrations",
          "Connect the tools your team uses",
          "gravity-ui:plug-connection",
        ],
        [
          "project",
          "Create a project",
          "Invite your team and start planning",
          "gravity-ui:folder-open",
        ],
      ]}
    />
  ),
};

export const RenderFunction: Story = {
  render: () => {
    const [currentKey, setCurrentKey] = React.useState<Key>("profile");

    return (
      <Stepper
        aria-label="Profile setup"
        currentKey={currentKey}
        onCurrentChange={setCurrentKey}
        orientation="vertical"
      >
        {accountSteps.map(([id, title, description]) => (
          <Stepper.Item key={id} id={id}>
            <Stepper.Indicator>
              {({index, status}) =>
                status === "complete" ? (
                  <Icon aria-hidden="true" icon="gravity-ui:circle-check" />
                ) : status === "current" ? (
                  <Icon aria-hidden="true" icon="gravity-ui:person" />
                ) : (
                  index + 1
                )
              }
            </Stepper.Indicator>
            <Stepper.Content>
              <Stepper.Title>{title}</Stepper.Title>
              <Stepper.Description>{description}</Stepper.Description>
            </Stepper.Content>
          </Stepper.Item>
        ))}
      </Stepper>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="grid gap-10">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stepper key={size} aria-label={`${size} order progress`} currentKey="shipping" size={size}>
          {renderOrderItems()}
        </Stepper>
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  render: () => {
    const [currentKey, setCurrentKey] = React.useState<Key>("profile");

    return (
      <Stepper
        aria-label="Account setup progress"
        currentKey={currentKey}
        onCurrentChange={setCurrentKey}
        orientation="vertical"
      >
        {renderAccountItems()}
      </Stepper>
    );
  },
};

export const VerticalSizes: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stepper
          key={size}
          aria-label={`${size} vertical progress`}
          currentKey="profile"
          orientation="vertical"
          size={size}
        >
          {renderAccountItems()}
        </Stepper>
      ))}
    </div>
  ),
};

export const VerticalWithIcons: Story = {
  render: () => {
    const [currentKey, setCurrentKey] = React.useState<Key>("settings");

    return (
      <Stepper
        aria-label="Vertical account setup"
        currentKey={currentKey}
        onCurrentChange={setCurrentKey}
        orientation="vertical"
      >
        {renderAccountItems(true)}
      </Stepper>
    );
  },
};

export const WithDescriptions: Story = {
  render: () => {
    const [currentKey, setCurrentKey] = React.useState<Key>("profile");

    return (
      <Stepper
        aria-label="Account setup with descriptions"
        currentKey={currentKey}
        onCurrentChange={setCurrentKey}
      >
        {renderAccountItems()}
      </Stepper>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [currentKey, setCurrentKey] = React.useState<Key>("settings");

    return (
      <Stepper
        aria-label="Account setup with icons"
        currentKey={currentKey}
        onCurrentChange={setCurrentKey}
      >
        {renderAccountItems(true)}
      </Stepper>
    );
  },
};

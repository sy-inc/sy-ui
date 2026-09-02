import type {Meta, StoryObj} from "@storybook/react";

import {Icon} from "@iconify/react";

import {Chip} from "../chip";
import {Link} from "../link";

import {Timeline} from "./index";

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
} satisfies Meta<typeof Timeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Timeline aria-label="Release timeline">
      <Timeline.Item status="success">
        <Timeline.Rail />
        <Timeline.Content>
          <strong>Project created</strong>
          <span>Jan 12, 2026</span>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item status="current">
        <Timeline.Rail />
        <Timeline.Content>
          <strong>Private beta</strong>
          <span>In progress</span>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline>
  ),
};

const milestones = [
  ["Jan", "Private beta", "Invite-only access for early teams.", "gravity-ui:rocket"],
  ["Mar", "Usage-based pricing", "Flexible pricing for every stage.", "gravity-ui:credit-card"],
  ["May", "Regional launch", "Available across new regions.", "gravity-ui:globe"],
  ["Aug", "Partner network", "New integrations and partners.", "gravity-ui:persons"],
  ["Oct", "Enterprise controls", "Security controls for larger teams.", "gravity-ui:lock"],
  ["Dec", "Scale motion", "Built for the next phase of growth.", "gravity-ui:arrow-up-right"],
] as const;

const MilestoneItems = () =>
  milestones.map(([month, title, description, icon]) => (
    <Timeline.Item key={month} align="center">
      <Timeline.Rail>
        <Timeline.Marker>
          <Icon aria-hidden="true" icon={icon} />
        </Timeline.Marker>
      </Timeline.Rail>
      <Timeline.Content>
        <strong>{title}</strong>
        <span>{description}</span>
        <Link href="#timeline">{month} 2026</Link>
      </Timeline.Content>
    </Timeline.Item>
  ));

export const CenteredMilestones: Story = {
  render: () => (
    <div className="w-full max-w-[700px] min-w-0 py-4">
      <div className="mb-5 flex items-center justify-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <Chip color="accent" size="sm" variant="soft">
          2026 expansion
        </Chip>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <div className="sm:hidden">
        <Timeline aria-label="2026 expansion" density="compact" size="sm">
          <MilestoneItems />
        </Timeline>
      </div>
      <div className="hidden sm:block">
        <Timeline aria-label="2026 expansion" axis="center" placement="alternate" size="sm">
          <MilestoneItems />
        </Timeline>
      </div>
    </div>
  ),
};

const rolloutEvents = [
  [
    "Feature flag created",
    "Owner assigned",
    "default",
    "gravity-ui:flag",
    "09:12",
    <>
      Created <span className="font-medium text-foreground">checkout-redesign</span> for the billing
      workspace.
    </>,
  ],
  [
    "Canary rollout started",
    "Canary",
    "current",
    "gravity-ui:chart-line",
    "09:34",
    <>
      Enabled for <span className="font-medium text-foreground">5% of workspaces</span> with session
      replay sampling on.
    </>,
  ],
  [
    "Regional guardrail tripped",
    "Paused",
    "warning",
    "gravity-ui:shield-exclamation",
    "09:51",
    <>
      Latency climbed in <span className="font-medium text-foreground">eu-central-1</span>; rollout
      is holding while routing warms.
    </>,
  ],
  [
    "Customer messaging prepared",
    "Docs",
    "default",
    "gravity-ui:megaphone",
    "10:05",
    <>
      Support macro and changelog draft are ready in{" "}
      <Link className="text-xs" href="#">
        Launch notes
      </Link>
      .
    </>,
  ],
  [
    "Launch window scheduled",
    "Queued",
    "muted",
    "gravity-ui:clock",
    "10:30",
    "Full rollout waits for the next error-budget sweep.",
  ],
  [
    "Release checklist verified",
    "Ready",
    "success",
    "gravity-ui:circle-check",
    "10:42",
    "Rollback owner and dashboard checks are recorded in the release audit.",
  ],
] as const;

const chipColor = {
  current: "accent",
  default: "default",
  muted: "default",
  success: "success",
  warning: "warning",
} as const;

export const RolloutAudit: Story = {
  render: () => (
    <div className="w-full max-w-[560px] min-w-0">
      <div className="mb-4">
        <p className="m-0 text-xs font-medium text-muted">Rollout audit</p>
        <h3 className="m-0 text-base font-semibold text-foreground">Checkout redesign</h3>
      </div>
      <Timeline aria-label="Checkout redesign rollout" density="compact" size="sm">
        {rolloutEvents.map(([title, chip, status, icon, time, description]) => (
          <Timeline.Item key={title} align="center" status={status}>
            <Timeline.Rail>
              <Timeline.Marker>
                <Icon aria-hidden="true" icon={icon} />
              </Timeline.Marker>
            </Timeline.Rail>
            <Timeline.Content>
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h3 className="m-0 text-xs leading-5 font-medium text-foreground">{title}</h3>
                    <Chip color={chipColor[status]} size="sm" variant="soft">
                      {chip}
                    </Chip>
                  </div>
                  <p className="m-0 mt-1 text-xs leading-5 text-muted">{description}</p>
                </div>
                <time className="shrink-0 text-xs leading-5 text-muted">{time}</time>
              </div>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  ),
};

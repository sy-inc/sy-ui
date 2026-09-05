import type {Meta, StoryObj} from "@storybook/react";

import {KPI} from "../kpi";
import {Separator} from "../separator";

import {KPIGroup} from "./index";

const Metric = ({
  currency,
  from,
  percent,
  title,
  trend,
  trendDirection,
  value,
}: {
  currency?: boolean;
  from?: string;
  percent?: boolean;
  title: string;
  trend: string;
  trendDirection?: "down" | "neutral" | "up";
  value: number;
}) => (
  <KPI>
    <KPI.Header>
      <KPI.Title>{title}</KPI.Title>
    </KPI.Header>
    <KPI.Content>
      <KPI.Value
        value={percent ? value / 100 : value}
        formatOptions={
          currency
            ? {currency: "USD", maximumFractionDigits: 0, style: "currency"}
            : {maximumFractionDigits: 2, style: percent ? "percent" : "decimal"}
        }
      >
        {from
          ? (formatted) => (
              <>
                {formatted}
                <span className="ms-1 text-xs font-normal text-muted">from {from}</span>
              </>
            )
          : undefined}
      </KPI.Value>
      <KPI.Trend trend={trendDirection}>{trend}</KPI.Trend>
    </KPI.Content>
  </KPI>
);

const meta: Meta<typeof KPIGroup> = {
  title: "Components/KPIGroup",
  component: KPIGroup,
  decorators: [
    (Story) => (
      <div className="flex min-h-[calc(100vh-32px)] items-center">
        <Story />
      </div>
    ),
  ],
  parameters: {layout: "centered"},
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KPIGroup>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[900px] rounded-2xl p-6">
      <KPIGroup>
        <Metric title="Total Subscribers" trend="12%" value={71897} />
        <Separator />
        <Metric percent title="Avg. Open Rate" trend="2.02%" value={58.16} />
        <Separator />
        <Metric percent title="Avg. Click Rate" trend="4.05%" trendDirection="down" value={24.57} />
      </KPIGroup>
    </div>
  ),
};

export const WithFromSuffix: Story = {
  render: () => (
    <div className="w-[900px] rounded-2xl p-6">
      <KPIGroup>
        <Metric from="70,946" title="Total Subscribers" trend="12%" value={71897} />
        <Separator />
        <Metric percent from="56.14%" title="Avg. Open Rate" trend="2.02%" value={58.16} />
        <Separator />
        <Metric
          percent
          from="28.62%"
          title="Avg. Click Rate"
          trend="4.05%"
          trendDirection="down"
          value={24.57}
        />
      </KPIGroup>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="w-[240px]">
      <KPIGroup orientation="vertical">
        <Metric currency title="Revenue" trend="+3.3%" value={228451} />
        <Separator />
        <Metric currency title="Expenses" trend="-3.3%" trendDirection="down" value={25108} />
        <Separator />
        <Metric currency title="Profit" trend="+4.1%" value={203133} />
      </KPIGroup>
    </div>
  ),
};

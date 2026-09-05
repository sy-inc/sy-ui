import type {Meta, StoryObj} from "@storybook/react";
import type {ReactNode} from "react";

import {Icon} from "@iconify/react";
import {useId} from "react";
import {Area, AreaChart, ResponsiveContainer, Tooltip} from "recharts";

import {Link} from "../link";

import {KPI} from "./index";

const chartData = [
  {month: "Jan", value: 9200},
  {month: "Feb", value: 11000},
  {month: "Mar", value: 9800},
  {month: "Apr", value: 12400},
  {month: "May", value: 11800},
  {month: "Jun", value: 13900},
  {month: "Jul", value: 13200},
  {month: "Aug", value: 14600},
  {month: "Sep", value: 15500},
  {month: "Oct", value: 14900},
  {month: "Nov", value: 16600},
  {month: "Dec", value: 17400},
];
const tooltipData = [
  {month: "January", value: 12400},
  {month: "February", value: 13200},
  {month: "March", value: 12800},
  {month: "April", value: 15100},
  {month: "May", value: 14600},
  {month: "June", value: 16800},
  {month: "July", value: 17400},
  {month: "August", value: 16900},
  {month: "September", value: 18700},
  {month: "October", value: 19500},
  {month: "November", value: 19100},
  {month: "December", value: 21300},
];

const usd = {currency: "USD", maximumFractionDigits: 0, style: "currency"} as const;

/**
 * Recharts sparkline recipe. `KPI.Chart` is only a sized container; bring any chart library.
 */
const Sparkline = ({
  color,
  data,
  tooltip,
}: {
  color: string;
  data: typeof chartData;
  tooltip?: ReactNode;
}) => {
  const gradientId = useId();

  return (
    <ResponsiveContainer height="100%" width="100%">
      <AreaChart data={data} margin={{bottom: 0, left: 0, right: 0, top: 0}}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          dataKey="value"
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          stroke={color}
          strokeWidth={2}
          type="monotone"
        />
        {tooltip}
      </AreaChart>
    </ResponsiveContainer>
  );
};

const Metric = ({
  currency,
  title,
  trend,
  trendDirection,
  value,
}: {
  currency?: boolean;
  title: string;
  trend: string;
  trendDirection?: "up" | "down" | "neutral";
  value: number;
}) => (
  <KPI>
    <KPI.Header>
      <KPI.Title>{title}</KPI.Title>
    </KPI.Header>
    <KPI.Content>
      <KPI.Value formatOptions={currency ? usd : undefined} value={value} />
      <KPI.Trend trend={trendDirection}>{trend}</KPI.Trend>
    </KPI.Content>
  </KPI>
);

const HeaderIcon = ({
  color = "success",
  compact,
  icon,
}: {
  color?: "success" | "warning" | "danger";
  compact?: boolean;
  icon: string;
}) => (
  <KPI.Icon
    className={compact ? "size-4 rounded-none bg-transparent text-muted" : undefined}
    color={compact ? undefined : color}
  >
    <Icon icon={icon} />
  </KPI.Icon>
);

const meta: Meta<typeof KPI> = {
  title: "Components/KPI",
  component: KPI,
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
type Story = StoryObj<typeof KPI>;

export const Default: Story = {
  render: () => (
    <div className="grid w-[900px] grid-cols-1 gap-3 rounded-2xl p-6 sm:grid-cols-2 lg:grid-cols-4">
      <Metric currency title="Total Revenue" trend="+33%" value={228451} />
      <Metric currency title="Total Expenses" trend="+13.0%" trendDirection="down" value={71887} />
      <Metric currency title="Total Profit" trend="0.0%" trendDirection="neutral" value={156540} />
      <Metric title="New Customers" trend="+1.0%" value={1234} />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="grid w-[900px] grid-cols-1 gap-3 rounded-2xl p-6 sm:grid-cols-3">
      <KPI>
        <KPI.Header>
          <HeaderIcon icon="gravity-ui:persons" />
          <KPI.Title>Total Users</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value value={5400} />
          <KPI.Trend>+33%</KPI.Trend>
        </KPI.Content>
      </KPI>
      <KPI>
        <KPI.Header>
          <HeaderIcon color="warning" icon="gravity-ui:circle-dollar" />
          <KPI.Title>Total Sales</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value formatOptions={usd} value={15400} />
          <KPI.Trend trend="neutral">0.0%</KPI.Trend>
        </KPI.Content>
      </KPI>
      <KPI>
        <KPI.Header>
          <HeaderIcon color="danger" icon="gravity-ui:chart-line" />
          <KPI.Title>Net Profit</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value formatOptions={usd} value={10400} />
          <KPI.Trend trend="down">-3.3%</KPI.Trend>
        </KPI.Content>
      </KPI>
    </div>
  ),
};

export const WithProgress: Story = {
  render: () => (
    <div className="grid w-[900px] grid-cols-1 gap-3 rounded-2xl p-6 sm:grid-cols-3">
      <KPI>
        <KPI.Header>
          <HeaderIcon icon="gravity-ui:server" />
          <KPI.Title>Server Load</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value formatOptions={{maximumFractionDigits: 0, style: "percent"}} value={0.38} />
          <KPI.Progress value={38} />
        </KPI.Content>
      </KPI>
      <KPI>
        <KPI.Header>
          <HeaderIcon color="danger" icon="gravity-ui:server" />
          <KPI.Title>Server Load</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value formatOptions={{maximumFractionDigits: 0, style: "percent"}} value={0.98} />
          <KPI.Progress color="danger" value={98} />
        </KPI.Content>
      </KPI>
      <KPI>
        <KPI.Header>
          <HeaderIcon color="warning" icon="gravity-ui:cpu" />
          <KPI.Title>Average Memory Used</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value formatOptions={{maximumFractionDigits: 0, style: "percent"}} value={0.64} />
          <KPI.Progress color="warning" value={64} />
        </KPI.Content>
      </KPI>
    </div>
  ),
};

export const WithActions: Story = {
  render: () => (
    <div className="grid w-[900px] grid-cols-1 gap-3 rounded-2xl p-6 sm:grid-cols-3">
      <KPI>
        <KPI.Actions aria-label="Conversion rate actions" />
        <KPI.Header>
          <HeaderIcon icon="gravity-ui:chart-line" />
          <KPI.Title>Conversion Rate</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value formatOptions={{maximumFractionDigits: 1, style: "percent"}} value={0.038} />
          <KPI.Trend>+1.7%</KPI.Trend>
        </KPI.Content>
      </KPI>
      <KPI>
        <KPI.Actions aria-label="Bounce rate actions" />
        <KPI.Header>
          <HeaderIcon color="danger" icon="gravity-ui:server" />
          <KPI.Title>Bounce Rate</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value formatOptions={{maximumFractionDigits: 1, style: "percent"}} value={0.423} />
          <KPI.Trend trend="down">-5.9%</KPI.Trend>
        </KPI.Content>
      </KPI>
      <KPI>
        <KPI.Actions aria-label="Load time actions" />
        <KPI.Header>
          <HeaderIcon color="warning" icon="gravity-ui:clock" />
          <KPI.Title>Load Time</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value value={856} />
          <KPI.Progress color="warning" value={56} />
        </KPI.Content>
      </KPI>
    </div>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <div className="grid w-[900px] grid-cols-1 gap-3 rounded-2xl p-6 sm:grid-cols-2">
      <KPI>
        <KPI.Header>
          <HeaderIcon icon="gravity-ui:persons" />
          <KPI.Title>Total Subscribers</KPI.Title>
          <KPI.Trend>+122</KPI.Trend>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value value={71897} />
        </KPI.Content>
        <KPI.Footer>
          <Link className="text-sm text-foreground" href="#subscribers">
            View all
          </Link>
        </KPI.Footer>
      </KPI>
      <KPI>
        <KPI.Header>
          <HeaderIcon color="warning" icon="gravity-ui:circle-dollar" />
          <KPI.Title>Monthly Revenue</KPI.Title>
          <KPI.Trend>+20.1%</KPI.Trend>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value formatOptions={usd} value={45231} />
        </KPI.Content>
        <KPI.Footer>
          <Link className="text-sm text-foreground" href="#revenue">
            View report
          </Link>
        </KPI.Footer>
      </KPI>
    </div>
  ),
};

export const WithChartBottom: Story = {
  render: () => (
    <div className="w-[900px] rounded-2xl p-6">
      <div className="grid grid-cols-1 gap-3">
        <KPI>
          <KPI.Header>
            <KPI.Title>Total Revenue</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value formatOptions={usd} value={228451} />
            <KPI.Trend>+3.3%</KPI.Trend>
          </KPI.Content>
          <KPI.Chart>
            <Sparkline color="var(--success)" data={chartData} />
          </KPI.Chart>
        </KPI>
        <KPI>
          <KPI.Header>
            <KPI.Title>Baer Limited (BAL)</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value formatOptions={{...usd, maximumFractionDigits: 2}} value={49.33} />
            <KPI.Trend trend="down">-1.9%</KPI.Trend>
          </KPI.Content>
          <KPI.Chart>
            <Sparkline color="var(--danger)" data={[...chartData].reverse()} />
          </KPI.Chart>
        </KPI>
        <KPI>
          <KPI.Actions aria-label="Active users actions" />
          <KPI.Header>
            <HeaderIcon icon="gravity-ui:persons" />
            <KPI.Title>Active Users</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value formatOptions={{notation: "compact"}} value={100000} />
            <KPI.Trend trend="neutral">10.9%</KPI.Trend>
          </KPI.Content>
          <KPI.Chart height={60}>
            <Sparkline color="var(--accent)" data={chartData} />
          </KPI.Chart>
        </KPI>
      </div>
    </div>
  ),
};

const InlineMetric = ({
  color,
  icon,
  percent,
  title,
  trend,
  trendDirection,
  value,
  window,
}: {
  color: string;
  icon: string;
  percent?: boolean;
  title: string;
  trendDirection?: "up" | "down";
  trend: string;
  value: number;
  window: string;
}) => (
  <KPI>
    <KPI.Header>
      <Icon aria-hidden="true" className="size-4 text-muted" icon={icon} />
      <KPI.Title>{title}</KPI.Title>
    </KPI.Header>
    <KPI.Content className="grid-cols-[1fr_1fr] items-center">
      <div className="mt-1">
        <KPI.Value
          className="text-3xl leading-9"
          formatOptions={{maximumFractionDigits: 1, style: percent ? "percent" : "decimal"}}
          value={percent ? value / 100 : value}
        />
        <div className="mt-1 flex items-center gap-1">
          <KPI.Trend trend={trendDirection} variant="tertiary">
            {trend}
          </KPI.Trend>
          <span className="text-xs text-muted">{window}</span>
        </div>
      </div>
      <KPI.Chart height={70}>
        <Sparkline
          color={color}
          data={trendDirection === "down" ? [...chartData].reverse() : chartData}
        />
      </KPI.Chart>
    </KPI.Content>
  </KPI>
);

export const WithChartInline: Story = {
  render: () => (
    <div className="w-[900px] rounded-2xl p-6">
      <div className="grid grid-cols-1 gap-3">
        <InlineMetric
          color="var(--accent)"
          icon="gravity-ui:hand"
          title="Total Clicks"
          trend="3.5%"
          value={2441}
          window="last 30d"
        />
        <InlineMetric
          percent
          color="var(--danger)"
          icon="gravity-ui:circle-xmark"
          title="Bounce Rate"
          trend="5.9%"
          trendDirection="down"
          value={42.3}
          window="vs last 7d"
        />
      </div>
    </div>
  ),
};

export const WithChartTooltip: Story = {
  render: () => (
    <div className="w-[900px] rounded-2xl p-6">
      <KPI>
        <KPI.Header>
          <HeaderIcon icon="gravity-ui:circle-dollar" />
          <KPI.Title>Monthly Revenue</KPI.Title>
        </KPI.Header>
        <KPI.Content className="grid-cols-[1fr_1fr]">
          <div>
            <KPI.Value formatOptions={usd} value={21300} />
            <div className="flex items-center gap-1">
              <KPI.Trend variant="tertiary">11.5%</KPI.Trend>
              <span className="text-xs text-muted">last 30d</span>
            </div>
          </div>
          <KPI.Chart height={70}>
            <Sparkline
              color="var(--success)"
              data={tooltipData}
              tooltip={
                <Tooltip
                  cursor={{stroke: "var(--muted)", strokeDasharray: "3 3"}}
                  offset={0}
                  wrapperStyle={{pointerEvents: "none"}}
                  content={({active, payload}) => {
                    const entry = payload?.[0];
                    const month = entry?.payload?.month;
                    const amount = new Intl.NumberFormat("en-US", usd).format(
                      Number(entry?.value ?? 0),
                    );

                    return active && entry ? (
                      <div className="w-36 -translate-x-1/2 -translate-y-11 rounded-md bg-overlay p-3 text-xs shadow-overlay">
                        <div className="text-muted">{month}</div>
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
                          <span className="text-muted">Revenue</span>
                          <span className="font-semibold">{amount}</span>
                        </div>
                      </div>
                    ) : null;
                  }}
                />
              }
            />
          </KPI.Chart>
        </KPI.Content>
      </KPI>
    </div>
  ),
};

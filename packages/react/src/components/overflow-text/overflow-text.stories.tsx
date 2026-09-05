import type {Meta, StoryObj} from "@storybook/react";

import {KPI} from "../kpi";

import {OverflowText} from "./overflow-text";

const meta = {
  args: {
    autoScroll: true,
    children: "Quarterly revenue report — Southeast Asia regional performance, September 2026",
    className: "w-64",
    delay: 0,
    speed: 40,
  },
  component: OverflowText,
  parameters: {layout: "centered"},
  tags: ["autodocs"],
  title: "Components/OverflowText",
} satisfies Meta<typeof OverflowText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ShortText: Story = {args: {children: "Total revenue"}};
export const ManualScroll: Story = {args: {autoScroll: false}};
export const RTL: Story = {
  args: {children: "تقرير الإيرادات الفصلية لمنطقة جنوب شرق آسيا لشهر سبتمبر", dir: "rtl"},
};
export const WithKPI: Story = {
  render: () => (
    <KPI className="w-72">
      <KPI.Header>
        <KPI.Title className="min-w-0">
          <OverflowText>Quarterly revenue across all Southeast Asia markets</OverflowText>
        </KPI.Title>
      </KPI.Header>
      <KPI.Content className="flex-col items-start">
        <KPI.Value formatOptions={{currency: "USD", style: "currency"}} value={228451} />
        <KPI.Trend>+33%</KPI.Trend>
      </KPI.Content>
    </KPI>
  ),
};

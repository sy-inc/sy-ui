import type {Meta, StoryObj} from "@storybook/react";

import {Description} from "../description";
import {Table} from "../table";

import {Widget} from "./index";

const MockChart = () => (
  <svg
    aria-hidden="true"
    className="text-primary block h-[196px] w-full"
    focusable="false"
    viewBox="0 0 456 196"
  >
    <path
      d="M0 172H456M0 108H456M0 44H456"
      fill="none"
      stroke="currentColor"
      strokeOpacity="0.12"
    />
    <path
      d="M0 148L57 126L114 142L171 84L228 102L285 52L342 78L399 30L456 46"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
  </svg>
);

const meta: Meta<typeof Widget> = {
  title: "Components/Widget",
  component: Widget,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Widget>;

export const Default: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <Widget className="w-full max-w-[520px]">
        <Widget.Header>
          <Widget.Title>Monthly revenue</Widget.Title>
          <Widget.Legend>
            <Widget.LegendItem color="var(--primary)">Revenue</Widget.LegendItem>
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content>
          <MockChart />
        </Widget.Content>
      </Widget>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <Widget className="w-full max-w-[520px]">
        <Widget.Header>
          <div>
            <Widget.Title>Monthly revenue</Widget.Title>
            <Description className="leading-4">Compared with the previous month.</Description>
          </div>
          <Widget.Legend>
            <Widget.LegendItem color="var(--primary)">Revenue</Widget.LegendItem>
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content>
          <MockChart />
        </Widget.Content>
      </Widget>
    </div>
  ),
};

const members = [
  {id: 1, name: "Kate Moore", role: "CEO", status: "Active", email: "kate@acme.com"},
  {id: 2, name: "John Smith", role: "CTO", status: "Active", email: "john@acme.com"},
  {id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave", email: "sara@acme.com"},
  {id: 4, name: "Michael Brown", role: "CFO", status: "Active", email: "michael@acme.com"},
];

export const WithTable: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <Widget className="w-full max-w-[640px]">
        <Widget.Header>
          <Widget.Title>Team members</Widget.Title>
          <Description className="leading-4">{members.length} members</Description>
        </Widget.Header>
        <Widget.Content className="p-0">
          <Table variant="secondary">
            <Table.ScrollContainer>
              <Table.Content aria-label="Team members">
                <Table.Header className="sr-only">
                  <Table.Column isRowHeader>Name</Table.Column>
                  <Table.Column>Role</Table.Column>
                  <Table.Column>Status</Table.Column>
                  <Table.Column>Email</Table.Column>
                </Table.Header>
                <Table.Body>
                  {members.map((member) => (
                    <Table.Row key={member.id} id={member.id}>
                      <Table.Cell>{member.name}</Table.Cell>
                      <Table.Cell>{member.role}</Table.Cell>
                      <Table.Cell>{member.status}</Table.Cell>
                      <Table.Cell>{member.email}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Widget.Content>
      </Widget>
    </div>
  ),
};

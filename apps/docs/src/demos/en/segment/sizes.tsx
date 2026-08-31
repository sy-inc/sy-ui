import {Segment} from "@sy-inc/react";

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <Segment aria-label="Small dashboard navigation" defaultSelectedKey="dashboard" size="sm">
        <Segment.Item id="dashboard">Dashboard</Segment.Item>
        <Segment.Item id="analytics">Analytics</Segment.Item>
        <Segment.Item id="reports">Reports</Segment.Item>
        <Segment.Item id="settings">Settings</Segment.Item>
      </Segment>
      <Segment aria-label="Medium dashboard navigation" defaultSelectedKey="dashboard">
        <Segment.Item id="dashboard">Dashboard</Segment.Item>
        <Segment.Item id="analytics">Analytics</Segment.Item>
        <Segment.Item id="reports">Reports</Segment.Item>
        <Segment.Item id="settings">Settings</Segment.Item>
      </Segment>
      <Segment aria-label="Large dashboard navigation" defaultSelectedKey="dashboard" size="lg">
        <Segment.Item id="dashboard">Dashboard</Segment.Item>
        <Segment.Item id="analytics">Analytics</Segment.Item>
        <Segment.Item id="reports">Reports</Segment.Item>
        <Segment.Item id="settings">Settings</Segment.Item>
      </Segment>
    </div>
  );
}

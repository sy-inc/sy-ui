import {Segment} from "@sy-inc/react";

export function Basic() {
  return (
    <Segment aria-label="Dashboard navigation" defaultSelectedKey="dashboard">
      <Segment.Item id="dashboard">Dashboard</Segment.Item>
      <Segment.Item id="analytics">Analytics</Segment.Item>
      <Segment.Item id="reports">Reports</Segment.Item>
      <Segment.Item id="settings">Settings</Segment.Item>
    </Segment>
  );
}

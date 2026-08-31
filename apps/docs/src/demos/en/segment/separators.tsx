import {Segment} from "@sy-inc/react";

export function Separators() {
  return (
    <Segment separators aria-label="Dashboard navigation" defaultSelectedKey="dashboard">
      <Segment.Item id="dashboard">Dashboard</Segment.Item>
      <Segment.Item id="analytics">Analytics</Segment.Item>
      <Segment.Item id="reports">Reports</Segment.Item>
      <Segment.Item id="settings">Settings</Segment.Item>
    </Segment>
  );
}

import {Segment} from "@sy-inc/react";

export function Disabled() {
  return (
    <Segment aria-label="Disabled dashboard navigation" defaultSelectedKey="dashboard" isDisabled>
      <Segment.Item id="dashboard">Dashboard</Segment.Item>
      <Segment.Item id="analytics">Analytics</Segment.Item>
      <Segment.Item id="reports">Reports</Segment.Item>
      <Segment.Item id="settings">Settings</Segment.Item>
    </Segment>
  );
}

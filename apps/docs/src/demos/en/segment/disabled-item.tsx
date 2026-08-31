import {Segment} from "@sy-inc/react";

export function DisabledItem() {
  return (
    <Segment aria-label="Dashboard navigation" defaultSelectedKey="dashboard">
      <Segment.Item id="dashboard">Dashboard</Segment.Item>
      <Segment.Item isDisabled id="analytics">
        Analytics
      </Segment.Item>
      <Segment.Item id="reports">Reports</Segment.Item>
    </Segment>
  );
}

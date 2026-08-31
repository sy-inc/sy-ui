import {Segment} from "@sy-inc/react";

export function Basic() {
  return (
    <Segment aria-label="仪表板导航" defaultSelectedKey="dashboard">
      <Segment.Item id="dashboard">仪表板</Segment.Item>
      <Segment.Item id="analytics">分析</Segment.Item>
      <Segment.Item id="reports">报告</Segment.Item>
      <Segment.Item id="settings">设置</Segment.Item>
    </Segment>
  );
}

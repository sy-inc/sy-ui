import {Segment} from "@sy-inc/react";

export function Disabled() {
  return (
    <Segment aria-label="禁用的仪表板导航" defaultSelectedKey="dashboard" isDisabled>
      <Segment.Item id="dashboard">仪表板</Segment.Item>
      <Segment.Item id="analytics">分析</Segment.Item>
      <Segment.Item id="reports">报告</Segment.Item>
      <Segment.Item id="settings">设置</Segment.Item>
    </Segment>
  );
}

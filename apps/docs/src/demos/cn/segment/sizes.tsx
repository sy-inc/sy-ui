import {Segment} from "@sy-inc/react";

export function Sizes() {
  return (
    <div className="flex flex-col gap-3">
      <Segment aria-label="小尺寸仪表板导航" defaultSelectedKey="dashboard" size="sm">
        <Segment.Item id="dashboard">仪表板</Segment.Item>
        <Segment.Item id="analytics">分析</Segment.Item>
        <Segment.Item id="reports">报告</Segment.Item>
        <Segment.Item id="settings">设置</Segment.Item>
      </Segment>
      <Segment aria-label="中尺寸仪表板导航" defaultSelectedKey="dashboard">
        <Segment.Item id="dashboard">仪表板</Segment.Item>
        <Segment.Item id="analytics">分析</Segment.Item>
        <Segment.Item id="reports">报告</Segment.Item>
        <Segment.Item id="settings">设置</Segment.Item>
      </Segment>
      <Segment aria-label="大尺寸仪表板导航" defaultSelectedKey="dashboard" size="lg">
        <Segment.Item id="dashboard">仪表板</Segment.Item>
        <Segment.Item id="analytics">分析</Segment.Item>
        <Segment.Item id="reports">报告</Segment.Item>
        <Segment.Item id="settings">设置</Segment.Item>
      </Segment>
    </div>
  );
}

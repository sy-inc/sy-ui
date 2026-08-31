"use client";

import {Segment, type Key} from "@sy-inc/react";
import {useState} from "react";

export function Controlled() {
  const [selectedKey, setSelectedKey] = useState<Key | null>("analytics");
  return (
    <div className="flex flex-col gap-2">
      <Segment aria-label="仪表板导航" selectedKey={selectedKey} onSelectionChange={setSelectedKey}>
        <Segment.Item id="dashboard">仪表板</Segment.Item>
        <Segment.Item id="analytics">分析</Segment.Item>
        <Segment.Item id="reports">报告</Segment.Item>
        <Segment.Item id="settings">设置</Segment.Item>
      </Segment>
      <span className="text-sm text-muted">已选择：{selectedKey}</span>
    </div>
  );
}

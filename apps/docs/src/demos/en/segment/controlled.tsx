"use client";

import {Segment, type Key} from "@sy-inc/react";
import {useState} from "react";

export function Controlled() {
  const [selectedKey, setSelectedKey] = useState<Key | null>("analytics");
  return (
    <div className="flex flex-col gap-2">
      <Segment aria-label="Dashboard navigation" selectedKey={selectedKey} onSelectionChange={setSelectedKey}>
        <Segment.Item id="dashboard">Dashboard</Segment.Item>
        <Segment.Item id="analytics">Analytics</Segment.Item>
        <Segment.Item id="reports">Reports</Segment.Item>
        <Segment.Item id="settings">Settings</Segment.Item>
      </Segment>
      <span className="text-sm text-muted">Selected: {selectedKey}</span>
    </div>
  );
}

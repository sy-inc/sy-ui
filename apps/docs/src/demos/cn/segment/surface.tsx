import {Segment} from "@sy-inc/react";

export function Surface() {
  return (
    <div className="rounded-2xl bg-surface-secondary p-4">
      <Segment aria-label="下单方式" defaultSelectedKey="form" variant="surface">
        <Segment.Item id="form">表单</Segment.Item>
        <Segment.Item id="text">文本</Segment.Item>
      </Segment>
    </div>
  );
}

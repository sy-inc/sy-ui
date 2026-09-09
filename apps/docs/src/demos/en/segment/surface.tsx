import {Segment} from "@sy-inc/react";

export function Surface() {
  return (
    <div className="rounded-2xl bg-surface-secondary p-4">
      <Segment aria-label="Order mode" defaultSelectedKey="form" variant="surface">
        <Segment.Item id="form">Form</Segment.Item>
        <Segment.Item id="text">Text</Segment.Item>
      </Segment>
    </div>
  );
}

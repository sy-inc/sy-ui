"use client";

import {Icon} from "@iconify/react";
import {Segment} from "@sy-inc/react";

const items = [
  ["home", "Home", "gravity-ui:house"],
  ["chat", "Chat", "gravity-ui:comment"],
  ["meetings", "Meetings", "gravity-ui:calendar"],
  ["inbox", "Inbox", "gravity-ui:envelope"],
] as const;

export function IconExpand() {
  return (
    <Segment aria-label="Workspace navigation" defaultSelectedKey="meetings" variant="ghost">
      {items.map(([id, label, icon]) => (
        <Segment.Item key={id} aria-label={label} className="w-auto" id={id}>
          <>
            <Icon icon={icon} />
            <span className="segment__item-label">
              <span className="segment__item-label-inner">{label}</span>
            </span>
          </>
        </Segment.Item>
      ))}
    </Segment>
  );
}

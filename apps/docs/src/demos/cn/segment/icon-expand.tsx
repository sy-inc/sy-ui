"use client";

import {Icon} from "@iconify/react";
import {Segment} from "@sy-inc/react";

const items = [
  ["home", "主页", "gravity-ui:house"],
  ["chat", "聊天", "gravity-ui:comment"],
  ["meetings", "会议", "gravity-ui:calendar"],
  ["inbox", "收件箱", "gravity-ui:envelope"],
] as const;

export function IconExpand() {
  return (
    <Segment aria-label="工作区导航" defaultSelectedKey="meetings" variant="ghost">
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

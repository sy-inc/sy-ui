import {Icon} from "@iconify/react";
import {Segment} from "@sy-inc/react";

export function ThemeSwitcher() {
  return (
    <Segment aria-label="主题" defaultSelectedKey="system">
      <Segment.Item aria-label="浅色" id="light">
        <Icon icon="gravity-ui:sun" />
      </Segment.Item>
      <Segment.Item aria-label="深色" id="dark">
        <Icon icon="gravity-ui:moon" />
      </Segment.Item>
      <Segment.Item aria-label="系统" id="system">
        <Icon icon="gravity-ui:display" />
      </Segment.Item>
    </Segment>
  );
}

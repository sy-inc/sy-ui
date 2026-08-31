import {Icon} from "@iconify/react";
import {Segment} from "@sy-inc/react";

export function ThemeSwitcher() {
  return (
    <Segment aria-label="Theme" defaultSelectedKey="system">
      <Segment.Item aria-label="Light" id="light">
        <Icon icon="gravity-ui:sun" />
      </Segment.Item>
      <Segment.Item aria-label="Dark" id="dark">
        <Icon icon="gravity-ui:moon" />
      </Segment.Item>
      <Segment.Item aria-label="System" id="system">
        <Icon icon="gravity-ui:display" />
      </Segment.Item>
    </Segment>
  );
}

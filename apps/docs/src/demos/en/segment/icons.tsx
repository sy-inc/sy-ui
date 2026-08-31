import {Icon} from "@iconify/react";
import {Segment} from "@sy-inc/react";

export function Icons() {
  return (
    <Segment aria-label="Dashboard navigation" defaultSelectedKey="dashboard">
      <Segment.Item id="dashboard">
        <Icon icon="gravity-ui:layout-cells-large" />
        Dashboard
      </Segment.Item>
      <Segment.Item id="analytics">
        <Icon icon="gravity-ui:chart-column" />
        Analytics
      </Segment.Item>
      <Segment.Item id="team">
        <Icon icon="gravity-ui:persons" />
        Team
      </Segment.Item>
      <Segment.Item id="settings">
        <Icon icon="gravity-ui:gear" />
        Settings
      </Segment.Item>
    </Segment>
  );
}

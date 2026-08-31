import {Icon} from "@iconify/react";
import {Segment} from "@sy-inc/react";

export function Icons() {
  return (
    <Segment aria-label="仪表板导航" defaultSelectedKey="dashboard">
      <Segment.Item id="dashboard">
        <Icon icon="gravity-ui:layout-cells-large" />
        仪表板
      </Segment.Item>
      <Segment.Item id="analytics">
        <Icon icon="gravity-ui:chart-column" />
        分析
      </Segment.Item>
      <Segment.Item id="team">
        <Icon icon="gravity-ui:persons" />
        团队
      </Segment.Item>
      <Segment.Item id="settings">
        <Icon icon="gravity-ui:gear" />
        设置
      </Segment.Item>
    </Segment>
  );
}

import {Segment} from "@sy-inc/react";

export function Variants() {
  return (
    <Segment aria-label="日期范围" defaultSelectedKey="mtd" variant="ghost">
      <Segment.Item id="1w">1W</Segment.Item>
      <Segment.Item id="4w">4W</Segment.Item>
      <Segment.Item id="1y">1Y</Segment.Item>
      <Segment.Item id="mtd">MTD</Segment.Item>
      <Segment.Item id="qtd">QTD</Segment.Item>
      <Segment.Item id="ytd">YTD</Segment.Item>
      <Segment.Item id="all">ALL</Segment.Item>
    </Segment>
  );
}

"use client";

import {Table, useListData} from "@sy-inc/react";
import {useDragAndDrop} from "react-aria-components";

const users = [
  {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "首席执行官"},
  {email: "john@acme.com", id: 2, name: "John Smith", role: "首席技术官"},
  {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "首席营销官"},
  {email: "michael@acme.com", id: 4, name: "Michael Brown", role: "首席财务官"},
];

export function Reorder() {
  const list = useListData({initialItems: users});
  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    onReorder(event) {
      if (event.target.dropPosition === "before") {
        list.moveBefore(event.target.key, event.keys);
      } else if (event.target.dropPosition === "after") {
        list.moveAfter(event.target.key, event.keys);
      }
    },
  });

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="可排序团队成员"
          className="min-w-[600px]"
          dragAndDropHooks={dragAndDropHooks}
        >
          <Table.Header>
            <Table.Column>
              <span className="sr-only">排序</span>
            </Table.Column>
            <Table.Column isRowHeader>姓名</Table.Column>
            <Table.Column>角色</Table.Column>
            <Table.Column>邮箱</Table.Column>
          </Table.Header>
          <Table.Body items={list.items}>
            {(user) => (
              <Table.Row>
                <Table.Cell>
                  <Table.DragHandle />
                </Table.Cell>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

"use client";

import {Table} from "@sy-inc/react";

const users = [
  {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "首席执行官", status: "在职"},
  {email: "john@acme.com", id: 2, name: "John Smith", role: "首席技术官", status: "在职"},
  {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "首席运营官", status: "休假"},
  {
    email: "michael@acme.com",
    id: 4,
    name: "Michael Brown",
    role: "产品设计与研究负责人",
    status: "在职",
  },
  {email: "emily@acme.com", id: 5, name: "Emily Davis", role: "平台高级工程经理", status: "离职"},
  {email: "davis@acme.com", id: 6, name: "Davis Wilson", role: "客户成功总监", status: "在职"},
];

export function ManagedColumns() {
  return (
    <Table>
      <Table.ManagedColumns
        columns={[
          {id: "name", minWidth: 160, pinned: "start", width: 180},
          {flex: 1, id: "role", minWidth: 260},
          {id: "status", minWidth: 130, width: 130},
          {id: "email", minWidth: 260, width: 260},
          {id: "actions", pinned: "end", width: 100},
        ]}
      >
        <Table.ResizableContainer className="max-h-72 overflow-auto">
          <Table.Content aria-label="受管列">
            <Table.Header>
              <Table.Column isRowHeader id="name">
                姓名
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="role">
                <Table.Overflow tooltip>职责与组织角色</Table.Overflow>
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="status">
                状态
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="email">
                邮箱
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="actions">操作</Table.Column>
            </Table.Header>
            <Table.Body items={users}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>
                    <Table.Overflow tooltip>{user.role}</Table.Overflow>
                  </Table.Cell>
                  <Table.Cell>{user.status}</Table.Cell>
                  <Table.Cell>
                    <Table.Overflow tooltip>{user.email}</Table.Overflow>
                  </Table.Cell>
                  <Table.Cell>编辑</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
            <Table.Summary isSticky>
              <Table.Row id="summary">
                <Table.Cell>可见成员</Table.Cell>
                <Table.Cell>{users.length}</Table.Cell>
                <Table.Cell>—</Table.Cell>
                <Table.Cell>—</Table.Cell>
                <Table.Cell>—</Table.Cell>
              </Table.Row>
            </Table.Summary>
          </Table.Content>
        </Table.ResizableContainer>
      </Table.ManagedColumns>
    </Table>
  );
}

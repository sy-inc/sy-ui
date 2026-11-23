"use client";

import {Table} from "@sy-inc/react";

const users = [
  {
    email: "kate@acme.com",
    id: 1,
    name: "Kate Moore",
    role: "Chief Executive Officer",
    status: "Active",
  },
  {
    email: "john@acme.com",
    id: 2,
    name: "John Smith",
    role: "Chief Technology Officer",
    status: "Active",
  },
  {
    email: "sara@acme.com",
    id: 3,
    name: "Sara Johnson",
    role: "Chief Operating Officer",
    status: "On Leave",
  },
  {
    email: "michael@acme.com",
    id: 4,
    name: "Michael Brown",
    role: "Head of Product Design and Research",
    status: "Active",
  },
  {
    email: "emily@acme.com",
    id: 5,
    name: "Emily Davis",
    role: "Senior Engineering Manager, Platform",
    status: "Inactive",
  },
  {
    email: "davis@acme.com",
    id: 6,
    name: "Davis Wilson",
    role: "Director of Customer Success",
    status: "Active",
  },
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
          <Table.Content aria-label="Managed columns">
            <Table.Header>
              <Table.Column isRowHeader id="name">
                Name
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="role">
                <Table.Overflow tooltip>Responsibility and organizational role</Table.Overflow>
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="status">
                Status
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="email">
                Email
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="actions">Actions</Table.Column>
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
                  <Table.Cell>Edit</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
            <Table.Summary isSticky>
              <Table.Row id="summary">
                <Table.Cell>Visible members</Table.Cell>
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

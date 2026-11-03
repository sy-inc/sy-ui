"use client";

import {Table} from "@sy-inc/react";

const members = Array.from({length: 8}, (_, index) => ({
  depositAmount: (index + 1) * 1250,
  depositCount: index + 3,
  id: String(index + 1),
  name: `Member ${index + 1}`,
  withdrawAmount: (index + 1) * 480,
  withdrawCount: index + 1,
}));

export function ColumnGroups() {
  return (
    <Table>
      <Table.ManagedColumns
        columnGroups={[
          {columns: ["depositCount", "depositAmount"], id: "deposit", label: "Deposits"},
          {columns: ["withdrawCount", "withdrawAmount"], id: "withdraw", label: "Withdrawals"},
        ]}
        columns={[
          {id: "select", minWidth: 56, pinned: "start", width: 56},
          {id: "name", minWidth: 160, width: 180},
          {id: "depositCount", width: 140},
          {id: "depositAmount", width: 160},
          {id: "withdrawCount", width: 140},
          {id: "withdrawAmount", width: 160},
          {id: "actions", pinned: "end", width: 100},
        ]}
      >
        <Table.ResizableContainer className="max-h-72 overflow-auto">
          <Table.Content aria-label="Member deposits and withdrawals" selectionMode="multiple">
            <Table.Header>
              <Table.Column aria-label="Select rows" id="select">
                <Table.SelectionCheckbox aria-label="Select all rows" />
              </Table.Column>
              <Table.Column isRowHeader id="name">
                Name
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="depositCount">
                Count
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="depositAmount">
                Amount
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="withdrawCount">
                Count
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="withdrawAmount">
                Amount
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column id="actions">Actions</Table.Column>
            </Table.Header>
            <Table.Body items={members}>
              {(member) => (
                <Table.Row>
                  <Table.Cell>
                    <Table.SelectionCheckbox aria-label={`Select ${member.name}`} />
                  </Table.Cell>
                  <Table.Cell>{member.name}</Table.Cell>
                  <Table.Cell>{member.depositCount}</Table.Cell>
                  <Table.Cell>{member.depositAmount}</Table.Cell>
                  <Table.Cell>{member.withdrawCount}</Table.Cell>
                  <Table.Cell>{member.withdrawAmount}</Table.Cell>
                  <Table.Cell>Edit</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ResizableContainer>
      </Table.ManagedColumns>
    </Table>
  );
}

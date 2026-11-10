"use client";

import type {ReactNode} from "react";

import {Input, Table, TableStateContext} from "@sy-inc/react";
import {useContext, useState} from "react";

interface Reward {
  day: number;
  name: string;
  coins: string;
}

const initialRewards: Reward[] = [
  {coins: "100", day: 1, name: "Welcome bonus"},
  {coins: "150", day: 2, name: "Daily chest"},
  {coins: "200", day: 3, name: "Lucky spin"},
  {coins: "300", day: 4, name: "Rare chest"},
];

// Pauses the table's keyboard navigation (arrows, Home/End, type-ahead) while a field inside has focus.
function CellEditor({children}: {children: ReactNode}) {
  const state = useContext(TableStateContext);

  return (
    <div
      onBlur={() => state?.setKeyboardNavigationDisabled(false)}
      onFocus={() => state?.setKeyboardNavigationDisabled(true)}
    >
      {children}
    </div>
  );
}

export function EditableCells() {
  const [rewards, setRewards] = useState(initialRewards);

  const update = (day: number, patch: Partial<Reward>) =>
    setRewards((prev) => prev.map((r) => (r.day === day ? {...r, ...patch} : r)));

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Daily rewards" className="min-w-[520px]">
          <Table.Header>
            <Table.Column isRowHeader>Day</Table.Column>
            <Table.Column>Reward</Table.Column>
            <Table.Column>Coins</Table.Column>
          </Table.Header>
          <Table.Body items={rewards}>
            {(reward) => (
              <Table.Row id={reward.day}>
                <Table.Cell>Day {reward.day}</Table.Cell>
                <Table.Cell>
                  <CellEditor>
                    <Input
                      fullWidth
                      aria-label={`Day ${reward.day} reward`}
                      value={reward.name}
                      onChange={(e) => update(reward.day, {name: e.target.value})}
                    />
                  </CellEditor>
                </Table.Cell>
                <Table.Cell>
                  <CellEditor>
                    <Input
                      fullWidth
                      aria-label={`Day ${reward.day} coins`}
                      inputMode="numeric"
                      value={reward.coins}
                      onChange={(e) => update(reward.day, {coins: e.target.value})}
                    />
                  </CellEditor>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

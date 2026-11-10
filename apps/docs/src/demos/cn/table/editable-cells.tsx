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
  {coins: "100", day: 1, name: "新手礼包"},
  {coins: "150", day: 2, name: "每日宝箱"},
  {coins: "200", day: 3, name: "幸运转盘"},
  {coins: "300", day: 4, name: "稀有宝箱"},
];

// 格内输入框聚焦时暂停表格的键盘导航（方向键、Home/End、类型选择），失焦后恢复。
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
        <Table.Content aria-label="每日奖励" className="min-w-[520px]">
          <Table.Header>
            <Table.Column isRowHeader>天数</Table.Column>
            <Table.Column>奖励</Table.Column>
            <Table.Column>金币</Table.Column>
          </Table.Header>
          <Table.Body items={rewards}>
            {(reward) => (
              <Table.Row id={reward.day}>
                <Table.Cell>第 {reward.day} 天</Table.Cell>
                <Table.Cell>
                  <CellEditor>
                    <Input
                      fullWidth
                      aria-label={`第 ${reward.day} 天奖励`}
                      value={reward.name}
                      onChange={(e) => update(reward.day, {name: e.target.value})}
                    />
                  </CellEditor>
                </Table.Cell>
                <Table.Cell>
                  <CellEditor>
                    <Input
                      fullWidth
                      aria-label={`第 ${reward.day} 天金币`}
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

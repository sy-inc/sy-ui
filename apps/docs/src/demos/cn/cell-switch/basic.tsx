import {CellSwitch} from "@sy-inc/react";

export function Basic() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <CellSwitch defaultSelected>动画效果</CellSwitch>
      <CellSwitch>提示音</CellSwitch>
      <CellSwitch defaultSelected>触感反馈</CellSwitch>
    </div>
  );
}

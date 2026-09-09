import {CellSwitch} from "@sy-inc/react";

export function Basic() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <CellSwitch defaultSelected>Animations</CellSwitch>
      <CellSwitch>Sounds</CellSwitch>
      <CellSwitch defaultSelected>Haptics</CellSwitch>
    </div>
  );
}

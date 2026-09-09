import {CellSwitch} from "@sy-inc/react";

export function Variants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <CellSwitch defaultSelected>默认</CellSwitch>
      <CellSwitch defaultSelected variant="secondary">
        次要
      </CellSwitch>
    </div>
  );
}

import {CellSwitch} from "@sy-inc/react";

export function Variants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <CellSwitch defaultSelected>Default</CellSwitch>
      <CellSwitch defaultSelected variant="secondary">
        Secondary
      </CellSwitch>
    </div>
  );
}

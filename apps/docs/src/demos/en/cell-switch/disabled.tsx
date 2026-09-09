import {CellSwitch} from "@sy-inc/react";

export function Disabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <CellSwitch defaultSelected isDisabled>
        Enabled
      </CellSwitch>
      <CellSwitch isDisabled>Disabled</CellSwitch>
    </div>
  );
}

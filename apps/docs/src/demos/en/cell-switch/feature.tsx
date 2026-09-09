import {CellSwitch} from "@sy-inc/react";

export function Feature() {
  return (
    <div className="w-full max-w-sm">
      <CellSwitch
        badge="New"
        description="Keep your pages, meetings, and AI within reach."
        variant="feature"
      >
        Try the new sidebar
      </CellSwitch>
    </div>
  );
}

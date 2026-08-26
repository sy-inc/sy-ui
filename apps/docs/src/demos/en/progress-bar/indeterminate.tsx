import {Label, ProgressBar} from "@sy-ui/react";

export function Indeterminate() {
  return (
    <ProgressBar isIndeterminate aria-label="Loading" className="w-64">
      <Label>Loading...</Label>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}

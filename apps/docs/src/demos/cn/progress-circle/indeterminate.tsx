import {ProgressCircle} from "@sy-ui/react";

export function Indeterminate() {
  return (
    <ProgressCircle isIndeterminate aria-label="加载中">
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}

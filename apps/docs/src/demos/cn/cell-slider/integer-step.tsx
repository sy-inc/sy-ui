import {CellSlider} from "@sy-inc/react";

export function IntegerStep() {
  return (
    <div className="w-[252px]">
      <CellSlider defaultValue={75} label="音量" maxValue={100} minValue={0} step={1} />
    </div>
  );
}

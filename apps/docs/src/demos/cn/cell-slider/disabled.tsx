import {CellSlider} from "@sy-inc/react";

/** Shared 0–1 setup: the examples only differ by label, value and variant. */
const ratio = {
  defaultValue: 0.5,
  formatOptions: {maximumFractionDigits: 2, minimumFractionDigits: 2},
  maxValue: 1,
  minValue: 0,
  step: 0.01,
} as const;

export function Disabled() {
  return (
    <div className="flex w-[252px] flex-col gap-3">
      <CellSlider isDisabled label="间距" {...ratio} />
      <CellSlider isDisabled label="字号" {...ratio} defaultValue={0.3} />
    </div>
  );
}

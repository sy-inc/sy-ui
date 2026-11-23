import {CellSlider} from "@sy-inc/react";

/** Shared 0–1 setup: the examples only differ by label, value and variant. */
const ratio = {
  defaultValue: 0.5,
  formatOptions: {maximumFractionDigits: 2, minimumFractionDigits: 2},
  maxValue: 1,
  minValue: 0,
  step: 0.01,
} as const;

export function Variants() {
  return (
    <div className="flex w-[252px] flex-col gap-3">
      <span className="text-sm text-muted">default</span>
      <CellSlider label="Spacing" {...ratio} />
      <span className="text-sm text-muted">secondary</span>
      <CellSlider label="Spacing" variant="secondary" {...ratio} />
    </div>
  );
}

import {CellSlider} from "@sy-inc/react";

/** Shared 0–1 setup: the examples only differ by label, value and variant. */
const ratio = {
  defaultValue: 0.5,
  formatOptions: {maximumFractionDigits: 2, minimumFractionDigits: 2},
  maxValue: 1,
  minValue: 0,
  step: 0.01,
} as const;

export function SettingsGroup() {
  return (
    <div className="flex w-[252px] flex-col gap-3">
      <span className="text-sm text-muted">Density</span>
      <CellSlider label="Spacing" {...ratio} />
      <CellSlider label="Font Size" {...ratio} defaultValue={0.3} />
      <span className="text-sm text-muted">Corners</span>
      <CellSlider label="General Radius" {...ratio} />
      <CellSlider label="Forms Radius" {...ratio} defaultValue={0.3} />
    </div>
  );
}

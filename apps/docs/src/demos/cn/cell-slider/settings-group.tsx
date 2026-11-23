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
      <span className="text-sm text-muted">密度</span>
      <CellSlider label="间距" {...ratio} />
      <CellSlider label="字号" {...ratio} defaultValue={0.3} />
      <span className="text-sm text-muted">圆角</span>
      <CellSlider label="通用圆角" {...ratio} />
      <CellSlider label="表单圆角" {...ratio} defaultValue={0.3} />
    </div>
  );
}

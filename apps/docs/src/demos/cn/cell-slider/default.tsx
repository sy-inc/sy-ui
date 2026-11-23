import {CellSlider} from "@sy-inc/react";

export function Default() {
  return (
    <div className="w-[252px]">
      <CellSlider
        defaultValue={0.5}
        formatOptions={{maximumFractionDigits: 2, minimumFractionDigits: 2}}
        label="间距"
        maxValue={1}
        minValue={0}
        step={0.01}
      />
    </div>
  );
}

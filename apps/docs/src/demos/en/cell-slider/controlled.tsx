"use client";

import {CellSlider} from "@sy-inc/react";
import {useState} from "react";

export function Controlled() {
  const [value, setValue] = useState(0.5);

  return (
    <div className="flex w-[252px] flex-col gap-2">
      <CellSlider
        formatOptions={{maximumFractionDigits: 2, minimumFractionDigits: 2}}
        label="Spacing"
        maxValue={1}
        minValue={0}
        step={0.01}
        value={value}
        onChange={setValue}
      />
      <span className="text-sm text-muted">Value: {value.toFixed(2)}</span>
    </div>
  );
}

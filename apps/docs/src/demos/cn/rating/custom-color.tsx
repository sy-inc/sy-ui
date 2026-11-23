import type {CSSProperties} from "react";

import {Rating} from "@sy-inc/react";

const colors = [
  {label: "强调色", value: "var(--color-accent)"},
  {label: "危险色", value: "var(--color-danger)"},
  {label: "成功色", value: "var(--color-success)"},
];

export function CustomColor() {
  return (
    <div className="flex flex-col gap-4">
      {colors.map(({label, value}) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="text-xs leading-4 text-muted">{label}</span>
          <Rating
            aria-label={`${label}评分`}
            defaultValue={4}
            style={{"--rating-active-color": value} as CSSProperties}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <Rating.Item key={item} value={item} />
            ))}
          </Rating>
        </div>
      ))}
    </div>
  );
}

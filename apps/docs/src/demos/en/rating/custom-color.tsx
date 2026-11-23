import type {CSSProperties} from "react";

import {Rating} from "@sy-inc/react";

const colors = [
  {label: "Accent", value: "var(--color-accent)"},
  {label: "Danger", value: "var(--color-danger)"},
  {label: "Success", value: "var(--color-success)"},
];

export function CustomColor() {
  return (
    <div className="flex flex-col gap-4">
      {colors.map(({label, value}) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="text-xs leading-4 text-muted">{label}</span>
          <Rating
            aria-label={`${label} rating`}
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

import {Rating} from "@sy-inc/react";
import {Fragment} from "react";

const scores = [
  {label: "Quality", value: 4.5},
  {label: "Value for money", value: 3.7},
  {label: "Design", value: 5},
  {label: "Durability", value: 2.3},
];

export function ProductReview() {
  return (
    <div className="grid w-[300px] grid-cols-[1fr_auto_28px] items-center gap-x-2 gap-y-4">
      {scores.map(({label, value}) => (
        <Fragment key={label}>
          <span className="text-sm whitespace-nowrap text-foreground">{label}</span>
          <Rating isReadOnly aria-label={`${label}: ${value} stars`} size="sm" value={value}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Rating.Item key={item} value={item} />
            ))}
          </Rating>
          <span className="w-7 text-right text-xs leading-4 text-muted">{value}</span>
        </Fragment>
      ))}
    </div>
  );
}

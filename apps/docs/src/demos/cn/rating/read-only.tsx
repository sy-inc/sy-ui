import {Rating} from "@sy-inc/react";

export function ReadOnly() {
  return (
    <div className="flex flex-col gap-4">
      {[1.5, 2.3, 3.7, 4.2, 4.8].map((value) => (
        <div key={value} className="flex items-center gap-3">
          <Rating isReadOnly aria-label={`${value} 星`} value={value}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Rating.Item key={item} value={item} />
            ))}
          </Rating>
          <span className="text-sm text-muted">{value}</span>
        </div>
      ))}
    </div>
  );
}

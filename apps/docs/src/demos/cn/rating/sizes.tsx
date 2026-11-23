import {Rating} from "@sy-inc/react";

const sizes = ["sm", "md", "lg"] as const;

export function Sizes() {
  return (
    <div className="flex items-center gap-8">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <span className="text-xs leading-4 text-muted">{size}</span>
          <Rating aria-label={`${size} 评分`} defaultValue={3} size={size}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Rating.Item key={item} value={item} />
            ))}
          </Rating>
        </div>
      ))}
    </div>
  );
}

import {Label, Rating} from "@sy-inc/react";

export function WithLabel() {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Label>你会如何评价这款产品？</Label>
      <Rating aria-label="你会如何评价这款产品？">
        {[1, 2, 3, 4, 5].map((item) => (
          <Rating.Item key={item} value={item} />
        ))}
      </Rating>
    </div>
  );
}

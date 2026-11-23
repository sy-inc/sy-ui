import {Label, Rating} from "@sy-inc/react";

export function WithLabel() {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Label>How would you rate this product?</Label>
      <Rating aria-label="How would you rate this product?">
        {[1, 2, 3, 4, 5].map((item) => (
          <Rating.Item key={item} value={item} />
        ))}
      </Rating>
    </div>
  );
}

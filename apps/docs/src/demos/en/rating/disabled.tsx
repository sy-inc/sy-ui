import {Rating} from "@sy-inc/react";

export function Disabled() {
  return (
    <Rating isDisabled aria-label="Disabled rating" defaultValue={3}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Rating.Item key={item} value={item} />
      ))}
    </Rating>
  );
}

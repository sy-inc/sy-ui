import {Rating} from "@sy-inc/react";

export function Default() {
  return (
    <Rating aria-label="Rating" defaultValue={3}>
      <Rating.Item value={1} />
      <Rating.Item value={2} />
      <Rating.Item value={3} />
      <Rating.Item value={4} />
      <Rating.Item value={5} />
    </Rating>
  );
}

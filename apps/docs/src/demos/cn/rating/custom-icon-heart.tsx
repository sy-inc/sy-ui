import {Icon} from "@iconify/react";
import {Rating} from "@sy-inc/react";

export function CustomIconHeart() {
  return (
    <Rating aria-label="爱心评分" defaultValue={3} icon={<Icon icon="gravity-ui:heart-fill" />}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Rating.Item key={item} value={item} />
      ))}
    </Rating>
  );
}

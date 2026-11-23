import type {CSSProperties} from "react";

import {Icon} from "@iconify/react";
import {Rating} from "@sy-inc/react";

export function CustomIconPerItem() {
  return (
    <Rating
      aria-label="图标评分"
      defaultValue={3}
      style={{"--rating-active-color": "var(--color-danger)"} as CSSProperties}
    >
      {[1, 2, 3, 4, 5].map((item) => (
        <Rating.Item key={item} value={item}>
          <Icon icon="gravity-ui:heart-fill" />
        </Rating.Item>
      ))}
    </Rating>
  );
}

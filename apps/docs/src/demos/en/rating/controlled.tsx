"use client";

import {Rating} from "@sy-inc/react";
import {useState} from "react";

export function Controlled() {
  const [value, setValue] = useState(3);

  return (
    <div className="flex flex-col items-center gap-3">
      <Rating aria-label="Rating" value={value} onValueChange={setValue}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Rating.Item key={item} value={item} />
        ))}
      </Rating>
      <span className="text-sm text-muted">{value} stars</span>
    </div>
  );
}

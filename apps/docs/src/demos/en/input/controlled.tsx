"use client";

import {Input} from "@sy-inc/react";
import React from "react";

export function Controlled() {
  const [value, setValue] = React.useState("sy-inc.com");

  return (
    <div className="flex w-80 flex-col gap-2">
      <Input
        aria-label="Domain"
        placeholder="domain"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <span className="px-1 text-sm text-muted">https://{value || "your-domain"}</span>
    </div>
  );
}

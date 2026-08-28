"use client";

import {InputGroup, Label, TextField} from "@sy-inc/react";

export function WithTextPrefix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="sy-inc.com" name="website">
      <Label>网站</Label>
      <InputGroup>
        <InputGroup.Prefix>https://</InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[280px]" />
      </InputGroup>
    </TextField>
  );
}

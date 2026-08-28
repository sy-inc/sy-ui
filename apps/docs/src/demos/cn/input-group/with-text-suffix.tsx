"use client";

import {InputGroup, Label, TextField} from "@sy-inc/react";

export function WithTextSuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="sy-inc" name="website">
      <Label>网站</Label>
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

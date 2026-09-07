"use client";

import {InputGroup, Label, TextField} from "@sy-inc/react";

export function PasswordWithToggle() {
  return (
    <TextField className="w-full max-w-[280px]" name="password">
      <Label>Password</Label>
      <InputGroup>
        <InputGroup.Input
          className="w-full max-w-[280px]"
          defaultValue="87$2h.3diua"
          type="password"
        />
        <InputGroup.Suffix>
          <InputGroup.PasswordToggle />
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

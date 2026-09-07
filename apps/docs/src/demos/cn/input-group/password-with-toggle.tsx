"use client";

import {InputGroup, Label, TextField} from "@sy-inc/react";

export function PasswordWithToggle() {
  return (
    <TextField className="w-full max-w-[280px]" name="password">
      <Label>密码</Label>
      <InputGroup>
        <InputGroup.Input
          className="w-full max-w-[280px]"
          defaultValue="87$2h.3diua"
          type="password"
        />
        <InputGroup.Suffix>
          <InputGroup.PasswordToggle hideLabel="隐藏密码" showLabel="显示密码" />
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

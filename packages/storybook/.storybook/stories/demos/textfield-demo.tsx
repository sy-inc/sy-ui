// Portions adapted from HeroUI v3.2.7 (Apache-2.0); modified for SY INC.
// Copyright 2025 NextUI Inc.
import {Description, FieldError, Input, Label, TextField} from "@sy-inc/react";
import React from "react";

export function TextfieldDemo() {
  return (
    <div className="w-full max-w-[256px]">
      <TextField isRequired className="items-start" name="name">
        <Label>Your email</Label>
        <Input className="w-full" placeholder="john@email.com" />
        <Description className="mt-0.5">We'll never share this with anyone else</Description>
        <FieldError>The email is invalid</FieldError>
      </TextField>
    </div>
  );
}

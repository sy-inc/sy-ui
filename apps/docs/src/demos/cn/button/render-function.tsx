"use client";

import {Button} from "@sy-ui/react";

export function RenderFunction() {
  return (
    <Button
      render={(props, {isPressed}) => (
        <button {...props} data-custom={isPressed ? "pressed" : "bar"} />
      )}
    >
      点按
    </Button>
  );
}

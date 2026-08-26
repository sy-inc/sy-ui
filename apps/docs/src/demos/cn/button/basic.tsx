"use client";

import {Button} from "@sy-ui/react";

export function Basic() {
  return <Button onPress={() => console.log("按钮已按下")}>点我</Button>;
}

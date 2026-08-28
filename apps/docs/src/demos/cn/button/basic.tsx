"use client";

import {Button} from "@sy-inc/react";

export function Basic() {
  return <Button onPress={() => console.log("按钮已按下")}>点我</Button>;
}

"use client";

import {Switch} from "@sy-ui/react";

export function RenderProps() {
  return (
    <Switch>
      {({isSelected}) => (
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          {isSelected ? "已开启" : "已关闭"}
        </Switch.Content>
      )}
    </Switch>
  );
}

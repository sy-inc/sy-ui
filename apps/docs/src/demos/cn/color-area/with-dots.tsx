import {ColorArea} from "@sy-ui/react";

export function ColorAreaWithDots() {
  return (
    <ColorArea showDots defaultValue="hsl(200, 100%, 50%)">
      <ColorArea.Thumb />
    </ColorArea>
  );
}

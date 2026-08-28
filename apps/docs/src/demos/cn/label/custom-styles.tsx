import {Input, Label} from "@sy-inc/react";

export function CustomStyles() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold tracking-wide text-accent uppercase" htmlFor="repo">
        仓库
      </Label>
      <Input className="w-64 bg-field" id="repo" placeholder="sy-ui/react" />
    </div>
  );
}

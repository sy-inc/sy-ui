import {TextArea} from "@sy-inc/react";

export function AutoGrow() {
  return (
    <div className="w-[280px]">
      <TextArea autoGrow fullWidth placeholder="Grows with content" rows={1} />
    </div>
  );
}

import {TextArea} from "@sy-inc/react";

export function AutoGrow() {
  return (
    <div className="w-[280px]">
      <TextArea autoGrow fullWidth placeholder="随内容增高" rows={1} />
    </div>
  );
}

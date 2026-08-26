import {TextArea} from "@sy-ui/react";

export function FullWidth() {
  return (
    <div className="w-[400px] space-y-3">
      <TextArea fullWidth placeholder="Full width textarea" />
    </div>
  );
}

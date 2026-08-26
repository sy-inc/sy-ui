import {Input} from "@sy-ui/react";

export function Variants() {
  return (
    <div className="flex w-[240px] flex-col gap-2">
      <Input fullWidth placeholder="Primary input" variant="primary" />
      <Input fullWidth placeholder="Secondary input" variant="secondary" />
    </div>
  );
}

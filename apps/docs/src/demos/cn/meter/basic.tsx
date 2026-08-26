import {Label, Meter} from "@sy-ui/react";

export function Basic() {
  return (
    <Meter aria-label="存储空间" className="w-64" value={60}>
      <Label>存储空间</Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}

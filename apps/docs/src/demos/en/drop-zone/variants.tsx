"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Variants() {
  const bordered = useDropZoneState();
  const flat = useDropZoneState();
  const faded = useDropZoneState();

  return (
    <div className="flex w-[380px] flex-col gap-4">
      <DropZone>
        <Label>bordered</Label>
        <Description>The default dashed outline.</Description>
        <DropZone.Area {...bordered.getAreaProps()} aria-label="Bordered drop zone">
          <DropZone.Slots state={bordered} />
        </DropZone.Area>
      </DropZone>
      <DropZone variant="flat">
        <Label>flat</Label>
        <Description>No border, filled surface.</Description>
        <DropZone.Area {...flat.getAreaProps()} aria-label="Flat drop zone">
          <DropZone.Slots state={flat} />
        </DropZone.Area>
      </DropZone>
      <DropZone variant="faded">
        <Label>faded</Label>
        <Description>Softened border and surface.</Description>
        <DropZone.Area {...faded.getAreaProps()} aria-label="Faded drop zone">
          <DropZone.Slots state={faded} />
        </DropZone.Area>
      </DropZone>
    </div>
  );
}

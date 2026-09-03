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
        <Description>默认的虚线边框。</Description>
        <DropZone.Area {...bordered.getAreaProps()} aria-label="默认样式上传区">
          <DropZone.Slots state={bordered} />
        </DropZone.Area>
      </DropZone>
      <DropZone variant="flat">
        <Label>flat</Label>
        <Description>无边框，带底色。</Description>
        <DropZone.Area {...flat.getAreaProps()} aria-label="扁平样式上传区">
          <DropZone.Slots state={flat} />
        </DropZone.Area>
      </DropZone>
      <DropZone variant="faded">
        <Label>faded</Label>
        <Description>更浅的边框与底色。</Description>
        <DropZone.Area {...faded.getAreaProps()} aria-label="浅色样式上传区">
          <DropZone.Slots state={faded} />
        </DropZone.Area>
      </DropZone>
    </div>
  );
}

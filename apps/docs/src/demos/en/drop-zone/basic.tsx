"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Basic() {
  const state = useDropZoneState();

  return (
    <DropZone className="w-[380px]">
      <Label>Attachments</Label>
      <Description>PDF, DOCX, PNG, or JPG up to 10 MB.</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload a file">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

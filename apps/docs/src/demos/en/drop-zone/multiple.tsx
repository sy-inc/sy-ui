"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Multiple() {
  const state = useDropZoneState({maxFiles: 3});

  return (
    <DropZone className="w-[380px]">
      <Label>Multiple attachments</Label>
      <Description>
        Drop several files together. The add slot stays at the end until full.
      </Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload multiple files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

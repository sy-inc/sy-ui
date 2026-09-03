"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Clear() {
  const state = useDropZoneState({maxFiles: 3});

  return (
    <DropZone className="w-[380px]">
      <Label>Clearable attachments</Label>
      <Description>Choose several files, then clear every card at once.</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {state.files.length > 0 && <DropZone.ClearTrigger onPress={state.clear} />}
    </DropZone>
  );
}

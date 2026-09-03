"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Disabled() {
  const state = useDropZoneState({isDisabled: true});

  return (
    <DropZone className="w-[380px]">
      <Label>Uploads are unavailable</Label>
      <Description>Try again after the form is complete.</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

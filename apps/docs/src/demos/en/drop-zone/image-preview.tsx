"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function ImagePreview() {
  const state = useDropZoneState({accept: "image/*", maxFiles: 3});

  return (
    <DropZone className="w-[380px]">
      <Label>Image attachments</Label>
      <Description>PNG, JPG, GIF, or WebP. Use the eye button to expand each preview.</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload images">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

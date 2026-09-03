"use client";

import type {DropZoneFile} from "@sy-inc/react";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

const restoredFile: DropZoneFile = {
  id: "restored-cover",
  name: "cover.png",
  previewUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=640&q=80",
  progress: 1,
  size: 2_517_000,
  status: "complete",
  type: "image/png",
};

export function Restored() {
  const state = useDropZoneState({defaultFileList: [restoredFile], maxFiles: 3});

  return (
    <DropZone className="w-[380px]">
      <Label>Restored attachment</Label>
      <Description>
        This entry came from a server response and uses previewUrl for its image.
      </Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

"use client";

import type {DropZoneFile} from "@sy-inc/react";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";
import {useState} from "react";

export function Controlled() {
  const [fileList, setFileList] = useState<DropZoneFile[]>([]);
  const state = useDropZoneState({fileList, maxFiles: 3, onChange: setFileList});

  return (
    <DropZone className="w-[380px]">
      <Label>Controlled attachments</Label>
      <Description>{fileList.length} of 3 selected.</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {fileList.length > 0 && <DropZone.ClearTrigger onPress={state.clear} />}
    </DropZone>
  );
}

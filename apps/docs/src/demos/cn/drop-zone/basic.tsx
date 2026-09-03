"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Basic() {
  const state = useDropZoneState();

  return (
    <DropZone className="w-[380px]">
      <Label>附件</Label>
      <Description>支持 PDF、DOCX、PNG、JPG，单个不超过 10 MB。</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="上传文件">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

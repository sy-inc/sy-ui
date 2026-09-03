"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Clear() {
  const state = useDropZoneState({maxFiles: 3});

  return (
    <DropZone className="w-[380px]">
      <Label>可清空的附件</Label>
      <Description>选择多个文件后，可一次清除所有卡片。</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="上传文件">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {state.files.length > 0 && <DropZone.ClearTrigger onPress={state.clear} />}
    </DropZone>
  );
}

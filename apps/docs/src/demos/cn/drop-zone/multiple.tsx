"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Multiple() {
  const state = useDropZoneState({maxFiles: 3});

  return (
    <DropZone className="w-[380px]">
      <Label>多个附件</Label>
      <Description>可同时拖入多个文件，添加方块会一直位于末尾，直到达到上限。</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="上传多个文件">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

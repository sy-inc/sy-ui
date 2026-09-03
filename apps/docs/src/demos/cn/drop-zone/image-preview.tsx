"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function ImagePreview() {
  const state = useDropZoneState({accept: "image/*", maxFiles: 3});

  return (
    <DropZone className="w-[380px]">
      <Label>图片附件</Label>
      <Description>支持 PNG、JPG、GIF、WebP。点击眼睛按钮展开每张预览。</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="上传图片">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

"use client";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";

export function Disabled() {
  const state = useDropZoneState({isDisabled: true});

  return (
    <DropZone className="w-[380px]">
      <Label>当前无法上传文件</Label>
      <Description>请先完成表单后再试。</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="上传文件">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
}

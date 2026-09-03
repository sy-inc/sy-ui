"use client";

import type {DropZoneFile} from "@sy-inc/react";

import {Description, DropZone, Label, useDropZoneState} from "@sy-inc/react";
import {useState} from "react";

export function Controlled() {
  const [fileList, setFileList] = useState<DropZoneFile[]>([]);
  const state = useDropZoneState({fileList, maxFiles: 3, onChange: setFileList});

  return (
    <DropZone className="w-[380px]">
      <Label>受控附件</Label>
      <Description>已选择 {fileList.length} / 3 个文件。</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="上传文件">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {fileList.length > 0 && <DropZone.ClearTrigger onPress={state.clear} />}
    </DropZone>
  );
}

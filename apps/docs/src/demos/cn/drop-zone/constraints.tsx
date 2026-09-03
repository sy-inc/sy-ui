"use client";

import {Description, DropZone, ErrorMessage, Label, useDropZoneState} from "@sy-inc/react";

export function Constraints() {
  const state = useDropZoneState({
    accept: ["image/png", ".pdf"],
    errorMessage: {
      fileTooLarge: "单个文件不能超过 5 MB。",
      invalidFileType: "只接受 PNG 图片或 PDF 文档。",
      tooManyFiles: "每次最多上传 2 个文件。",
    },
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 2,
  });

  return (
    <DropZone className="w-[380px]">
      <Label>附件</Label>
      <Description>PNG 或 PDF，最多 2 个文件，单个不超过 5 MB。</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="上传文件">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {!!state.validationError && <ErrorMessage>{state.validationError.message}</ErrorMessage>}
    </DropZone>
  );
}

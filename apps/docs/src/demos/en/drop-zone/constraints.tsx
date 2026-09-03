"use client";

import {Description, DropZone, ErrorMessage, Label, useDropZoneState} from "@sy-inc/react";

export function Constraints() {
  const state = useDropZoneState({
    accept: ["image/png", ".pdf"],
    errorMessage: {
      fileTooLarge: "Each file must stay under 5 MB.",
      invalidFileType: "Only PNG images or PDF documents are accepted.",
      tooManyFiles: "Maximum 2 files per upload.",
    },
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 2,
  });

  return (
    <DropZone className="w-[380px]">
      <Label>Attachments</Label>
      <Description>PNG or PDF, up to 2 files, 5 MB each.</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {!!state.validationError && <ErrorMessage>{state.validationError.message}</ErrorMessage>}
    </DropZone>
  );
}

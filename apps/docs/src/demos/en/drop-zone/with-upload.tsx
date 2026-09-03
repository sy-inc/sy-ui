"use client";

import type {DropZoneUploadContext} from "@sy-inc/react";

import {Description, DropZone, ErrorMessage, Label, useDropZoneState} from "@sy-inc/react";

/** Stand-in for a real request: reports progress, rejects any file named "fail". */
const uploadFile = (file: File, {onProgress, signal}: DropZoneUploadContext) =>
  new Promise<{url: string}>((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += 0.2;

      if (progress < 1) {
        onProgress(progress);

        return;
      }

      clearInterval(timer);

      if (file.name.includes("fail")) {
        reject(new Error("The server rejected the upload."));
      } else {
        resolve({url: `https://files.example.com/${file.name}`});
      }
    }, 400);

    signal.addEventListener("abort", () => clearInterval(timer));
  });

export function WithUpload() {
  const state = useDropZoneState<{url: string}>({
    accept: "image/*,.pdf",
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 3,
    onUpload: uploadFile,
  });
  const {validationError} = state;

  return (
    <DropZone className="w-[380px]">
      <Label>Uploads</Label>
      <Description>
        Name a file &ldquo;fail&rdquo; to see the inline error and retry action.
      </Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {!!validationError && <ErrorMessage>{validationError.message}</ErrorMessage>}
    </DropZone>
  );
}

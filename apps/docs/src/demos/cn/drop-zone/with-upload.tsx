"use client";

import type {DropZoneUploadContext} from "@sy-inc/react";

import {Description, DropZone, ErrorMessage, Label, useDropZoneState} from "@sy-inc/react";

/** 模拟真实请求：上报进度，文件名含 "fail" 时失败。 */
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
        reject(new Error("服务端拒绝了这次上传。"));
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
      <Label>上传文件</Label>
      <Description>把文件名改成含 &ldquo;fail&rdquo; 可以看到卡片内的错误和重试操作。</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="上传文件">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {!!validationError && <ErrorMessage>{validationError.message}</ErrorMessage>}
    </DropZone>
  );
}

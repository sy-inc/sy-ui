import type {ComponentProps} from "react";

import {
  DropZoneArea,
  DropZoneClearTrigger,
  DropZoneFileFormatIcon,
  DropZoneFileHeader,
  DropZoneFileInfo,
  DropZoneFileItem,
  DropZoneFileMeta,
  DropZoneFileName,
  DropZoneFileProgress,
  DropZoneFileRemoveTrigger,
  DropZoneFileRetryTrigger,
  DropZonePreviewPanel,
  DropZonePreviewTrigger,
  DropZoneRoot,
  DropZoneSlots,
  DropZoneTrigger,
} from "./drop-zone";

export const DropZone = Object.assign(DropZoneRoot, {
  Area: DropZoneArea,
  ClearTrigger: DropZoneClearTrigger,
  FileFormatIcon: DropZoneFileFormatIcon,
  FileHeader: DropZoneFileHeader,
  FileInfo: DropZoneFileInfo,
  FileItem: DropZoneFileItem,
  FileMeta: DropZoneFileMeta,
  FileName: DropZoneFileName,
  FileProgress: DropZoneFileProgress,
  FileRemoveTrigger: DropZoneFileRemoveTrigger,
  FileRetryTrigger: DropZoneFileRetryTrigger,
  PreviewPanel: DropZonePreviewPanel,
  PreviewTrigger: DropZonePreviewTrigger,
  Root: DropZoneRoot,
  Slots: DropZoneSlots,
  Trigger: DropZoneTrigger,
});

export type DropZone = {
  AreaProps: ComponentProps<typeof DropZoneArea>;
  ClearTriggerProps: ComponentProps<typeof DropZoneClearTrigger>;
  FileFormatIconProps: ComponentProps<typeof DropZoneFileFormatIcon>;
  FileHeaderProps: ComponentProps<typeof DropZoneFileHeader>;
  FileInfoProps: ComponentProps<typeof DropZoneFileInfo>;
  FileItemProps: ComponentProps<typeof DropZoneFileItem>;
  FileMetaProps: ComponentProps<typeof DropZoneFileMeta>;
  FileNameProps: ComponentProps<typeof DropZoneFileName>;
  FileProgressProps: ComponentProps<typeof DropZoneFileProgress>;
  FileRemoveTriggerProps: ComponentProps<typeof DropZoneFileRemoveTrigger>;
  FileRetryTriggerProps: ComponentProps<typeof DropZoneFileRetryTrigger>;
  PreviewPanelProps: ComponentProps<typeof DropZonePreviewPanel>;
  PreviewTriggerProps: ComponentProps<typeof DropZonePreviewTrigger>;
  Props: ComponentProps<typeof DropZoneRoot>;
  RootProps: ComponentProps<typeof DropZoneRoot>;
  SlotsProps: ComponentProps<typeof DropZoneSlots>;
  TriggerProps: ComponentProps<typeof DropZoneTrigger>;
};

export {
  DropZoneRoot,
  DropZoneArea,
  DropZoneTrigger,
  DropZoneClearTrigger,
  DropZoneSlots,
  DropZoneFileItem,
  DropZoneFileHeader,
  DropZoneFileFormatIcon,
  DropZoneFileInfo,
  DropZoneFileName,
  DropZoneFileMeta,
  DropZoneFileProgress,
  DropZoneFileRetryTrigger,
  DropZoneFileRemoveTrigger,
  DropZonePreviewTrigger,
  DropZonePreviewPanel,
};
export type {
  DropZoneRootProps,
  DropZoneRootProps as DropZoneProps,
  DropZoneAreaProps,
  DropZoneTriggerProps,
  DropZoneClearTriggerProps,
  DropZoneSlotsProps,
  DropZoneFileItemProps,
  DropZoneFileHeaderProps,
  DropZoneFileFormatIconProps,
  DropZoneFileInfoProps,
  DropZoneFileNameProps,
  DropZoneFileMetaProps,
  DropZoneFileProgressProps,
  DropZoneFileRetryTriggerProps,
  DropZoneFileRemoveTriggerProps,
  DropZonePreviewTriggerProps,
  DropZonePreviewPanelProps,
} from "./drop-zone";
export {dropZoneVariants} from "@sy-inc/styles";
export type {DropZoneVariants} from "@sy-inc/styles";

export {useDropZoneState} from "./use-drop-zone-state";
export type {
  DropZoneAreaPropsOverrides,
  DropZoneErrorMessages,
  DropZoneFile,
  DropZoneFileStatus,
  DropZoneMessages,
  DropZoneTriggerPropsOverrides,
  DropZoneUploadContext,
  DropZoneValidationError,
  DropZoneValidationErrorCode,
  UseDropZoneStateProps,
  UseDropZoneStateResult,
} from "./use-drop-zone-state";
export {formatFileSize, formatFileType, getFileFormatColor, isImageFile} from "./drop-zone-utils";
export type {DropZoneFileFormatColor} from "./drop-zone-utils";

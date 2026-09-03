import type {
  DropZoneFile,
  UseDropZoneStateProps,
  UseDropZoneStateResult,
} from "@/components/drop-zone";
import type {DropItem} from "@react-types/shared";

import {useEffect, useState} from "react";

import {DropZone, useDropZoneState} from "@/components/drop-zone";
import {ErrorMessage} from "@/components/error-message";

import {createDropEvent, createFileDropItem} from "./drop-items";

export interface UploadDropZoneProps extends UseDropZoneStateProps {
  droppedFiles?: File[];
  droppedItems?: DropItem[];
  onState?: (state: UseDropZoneStateResult) => void;
  variant?: "bordered" | "flat" | "faded";
}

/** The documented final API: one Area, its Slots, and an external validation message. */
export const UploadDropZone = ({
  droppedFiles = [],
  droppedItems,
  onState,
  variant,
  ...props
}: UploadDropZoneProps) => {
  const state = useDropZoneState(props);

  useEffect(() => onState?.(state), [onState, state]);

  return (
    <DropZone variant={variant}>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {!!state.validationError && <ErrorMessage>{state.validationError.message}</ErrorMessage>}
      <button
        type="button"
        onClick={() =>
          state.addFiles(createDropEvent(droppedItems ?? droppedFiles.map(createFileDropItem)))
        }
      >
        Drop files
      </button>
      <DropZone.ClearTrigger onPress={state.clear}>Clear</DropZone.ClearTrigger>
    </DropZone>
  );
};

export const ControlledUploadDropZone = ({
  isChangeApplied = true,
  onChange,
  ...props
}: UploadDropZoneProps & {isChangeApplied?: boolean}) => {
  const [fileList, setFileList] = useState<DropZoneFile[]>([]);

  return (
    <UploadDropZone
      {...props}
      fileList={fileList}
      onChange={(next) => {
        onChange?.(next);
        if (isChangeApplied) setFileList(next);
      }}
    />
  );
};

"use client";

import type {DropEvent, DropItem} from "@react-types/shared";
import type {ReactNode} from "react";

import {useControlledState} from "@react-stately/utils";
import {useEffect, useRef, useState} from "react";

import {formatFileSize, formatFileType, isImageFile} from "./drop-zone-utils";

export type DropZoneFileStatus = "idle" | "uploading" | "complete" | "failed";

export interface DropZoneFile<TResult = unknown> {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  previewUrl?: string;
  status: DropZoneFileStatus;
  progress: number;
  result?: TResult;
  error?: unknown;
  errorMessage?: ReactNode;
}

export type DropZoneValidationErrorCode = "tooManyFiles" | "invalidFileType" | "fileTooLarge";

export interface DropZoneValidationError {
  code: DropZoneValidationErrorCode;
  files: File[];
  accept: string[];
  maxFiles: number;
  maxFileSize?: number;
  message: ReactNode;
}

export type DropZoneErrorMessages = Partial<Record<DropZoneValidationErrorCode, ReactNode>>;

export interface DropZoneMessages<TResult = unknown> {
  uploaded?: (file: DropZoneFile<TResult>) => string;
  uploadFailed?: (file: DropZoneFile<TResult>) => string;
}

export interface DropZoneUploadContext {
  onProgress: (progress: number) => void;
  signal: AbortSignal;
}

const toAcceptList = (accept?: string | string[]) =>
  (Array.isArray(accept) ? accept : (accept?.split(",") ?? []))
    .map((value) => value.trim())
    .filter(Boolean);

const accepts = (file: File, accept: string[]) => {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return accept.some((entry) => {
    const value = entry.toLowerCase();

    if (value.startsWith(".")) return name.endsWith(value);
    if (value.endsWith("/*")) return type.startsWith(value.slice(0, -1));

    return type === value;
  });
};

const formatAcceptLabel = (accept: string[]) =>
  accept.length === 0
    ? "allowed file types"
    : accept
        .map((type) => {
          if (type.startsWith(".")) return type.slice(1).toUpperCase();
          if (type.endsWith("/*")) return `${type.slice(0, -2).toUpperCase()} files`;

          return formatFileType(type);
        })
        .join(", ");

interface ValidateFilesOptions {
  accept: string[];
  currentCount: number;
  errorMessage?: DropZoneErrorMessages;
  maxFiles: number;
  maxFileSize?: number;
}

const validateFiles = (files: File[], options: ValidateFilesOptions) => {
  const {accept, currentCount, errorMessage, maxFileSize, maxFiles} = options;
  const room = Math.max(maxFiles - currentCount, 0);
  const accepted: File[] = [];
  const overflowing: File[] = [];
  const invalidType: File[] = [];
  const oversized: File[] = [];

  for (const file of files) {
    if (accept.length > 0 && !accepts(file, accept)) invalidType.push(file);
    else if (maxFileSize !== undefined && file.size > maxFileSize) oversized.push(file);
    else if (accepted.length < room) accepted.push(file);
    else overflowing.push(file);
  }

  const failure = (
    [
      {code: "tooManyFiles", files: overflowing},
      {code: "invalidFileType", files: invalidType},
      {code: "fileTooLarge", files: oversized},
    ] as const
  ).find((entry) => entry.files.length > 0);

  if (!failure) return {accepted, error: null};

  const message =
    errorMessage?.[failure.code] ??
    (failure.code === "tooManyFiles"
      ? `You can upload up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`
      : failure.code === "invalidFileType"
        ? `Only ${formatAcceptLabel(accept)} are allowed.`
        : `Each file must be ${formatFileSize(maxFileSize ?? 0)} or smaller.`);

  return {
    accepted,
    error: {accept, maxFileSize, maxFiles, message, ...failure} satisfies DropZoneValidationError,
  };
};

const flattenDropItems = async (
  items: Iterable<DropItem> | AsyncIterable<DropItem>,
): Promise<File[]> => {
  const files: File[] = [];

  for await (const item of items) {
    if (item.kind === "file") files.push(await item.getFile());
    else if (item.kind === "directory") files.push(...(await flattenDropItems(item.getEntries())));
  }

  return files;
};

export interface UseDropZoneStateProps<TResult = unknown> {
  accept?: string | string[];
  maxFileSize?: number;
  maxFiles?: number;
  fileList?: DropZoneFile<TResult>[];
  defaultFileList?: DropZoneFile<TResult>[];
  isDisabled?: boolean;
  errorMessage?: DropZoneErrorMessages;
  messages?: DropZoneMessages<TResult>;
  onChange?: (files: DropZoneFile<TResult>[]) => void;
  onRemove?: (file: DropZoneFile<TResult>, files: DropZoneFile<TResult>[]) => void;
  onUpload?: (file: File, context: DropZoneUploadContext) => Promise<TResult>;
  onUploadSuccess?: (file: DropZoneFile<TResult>, result: TResult) => void;
  onUploadError?: (file: DropZoneFile<TResult>, error: unknown) => void;
}

export interface DropZoneAreaPropsOverrides {
  isDisabled?: boolean;
  onDrop?: (event: DropEvent) => void;
}

export interface DropZoneTriggerPropsOverrides {
  acceptedFileTypes?: string[];
  allowsMultiple?: boolean;
  isDisabled?: boolean;
  onSelect?: (files: FileList | null) => void;
}

const EMPTY_FILES: DropZoneFile<never>[] = [];

export const useDropZoneState = <TResult = unknown>(props: UseDropZoneStateProps<TResult> = {}) => {
  const {
    accept,
    defaultFileList,
    errorMessage,
    fileList,
    isDisabled = false,
    maxFileSize,
    maxFiles = 1,
    messages,
    onChange,
    onRemove,
    onUpload,
    onUploadError,
    onUploadSuccess,
  } = props;
  const [files, setFiles] = useControlledState(fileList, defaultFileList ?? EMPTY_FILES, onChange);
  const [validationError, setValidationError] = useState<DropZoneValidationError | null>(null);
  const [previews, setPreviews] = useState<Record<string, {url: string}>>({});
  const [announcement, setAnnouncement] = useState("");
  const controllersRef = useRef(new Map<string, AbortController>());
  const objectUrlsRef = useRef(new Map<string, string>());
  const filesRef = useRef(files);
  const nextFileIdRef = useRef(0);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(
    () => () => {
      controllersRef.current.forEach((controller) => controller.abort());
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    },
    [],
  );

  const commit = (updater: (current: DropZoneFile<TResult>[]) => DropZoneFile<TResult>[]) => {
    const next = updater(filesRef.current);

    if (next !== filesRef.current) {
      filesRef.current = next;
      setFiles(next);
    }

    return next;
  };
  const patch = (id: string, values: Partial<DropZoneFile<TResult>>) =>
    commit((current) =>
      current.some((item) => item.id === id)
        ? current.map((item) => (item.id === id ? {...item, ...values} : item))
        : current,
    );
  const abort = (id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
  };
  const announce = (message: string) => {
    setAnnouncement("");
    queueMicrotask(() => setAnnouncement(message));
  };
  const upload = (target: DropZoneFile<TResult>) => {
    if (!onUpload || !target.file) return;
    abort(target.id);
    const controller = new AbortController();

    controllersRef.current.set(target.id, controller);
    patch(target.id, {
      error: undefined,
      errorMessage: undefined,
      progress: 0,
      result: undefined,
      status: "uploading",
    });
    onUpload(target.file, {
      onProgress: (progress) => {
        if (!controller.signal.aborted)
          patch(target.id, {progress: Math.min(Math.max(progress, 0), 1)});
      },
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        controllersRef.current.delete(target.id);
        const completed = {...target, progress: 1, result, status: "complete" as const};

        patch(target.id, completed);
        onUploadSuccess?.(completed, result);
        announce(messages?.uploaded?.(completed) ?? `${completed.name} uploaded.`);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        controllersRef.current.delete(target.id);
        const message = error instanceof Error && error.message ? error.message : "Upload failed";
        const failed = {...target, error, errorMessage: message, status: "failed" as const};

        patch(target.id, failed);
        onUploadError?.(failed, error);
        announce(messages?.uploadFailed?.(failed) ?? `${failed.name} failed to upload.`);
      });
  };

  const addFiles = async (source: FileList | File[] | DropEvent) => {
    const incoming = "items" in source ? await flattenDropItems(source.items) : Array.from(source);

    if (incoming.length === 0) return;
    const {accepted, error} = validateFiles(incoming, {
      accept: toAcceptList(accept),
      currentCount: filesRef.current.length,
      errorMessage,
      maxFileSize,
      maxFiles,
    });

    setValidationError(error);
    if (accepted.length === 0) return;
    const added = accepted.map<DropZoneFile<TResult>>((file) => ({
      file,
      id: `drop-zone-file-${nextFileIdRef.current++}`,
      name: file.name,
      progress: 0,
      size: file.size,
      status: "idle",
      type: file.type,
    }));

    commit((current) => [...current, ...added]);
    added.forEach(upload);
  };

  const releasePreview = (id: string) => {
    const url = objectUrlsRef.current.get(id);

    if (!url) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(id);
    setPreviews((current) => {
      const {[id]: _removed, ...next} = current;

      return next;
    });
  };

  const remove = (id: string) => {
    const target = filesRef.current.find((item) => item.id === id);

    if (!target) return;
    abort(id);
    const next = commit((current) => current.filter((item) => item.id !== id));

    releasePreview(id);
    setValidationError(null);
    onRemove?.(target, next);
  };

  const retry = (id: string) => {
    const target = filesRef.current.find((item) => item.id === id);

    if (target?.file) upload(target);
  };
  const clear = () => {
    [...filesRef.current].forEach((item) => remove(item.id));
  };

  // Creates object URLs for newly added local images. `remove` releases them immediately.
  useEffect(() => {
    let changed = false;

    for (const item of files) {
      if (!item.file || !isImageFile(item)) continue;
      if (objectUrlsRef.current.has(item.id)) continue;
      objectUrlsRef.current.set(item.id, URL.createObjectURL(item.file));
      changed = true;
    }
    if (changed)
      setPreviews(Object.fromEntries([...objectUrlsRef.current].map(([id, url]) => [id, {url}])));
  }, [files]);

  const isFull = files.length >= maxFiles;

  const getAreaProps = (userProps?: DropZoneAreaPropsOverrides) => {
    const {isDisabled: userDisabled, onDrop} = userProps ?? {};

    // Excludes isFull: this isDisabled also drives the Area's `inert` attribute, which
    // cascades to every card inside. Overflow drops are already rejected by addFiles'
    // own validation (tooManyFiles), so cards stay removable once the list is full.
    return {
      announcement,
      isDisabled: isDisabled || userDisabled === true,
      onDrop: (event: DropEvent) => {
        void addFiles(event).then(() => onDrop?.(event));
      },
    };
  };
  const getTriggerProps = <T extends DropZoneTriggerPropsOverrides>(userProps?: T) => {
    const {isDisabled: userDisabled, onSelect, ...rest} = userProps ?? {};

    return {
      ...rest,
      acceptedFileTypes: toAcceptList(accept),
      allowsMultiple: maxFiles > 1,
      isDisabled: isDisabled || userDisabled === true || isFull,
      onSelect: (selected: FileList | null) => {
        if (selected) void addFiles(selected).then(() => onSelect?.(selected));
        else onSelect?.(selected);
      },
    };
  };

  return {
    addFiles,
    announcement,
    clear,
    files,
    getAreaProps,
    getTriggerProps,
    isDisabled,
    isFull,
    previews,
    releasePreview,
    remove,
    retry,
    validationError,
  };
};

export type UseDropZoneStateResult<TResult = unknown> = ReturnType<
  typeof useDropZoneState<TResult>
>;

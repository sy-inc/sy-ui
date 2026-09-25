"use client";

import type {
  DropZoneFile,
  DropZoneTriggerProps,
  UseDropZoneStateProps,
  UseDropZoneStateResult,
} from "../drop-zone";
import type {ButtonVariants, ImageFieldVariants} from "@sy-inc/styles";
import type {CSSProperties, ComponentProps, ComponentPropsWithRef, ReactNode} from "react";

import {mergeRefs} from "@react-aria/utils";
import {buttonVariants, fieldErrorVariants, imageFieldVariants} from "@sy-inc/styles";
import {createContext, use, useEffect, useId, useRef, useState} from "react";
import {TextContext} from "react-aria-components/Text";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {Button} from "../button";
import {Description} from "../description";
import {DropZone, formatFileType, useDropZoneState} from "../drop-zone";
import {ArrowsRotateIcon, EyeSlashIcon, TrashBinIcon, UploadCloudIcon} from "../icons";
import {ImagePreview} from "../image-preview";
import {Label} from "../label";
import {Spinner} from "../spinner";
import {Tooltip} from "../tooltip";

const defaultLabels = {
  broken: "Image could not be loaded",
  cancel: "Cancel upload",
  closePreview: "Close image",
  dropHere: "Release to upload",
  fileTooLarge: "Image exceeds the size limit",
  invalidFileType: "Unsupported image format",
  preview: "Preview image",
  ratioMismatch: "Image proportions differ from the required ratio",
  recommended: "Recommended",
  remove: "Remove image",
  replace: "Replace image",
  retry: "Retry upload",
  tooManyFiles: "Choose one image",
  tooSmall: "Image width is below the recommended size",
  upload: "Drop, paste or click to upload",
  uploadFailed: "Upload failed",
  uploading: "Uploading",
};

export type ImageFieldLabels = typeof defaultLabels;

export interface ImageFieldProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onChange" | "placeholder"
> {
  value: string;
  onChange: (value: string) => void;
  onUpload: NonNullable<UseDropZoneStateProps<string>["onUpload"]>;
  resolveSrc?: (path: string) => string;
  aspectRatio: number;
  layout?: ImageFieldVariants["layout"];
  recommendedWidth?: number;
  placeholder?: ReactNode;
  accept?: string | string[];
  maxFileSize?: number;
  isDisabled?: boolean;
  label: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  labels?: Partial<ImageFieldLabels>;
}

const identity = (path: string) => path;

type LoadedImage = {src: string; width?: number; height?: number; failed?: boolean};

type ImageFieldContextValue = Pick<
  ImageFieldProps,
  | "label"
  | "value"
  | "aspectRatio"
  | "layout"
  | "isDisabled"
  | "recommendedWidth"
  | "placeholder"
  | "description"
> & {
  bridge?: string;
  cancel: () => void;
  error: ReactNode;
  failed: boolean;
  file?: DropZoneFile<string>;
  isDropTarget: boolean;
  labels: ImageFieldLabels;
  loaded?: LoadedImage;
  metaId: string;
  mismatch: boolean;
  remove: () => void;
  setImage: (image: LoadedImage) => void;
  slots: ReturnType<typeof imageFieldVariants>;
  src: string;
  state: UseDropZoneStateResult<string>;
  tooSmall: boolean;
  uploading: boolean;
};
const ImageFieldContext = createContext<ImageFieldContextValue | null>(null);
const useImageFieldContext = () => {
  const context = use(ImageFieldContext);

  if (!context) throw new Error("ImageField parts must be inside ImageField.Root");

  return context;
};

export function ImageFieldRoot({
  accept = "image/jpeg,image/png,image/webp,image/gif",
  aspectRatio,
  children,
  className,
  description,
  errorMessage,
  isDisabled = false,
  label,
  labels: labelOverrides,
  layout = "banner",
  maxFileSize,
  onChange,
  onUpload,
  placeholder,
  recommendedWidth,
  ref,
  resolveSrc = identity,
  style,
  value,
  ...domProps
}: ImageFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const metaId = useId();
  const labels = {...defaultLabels, ...labelOverrides};
  // After a successful upload the local file stays on screen until the stored image has loaded,
  // so the swap never flashes an empty frame. What finally shows is always derived from `value`.
  const [handoff, setHandoff] = useState<{path: string; url: string}>();
  const state = useDropZoneState<string>({
    accept,
    errorMessage: {
      fileTooLarge: labels.fileTooLarge,
      invalidFileType: labels.invalidFileType,
      tooManyFiles: labels.tooManyFiles,
    },
    isDisabled,
    maxFileSize,
    maxFiles: 1,
    messages: {uploadFailed: () => labels.uploadFailed, uploaded: () => ""},
    onUpload,
    onUploadSuccess: ({file}, path) => {
      if (file) setHandoff({path, url: URL.createObjectURL(file)});
      state.clear();
      onChange(path);
    },
  });
  // Persisted paths never become synthetic Files. An external reset invalidates the current transfer.
  const clearRef = useRef(state.clear);

  useEffect(() => {
    clearRef.current = state.clear;
  });
  useEffect(() => {
    clearRef.current();
  }, [value]);
  useEffect(
    () => () => {
      if (handoff) URL.revokeObjectURL(handoff.url);
    },
    [handoff],
  );

  const file = state.files[0];
  const uploading = file?.status === "uploading";
  const src = (uploading && state.previews[file.id]?.url) || (value ? resolveSrc(value) : "");
  const [image, setImage] = useState<LoadedImage>();
  const loaded = image?.src === src ? image : undefined;
  const failed = !!value && (!src || !!loaded?.failed);
  const bridge =
    handoff?.path === value && !uploading && !loaded && !failed ? handoff.url : undefined;
  const mismatch =
    !!loaded?.width &&
    !!loaded.height &&
    Math.abs(loaded.width / loaded.height / aspectRatio - 1) > 0.05;
  const tooSmall = !!loaded?.width && !!recommendedWidth && loaded.width < recommendedWidth;
  const error =
    state.validationError?.message ??
    (file?.status === "failed" ? labels.uploadFailed : null) ??
    errorMessage;
  const focusTrigger = () =>
    rootRef.current?.querySelector<HTMLElement>('[data-slot="drop-zone-trigger"]')?.focus();
  const slots = imageFieldVariants({layout});
  const context = {
    aspectRatio,
    bridge,
    cancel: () => {
      state.clear();
      requestAnimationFrame(focusTrigger);
    },
    description,
    error,
    failed,
    file,
    isDisabled,
    label,
    labels,
    layout,
    loaded,
    metaId,
    mismatch,
    placeholder,
    recommendedWidth,
    remove: () => {
      state.clear();
      onChange("");
      requestAnimationFrame(focusTrigger);
    },
    setImage: (next: LoadedImage) => {
      setImage(next);
      if (next.src === src) setHandoff(undefined);
    },
    slots,
    src,
    state,
    tooSmall,
    uploading,
    value,
  };

  return (
    <div
      {...domProps}
      ref={mergeRefs(rootRef, ref)}
      aria-describedby={[domProps["aria-describedby"], metaId].filter(Boolean).join(" ")}
      aria-labelledby={labelId}
      className={slots.base({className})}
      data-disabled={isDisabled || undefined}
      data-invalid={!!error || undefined}
      data-layout={layout}
      data-slot="image-field"
      role="group"
      style={{"--image-field-ratio": aspectRatio, ...style} as CSSProperties}
    >
      <DropZone.Area
        {...state.getAreaProps()}
        aria-labelledby={labelId}
        className={slots.area()}
        onDrop={(event) => {
          void state.replaceFiles(event);
        }}
      >
        {({isDropTarget}) => (
          <TextContext value={null}>
            <ImageFieldContext value={{...context, isDropTarget}}>
              <div className={slots.heading()} data-slot="image-field-heading">
                <Label id={labelId}>{label}</Label>
              </div>
              {children ?? (
                <>
                  <ImageFieldFrame />
                  <ImageFieldMeta />
                  {layout === "inline" && !!(value || file) && <ImageFieldActions />}
                </>
              )}
            </ImageFieldContext>
          </TextContext>
        )}
      </DropZone.Area>
    </div>
  );
}

export interface ImageFieldFrameProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** Toolbar rendered over tile/banner frames when an image or failed upload exists. @default <ImageField.Actions /> */
  actions?: ReactNode;
}
export function ImageFieldFrame({
  actions = <ImageFieldActions />,
  className,
  ...props
}: ImageFieldFrameProps) {
  const c = useImageFieldContext();
  const {error, failed, isDropTarget, labels, placeholder, slots, src, state, uploading} = c;
  const hasImage = !!src && !failed;

  return (
    <div
      {...props}
      className={composeSlotClassName(slots.frame, className)}
      data-empty={!c.value || undefined}
      data-invalid={!!error || undefined}
      data-slot="image-field-frame"
      data-warning={c.mismatch || c.tooSmall || undefined}
    >
      {!!hasImage && (
        <ImagePreview
          key={src}
          className={slots.preview()}
          closeLabel={labels.closePreview}
          isDisabled={c.isDisabled || uploading}
          openLabel={labels.preview}
        >
          <img
            alt={c.label}
            className={slots.image()}
            data-slot="image-field-image"
            src={src}
            onError={() => c.setImage({failed: true, src})}
            onLoad={({currentTarget}) =>
              c.setImage({
                height: currentTarget.naturalHeight,
                src,
                width: currentTarget.naturalWidth,
              })
            }
          />
        </ImagePreview>
      )}
      {!!c.bridge && (
        <img
          alt=""
          aria-hidden="true"
          className={slots.handoff()}
          data-slot="image-field-handoff"
          src={c.bridge}
        />
      )}
      {!hasImage && !uploading && (
        <div className={slots.placeholder()} data-slot="image-field-placeholder">
          {failed ? (
            <>
              <EyeSlashIcon aria-hidden="true" />
              <span>{labels.broken}</span>
            </>
          ) : (
            placeholder
          )}
        </div>
      )}
      {!c.value && !uploading && (
        <DropZone.Trigger
          {...state.getTriggerProps()}
          aria-label={labels.upload}
          className={slots.emptyTrigger()}
          isDisabled={c.isDisabled}
          onSelect={(files) => {
            if (files) void state.replaceFiles(files);
          }}
        >
          <UploadCloudIcon aria-hidden="true" />
          <span>{isDropTarget ? labels.dropHere : labels.upload}</span>
        </DropZone.Trigger>
      )}
      {!!uploading && (
        <div className={slots.overlay()} data-slot="image-field-feedback">
          <Spinner aria-label={labels.uploading} size="sm" />
          <span>
            {labels.uploading} {Math.round(c.file!.progress * 100)}%
          </span>
          {c.layout !== "inline" && <ImageFieldCancelButton />}
          <DropZone.FileProgress
            aria-label={labels.uploading}
            className={slots.progress()}
            value={c.file!.progress * 100}
          />
        </div>
      )}
      {!uploading && !!(c.value || c.file) && c.layout !== "inline" && actions}
      {!!isDropTarget && (
        <div aria-hidden="true" className={slots.dropOverlay()}>
          {labels.dropHere}
        </div>
      )}
    </div>
  );
}

export interface ImageFieldActionsProps extends ComponentPropsWithRef<"div"> {}
export function ImageFieldActions({children, className, ...props}: ImageFieldActionsProps) {
  const c = useImageFieldContext();
  const {labels, slots} = c;

  return (
    <div
      {...props}
      className={composeSlotClassName(slots.actions, className)}
      data-slot="image-field-actions"
    >
      {children ?? (
        <>
          <ImageFieldCancelButton />
          <ImageFieldRetryButton />
          {!!c.value && !c.uploading && (
            <>
              <Tooltip>
                <ImageFieldReplaceTrigger />
                <Tooltip.Content>{labels.replace}</Tooltip.Content>
              </Tooltip>
              <span aria-hidden="true" className={slots.divider()} />
              <Tooltip>
                <ImageFieldRemoveButton />
                <Tooltip.Content>{labels.remove}</Tooltip.Content>
              </Tooltip>
            </>
          )}
        </>
      )}
    </div>
  );
}

// Each action renders only while it applies, so custom toolbars need no state checks.
export interface ImageFieldButtonProps extends ComponentProps<typeof Button> {}

export interface ImageFieldReplaceTriggerProps
  extends
    Omit<DropZoneTriggerProps, "onSelect">,
    Pick<ButtonVariants, "isIconOnly" | "size" | "variant"> {}

export function ImageFieldReplaceTrigger({
  children,
  className,
  isDisabled,
  isIconOnly = !children,
  size = "sm",
  variant = "ghost",
  ...props
}: ImageFieldReplaceTriggerProps) {
  const c = useImageFieldContext();

  if (!c.value || c.uploading) return null;

  return (
    <DropZone.Trigger
      {...c.state.getTriggerProps()}
      aria-label={c.labels.replace}
      {...props}
      className={buttonVariants({
        className: c.slots.replaceTrigger({className}),
        isIconOnly,
        size,
        variant,
      })}
      isDisabled={c.isDisabled || isDisabled}
      onSelect={(files) => {
        if (files) void c.state.replaceFiles(files);
      }}
    >
      {children ?? <ArrowsRotateIcon />}
    </DropZone.Trigger>
  );
}

export function ImageFieldRemoveButton({
  children,
  className,
  isDisabled,
  isIconOnly = !children,
  onPress,
  ...props
}: ImageFieldButtonProps) {
  const c = useImageFieldContext();

  if (!c.value || c.uploading) return null;

  return (
    <Button
      aria-label={c.labels.remove}
      isIconOnly={isIconOnly}
      size="sm"
      type="button"
      variant="ghost"
      {...props}
      className={composeTwRenderProps(className, c.slots.remove())}
      isDisabled={c.isDisabled || isDisabled}
      onPress={(event) => {
        onPress?.(event);
        c.remove();
      }}
    >
      {children ?? <TrashBinIcon />}
    </Button>
  );
}

export function ImageFieldRetryButton({
  children,
  isDisabled,
  onPress,
  ...props
}: ImageFieldButtonProps) {
  const c = useImageFieldContext();
  const file = c.file;

  if (file?.status !== "failed") return null;

  return (
    <Button
      size="sm"
      type="button"
      variant="danger-soft"
      {...props}
      isDisabled={c.isDisabled || isDisabled}
      onPress={(event) => {
        onPress?.(event);
        c.state.retry(file.id);
      }}
    >
      {children ?? c.labels.retry}
    </Button>
  );
}

export function ImageFieldCancelButton({children, onPress, ...props}: ImageFieldButtonProps) {
  const c = useImageFieldContext();

  if (!c.uploading) return null;

  return (
    <Button
      size="sm"
      type="button"
      variant="secondary"
      {...props}
      onPress={(event) => {
        onPress?.(event);
        c.cancel();
      }}
    >
      {children ?? c.labels.cancel}
    </Button>
  );
}

export interface ImageFieldMetaProps extends ComponentPropsWithRef<"div"> {}
export function ImageFieldMeta({children, className, ...props}: ImageFieldMetaProps) {
  const c = useImageFieldContext();
  const {aspectRatio, labels, loaded, recommendedWidth, slots} = c;
  const format = formatFileType(c.file?.type, c.file?.name ?? c.value.split(/[?#]/)[0]);
  const warning = c.mismatch ? labels.ratioMismatch : c.tooSmall ? labels.tooSmall : null;

  return (
    <div
      {...props}
      aria-live="polite"
      className={composeSlotClassName(slots.meta, className)}
      data-slot="image-field-meta"
      data-warning={!!warning || undefined}
      id={c.metaId}
    >
      {!!c.error && (
        <span className={fieldErrorVariants()} data-slot="field-error" role="alert">
          {c.error}
        </span>
      )}
      {children ??
        (!c.error && (
          <>
            {warning ? (
              <span>
                {warning}
                {!!loaded?.width && ` · ${loaded.width} × ${loaded.height}`}
              </span>
            ) : c.failed ? (
              <span>{c.value}</span>
            ) : (
              (c.description ?? (
                <Description>
                  {loaded?.width
                    ? `${loaded.width} × ${loaded.height}${format === "FILE" ? "" : ` · ${format}`}`
                    : recommendedWidth
                      ? `${labels.recommended} ${recommendedWidth} × ${Math.round(recommendedWidth / aspectRatio)}`
                      : null}
                </Description>
              ))
            )}
          </>
        ))}
    </div>
  );
}

ImageFieldRoot.displayName = "SY INC.ImageField";
ImageFieldFrame.displayName = "SY INC.ImageField.Frame";
ImageFieldActions.displayName = "SY INC.ImageField.Actions";
ImageFieldReplaceTrigger.displayName = "SY INC.ImageField.ReplaceTrigger";
ImageFieldRemoveButton.displayName = "SY INC.ImageField.RemoveButton";
ImageFieldRetryButton.displayName = "SY INC.ImageField.RetryButton";
ImageFieldCancelButton.displayName = "SY INC.ImageField.CancelButton";
ImageFieldMeta.displayName = "SY INC.ImageField.Meta";

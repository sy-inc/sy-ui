"use client";

import type {
  DropZoneFile,
  DropZoneTriggerProps,
  UseDropZoneStateProps,
  UseDropZoneStateResult,
} from "../drop-zone";
import type {ButtonVariants} from "@sy-inc/styles";
import type {CSSProperties, ComponentProps, ComponentPropsWithRef, ReactNode} from "react";

import {mergeRefs, useEffectEvent, useLayoutEffect} from "@react-aria/utils";
import {buttonVariants, fieldErrorVariants, imageFieldVariants} from "@sy-inc/styles";
import {createContext, use, useEffect, useId, useRef, useState} from "react";
import {LabelContext} from "react-aria-components/Label";
import {TextContext} from "react-aria-components/Text";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {Button} from "../button";
import {Description} from "../description";
import {DropZone, formatFileType, useDropZoneState} from "../drop-zone";
import {ArrowsRotateIcon, CloseIcon, PictureIcon, TrashBinIcon, UploadCloudIcon} from "../icons";
import {ImagePreview} from "../image-preview";
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

/**
 * Compose a `<Label>` child to name the field, or pass `aria-label` when there is no visible label.
 * Actions, placeholder content, description and form errors are composed as children of Frame / Meta.
 * The frame is a 100px square holding only an upload icon; size it with `className` on Frame.
 * `aspectRatio` widens it, and wide toolbars stretch it instead of squeezing the buttons.
 */
export interface ImageFieldProps extends Omit<ComponentPropsWithRef<"div">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onUpload: NonNullable<UseDropZoneStateProps<string>["onUpload"]>;
  resolveSrc?: (path: string) => string;
  /** Width / height. Omit to follow the image's own proportions and skip the ratio check. */
  aspectRatio?: number;
  /** Warn when the image's proportions differ from `aspectRatio`. `false` keeps the frame shape without checking. @default true */
  validateRatio?: boolean;
  recommendedWidth?: number;
  accept?: string | string[];
  maxFileSize?: number;
  isDisabled?: boolean;
  /** Marks the field invalid (e.g. a form error composed with `<FieldError>`); upload errors set it on their own. */
  isInvalid?: boolean;
  /** Maps what `onUpload` rejected with to the failure message; `null`/`undefined` falls back to `labels.uploadFailed`. */
  getUploadErrorMessage?: (error: unknown) => ReactNode;
  labels?: Partial<ImageFieldLabels>;
}

const identity = (path: string) => path;

type LoadedImage = {src: string; width?: number; height?: number; failed?: boolean};

type ImageFieldContextValue = Pick<
  ImageFieldProps,
  "value" | "aspectRatio" | "isDisabled" | "recommendedWidth"
> & {
  bridge?: string;
  cancel: () => void;
  error: ReactNode;
  failed: boolean;
  file?: DropZoneFile<string>;
  isDropTarget: boolean;
  isInvalid: boolean;
  labels: ImageFieldLabels;
  loaded?: LoadedImage;
  /** Accessible name: `aria-label`, else the composed Label's text. */
  name: string;
  metaId: string;
  remove: () => void;
  setImage: (image: LoadedImage) => void;
  slots: ReturnType<typeof imageFieldVariants>;
  src: string;
  state: UseDropZoneStateResult<string>;
  uploading: boolean;
  /** Ratio or resolution warning; `null` while the image fits. */
  warning: ReactNode;
};
const ImageFieldContext = createContext<ImageFieldContextValue | null>(null);
const useImageFieldContext = () => {
  const context = use(ImageFieldContext);

  if (!context) throw new Error("ImageField parts must be inside ImageField.Root");

  return context;
};

export function ImageFieldRoot({
  accept = "image/jpeg,image/png,image/webp,image/gif",
  "aria-label": ariaLabel,
  aspectRatio,
  children,
  className,
  getUploadErrorMessage,
  isDisabled = false,
  isInvalid = false,
  labels: labelOverrides,
  maxFileSize,
  onChange,
  onUpload,
  recommendedWidth,
  ref,
  resolveSrc = identity,
  style,
  validateRatio = true,
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
    // Meta announces upload errors itself (role="alert"); keep the drop zone's live region silent.
    messages: {uploadFailed: () => "", uploaded: () => ""},
    onUpload,
    onUploadSuccess: ({file}, path) => {
      if (file) setHandoff({path, url: URL.createObjectURL(file)});
      state.clear();
      onChange(path);
    },
  });
  // Persisted paths never become synthetic Files. An external reset invalidates the current transfer.
  const clearOnReset = useEffectEvent(() => state.clear());

  useEffect(() => clearOnReset(), [value]);
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
  // `image` keeps the last loaded size while a new src loads, so an unset ratio doesn't jump back to the fallback.
  const naturalRatio = image?.width && image.height ? image.width / image.height : undefined;
  const ratio = aspectRatio ?? (src && !failed ? naturalRatio : undefined);
  const mismatch =
    validateRatio &&
    !!aspectRatio &&
    !!loaded?.width &&
    !!loaded.height &&
    Math.abs(loaded.width / loaded.height / aspectRatio - 1) > 0.05;
  const tooSmall = !!loaded?.width && !!recommendedWidth && loaded.width < recommendedWidth;
  const warning = mismatch ? labels.ratioMismatch : tooSmall ? labels.tooSmall : null;
  const error =
    state.validationError?.message ??
    (file?.status === "failed"
      ? (getUploadErrorMessage?.(file.error) ?? labels.uploadFailed)
      : null);
  // The composed <Label> gets `labelId` through LabelContext; its text becomes the image alt.
  const [labelText, setLabelText] = useState<string>();

  useLayoutEffect(() => {
    const text = rootRef.current?.ownerDocument.getElementById(labelId)?.textContent ?? undefined;

    setLabelText((previous) => (previous === text ? previous : text));
  });
  const focusTrigger = () =>
    rootRef.current?.querySelector<HTMLElement>('[data-slot="drop-zone-trigger"]')?.focus();
  const slots = imageFieldVariants();
  const invalid = !!error || isInvalid;
  const context = {
    aspectRatio,
    bridge,
    cancel: () => {
      state.clear();
      requestAnimationFrame(focusTrigger);
    },
    error,
    failed,
    file,
    isDisabled,
    isInvalid: invalid,
    labels,
    loaded,
    metaId,
    name: ariaLabel ?? labelText ?? "",
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
    uploading,
    value,
    warning,
  };

  return (
    <div
      {...domProps}
      ref={mergeRefs(rootRef, ref)}
      aria-describedby={[domProps["aria-describedby"], metaId].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelId}
      className={slots.base({className})}
      data-disabled={isDisabled || undefined}
      data-invalid={invalid || undefined}
      data-slot="image-field"
      role="group"
      style={{"--image-field-ratio": ratio, ...style} as CSSProperties}
    >
      <DropZone.Area
        {...state.getAreaProps()}
        {...(ariaLabel ? {"aria-label": ariaLabel} : {"aria-labelledby": labelId})}
        className={slots.area()}
        onDrop={(event) => {
          void state.replaceFiles(event);
        }}
      >
        {({isDropTarget}) => (
          <LabelContext value={{id: labelId}}>
            <TextContext value={null}>
              <ImageFieldContext value={{...context, isDropTarget}}>
                {children ?? (
                  <>
                    <ImageFieldFrame>
                      <ImageFieldActions />
                    </ImageFieldFrame>
                    <ImageFieldMeta />
                  </>
                )}
              </ImageFieldContext>
            </TextContext>
          </LabelContext>
        )}
      </DropZone.Area>
    </div>
  );
}

export interface ImageFieldFrameProps extends ComponentPropsWithRef<"div"> {
  /** Layered over the image: usually `<ImageField.Actions />` and `<ImageField.Placeholder />`. */
  children?: ReactNode;
}
export function ImageFieldFrame({children, className, ...props}: ImageFieldFrameProps) {
  const c = useImageFieldContext();
  const {failed, isDropTarget, labels, slots, src, state, uploading} = c;
  const hasImage = !!src && !failed;

  return (
    <div
      {...props}
      className={composeSlotClassName(slots.frame, className)}
      data-auto-ratio={c.aspectRatio === undefined || undefined}
      data-empty={!c.value || undefined}
      data-invalid={c.isInvalid || undefined}
      data-slot="image-field-frame"
      data-warning={!!c.warning || undefined}
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
            alt={c.name}
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
      {!!failed && !uploading && (
        <div data-broken className={slots.placeholder()} data-slot="image-field-placeholder">
          <PictureIcon aria-hidden="true" />
          <span>{labels.broken}</span>
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
        </DropZone.Trigger>
      )}
      {!!uploading && (
        <div className={slots.overlay()} data-slot="image-field-feedback">
          {/* Decorative: the text below and the progress bar already announce the upload. */}
          <Spinner aria-hidden="true" size="sm" />
          {/* No progress yet (e.g. a fetch-based onUpload never reports any): don't claim 0%. */}
          <span data-slot="image-field-feedback-text">
            {labels.uploading}
            {!!c.file!.progress && ` ${Math.round(c.file!.progress * 100)}%`}
          </span>
          <DropZone.FileProgress
            aria-label={labels.uploading}
            className={slots.progress()}
            isIndeterminate={!c.file!.progress}
            value={c.file!.progress * 100}
          />
        </div>
      )}
      {!!isDropTarget && (
        <div aria-hidden="true" className={slots.dropOverlay()}>
          <UploadCloudIcon />
          <span>{labels.dropHere}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export interface ImageFieldPlaceholderProps extends ComponentPropsWithRef<"div"> {}
/** Replaces the empty frame's upload icon, e.g. with text or the app's fallback image. Never emits `onChange`. */
export function ImageFieldPlaceholder({className, ...props}: ImageFieldPlaceholderProps) {
  const c = useImageFieldContext();

  if (c.value || c.uploading) return null;

  return (
    <div
      {...props}
      className={composeSlotClassName(c.slots.placeholder, className)}
      data-slot="image-field-placeholder"
    />
  );
}

/** Also exposed as `data-empty` / `data-uploading` / `data-disabled` for CSS-only state styling. */
export type ImageFieldActionsRenderProps = {
  isDisabled: boolean;
  isEmpty: boolean;
  isUploading: boolean;
};
export interface ImageFieldActionsProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** Replaces the default toolbar. A function receives the field state to show buttons per state. */
  children?: ReactNode | ((state: ImageFieldActionsRenderProps) => ReactNode);
}
/** Inside Frame: a pill over the image that widens the frame when needed. Beside Frame: plain buttons next to it. Hides itself while empty. */
export function ImageFieldActions({children, className, ...props}: ImageFieldActionsProps) {
  const c = useImageFieldContext();
  const {labels, slots} = c;
  const state = {isDisabled: !!c.isDisabled, isEmpty: !c.value, isUploading: c.uploading};
  const content = typeof children === "function" ? children(state) : children;

  return (
    <div
      {...props}
      className={composeSlotClassName(slots.actions, className)}
      data-disabled={state.isDisabled || undefined}
      data-empty={state.isEmpty || undefined}
      data-slot="image-field-actions"
      data-uploading={state.isUploading || undefined}
    >
      {content ?? (
        <>
          {!!c.uploading && (
            <Tooltip>
              <ImageFieldCancelButton />
              <Tooltip.Content>{labels.cancel}</Tooltip.Content>
            </Tooltip>
          )}
          {c.file?.status === "failed" && (
            <Tooltip>
              <ImageFieldRetryButton />
              <Tooltip.Content>{labels.retry}</Tooltip.Content>
            </Tooltip>
          )}
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
      isDisabled={c.isDisabled || isDisabled}
      className={buttonVariants({
        className,
        isIconOnly,
        size,
        variant,
      })}
      onSelect={(files) => {
        if (files) void c.state.replaceFiles(files);
      }}
    >
      {children ?? <UploadCloudIcon />}
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
  isIconOnly = !children,
  onPress,
  ...props
}: ImageFieldButtonProps) {
  const c = useImageFieldContext();
  const file = c.file;

  if (file?.status !== "failed") return null;

  return (
    <Button
      aria-label={c.labels.retry}
      isIconOnly={isIconOnly}
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
      {children ?? <ArrowsRotateIcon />}
    </Button>
  );
}

export function ImageFieldCancelButton({
  children,
  isIconOnly = !children,
  onPress,
  ...props
}: ImageFieldButtonProps) {
  const c = useImageFieldContext();

  if (!c.uploading) return null;

  return (
    <Button
      aria-label={c.labels.cancel}
      isIconOnly={isIconOnly}
      size="sm"
      type="button"
      variant="ghost"
      {...props}
      onPress={(event) => {
        onPress?.(event);
        c.cancel();
      }}
    >
      {children ?? <CloseIcon />}
    </Button>
  );
}

export interface ImageFieldMetaProps extends ComponentPropsWithRef<"div"> {}
/** Live region below the frame and the field's description target. Upload and validation errors always render first. */
export function ImageFieldMeta({children, className, ...props}: ImageFieldMetaProps) {
  const c = useImageFieldContext();

  return (
    <div
      {...props}
      aria-live="polite"
      className={composeSlotClassName(c.slots.meta, className)}
      data-slot="image-field-meta"
      data-warning={!!c.warning || undefined}
      id={c.metaId}
    >
      {!!c.error && (
        <span data-visible className={fieldErrorVariants()} data-slot="field-error" role="alert">
          {c.error}
        </span>
      )}
      {children ?? (
        <>
          <ImageFieldWarning />
          <ImageFieldSize />
        </>
      )}
    </div>
  );
}

// Guidance parts render only while they apply (never beside an upload error), like the action parts.
export interface ImageFieldGuidanceProps extends ComponentPropsWithRef<"span"> {}

/** Ratio or resolution warning, or the unreachable path of a broken image. */
export function ImageFieldWarning(props: ImageFieldGuidanceProps) {
  const c = useImageFieldContext();
  const {warning} = c;

  if (c.error || (!warning && !c.failed)) return null;

  return (
    <span data-slot="image-field-warning" {...props}>
      {warning ?? c.value}
      {!!warning && !!c.loaded?.width && ` · ${c.loaded.width} × ${c.loaded.height}`}
    </span>
  );
}

/** Loaded dimensions and format, or the recommended size before an image loads. */
export function ImageFieldSize(props: ImageFieldGuidanceProps) {
  const c = useImageFieldContext();
  const {aspectRatio, labels, loaded, recommendedWidth, warning} = c;
  const format = formatFileType(c.file?.type, c.file?.name ?? c.value.split(/[?#]/)[0]);
  const size = loaded?.width
    ? `${loaded.width} × ${loaded.height}${format === "FILE" ? "" : ` · ${format}`}`
    : recommendedWidth
      ? `${labels.recommended} ${recommendedWidth}${aspectRatio ? ` × ${Math.round(recommendedWidth / aspectRatio)}` : "px"}`
      : null;

  if (c.error || warning || c.failed || !size) return null;

  return (
    <Description data-slot="image-field-size" {...props}>
      {size}
    </Description>
  );
}

ImageFieldRoot.displayName = "SY INC.ImageField";
ImageFieldFrame.displayName = "SY INC.ImageField.Frame";
ImageFieldPlaceholder.displayName = "SY INC.ImageField.Placeholder";
ImageFieldActions.displayName = "SY INC.ImageField.Actions";
ImageFieldReplaceTrigger.displayName = "SY INC.ImageField.ReplaceTrigger";
ImageFieldRemoveButton.displayName = "SY INC.ImageField.RemoveButton";
ImageFieldRetryButton.displayName = "SY INC.ImageField.RetryButton";
ImageFieldCancelButton.displayName = "SY INC.ImageField.CancelButton";
ImageFieldMeta.displayName = "SY INC.ImageField.Meta";
ImageFieldWarning.displayName = "SY INC.ImageField.Warning";
ImageFieldSize.displayName = "SY INC.ImageField.Size";

"use client";

import type {DropZoneFileFormatColor} from "./drop-zone-utils";
import type {DropZoneFileStatus, UseDropZoneStateResult} from "./use-drop-zone-state";
import type {DOMRenderProps} from "../../utils/dom";
import type {DropZoneVariants} from "@sy-inc/styles";
import type {ComponentProps, ComponentPropsWithRef, ReactNode} from "react";
import type {DropZoneProps as DropZonePrimitiveProps} from "react-aria-components/DropZone";

import {dropZoneVariants} from "@sy-inc/styles";
import React, {createContext, use, useEffect, useLayoutEffect, useRef, useState} from "react";
import {VisuallyHidden} from "react-aria";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {
  DisclosurePanel,
  Disclosure as DisclosurePrimitive,
  DisclosureStateContext,
} from "react-aria-components/Disclosure";
import {DropZone as DropZonePrimitive} from "react-aria-components/DropZone";
import {FileTrigger} from "react-aria-components/FileTrigger";

import {dataAttr} from "../../utils/assertion";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {Button} from "../button";
import {CloseButton} from "../close-button";
import {EyeIcon, FileShapeIcon, UploadCloudIcon} from "../icons";
import {ProgressBarFill, ProgressBarRoot, ProgressBarTrack} from "../progress-bar/progress-bar";

import {formatFileSize, formatFileType, getFileFormatColor, isImageFile} from "./drop-zone-utils";

type DropZoneContextValue = {slots?: ReturnType<typeof dropZoneVariants>};
const DropZoneContext = createContext<DropZoneContextValue>({});

export interface DropZoneRootProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
  variant?: DropZoneVariants["variant"];
}

const DropZoneRoot = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  variant,
  ...props
}: DropZoneRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof DropZoneRootProps<E>>) => {
  const slots = React.useMemo(() => dropZoneVariants({variant}), [variant]);

  return (
    <DropZoneContext value={{slots}}>
      <dom.div className={slots.base({className})} data-slot="drop-zone" {...(props as any)}>
        {children}
      </dom.div>
    </DropZoneContext>
  );
};

export interface DropZoneAreaProps extends Omit<DropZonePrimitiveProps, "aria-label"> {
  "aria-label": string;
  announcement?: string;
}

const DropZoneArea = ({
  announcement,
  children,
  className,
  inert,
  isDisabled = false,
  ...props
}: DropZoneAreaProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <DropZonePrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.area())}
      data-slot="drop-zone-area"
      inert={(inert ?? isDisabled) || undefined}
      isDisabled={isDisabled}
    >
      {(values) => (
        <>
          <VisuallyHidden aria-live="polite">{announcement}</VisuallyHidden>
          {typeof children === "function" ? children(values) : children}
        </>
      )}
    </DropZonePrimitive>
  );
};

export interface DropZoneTriggerProps extends Omit<ComponentProps<typeof FileTrigger>, "children"> {
  className?: string;
  children?: ReactNode;
  isDisabled?: boolean;
}

const DropZoneTrigger = ({children, className, isDisabled, ...props}: DropZoneTriggerProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <FileTrigger {...props}>
      <ButtonPrimitive
        aria-label="Select files"
        className={composeTwRenderProps(className, slots?.trigger())}
        data-slot="drop-zone-trigger"
        isDisabled={isDisabled}
        type="button"
      >
        {children ?? <UploadCloudIcon />}
      </ButtonPrimitive>
    </FileTrigger>
  );
};

export interface DropZoneClearTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {}
const DropZoneClearTrigger = ({children, className, ...props}: DropZoneClearTriggerProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <ButtonPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.clearTrigger())}
      data-slot="drop-zone-clear-trigger"
      type="button"
    >
      {children ?? "Clear all"}
    </ButtonPrimitive>
  );
};

export interface DropZoneFileItemProps extends ComponentPropsWithRef<typeof DisclosurePrimitive> {
  status?: DropZoneFileStatus;
}

const DropZoneFileItem = ({children, className, status, ...props}: DropZoneFileItemProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <DisclosurePrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.fileItem())}
      data-slot="drop-zone-file-item"
      data-status={status}
    >
      {children}
    </DisclosurePrimitive>
  );
};

export interface DropZoneFileHeaderProps extends ComponentPropsWithRef<"div"> {}
const DropZoneFileHeader = ({children, className, ...props}: DropZoneFileHeaderProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <div
      className={composeSlotClassName(slots?.fileHeader, className)}
      data-slot="drop-zone-file-header"
      {...props}
    >
      {children}
    </div>
  );
};

export interface DropZoneFileFormatIconProps extends ComponentPropsWithRef<"div"> {
  format?: string;
  color?: DropZoneFileFormatColor;
}
const DropZoneFileFormatIcon = ({
  children,
  className,
  color,
  format = "FILE",
  ...props
}: DropZoneFileFormatIconProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <div
      className={composeSlotClassName(slots?.fileFormatIcon, className)}
      data-slot="drop-zone-file-format-icon"
      {...props}
    >
      {children ?? (
        <>
          <FileShapeIcon />
          <span
            data-slot="drop-zone-file-format-icon-badge"
            className={composeSlotClassName(slots?.fileFormatIconBadge, undefined, {
              color: color ?? getFileFormatColor(format),
            })}
          >
            {format}
          </span>
        </>
      )}
    </div>
  );
};

export interface DropZoneFileInfoProps extends ComponentPropsWithRef<"div"> {}
const DropZoneFileInfo = ({children, className, ...props}: DropZoneFileInfoProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <div
      className={composeSlotClassName(slots?.fileInfo, className)}
      data-slot="drop-zone-file-info"
      {...props}
    >
      {children}
    </div>
  );
};

export interface DropZoneFileNameProps extends ComponentPropsWithRef<"span"> {}
const DropZoneFileName = ({children, className, ...props}: DropZoneFileNameProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <span
      className={composeSlotClassName(slots?.fileName, className)}
      data-slot="drop-zone-file-name"
      {...props}
    >
      {children}
    </span>
  );
};

export interface DropZoneFileMetaProps extends ComponentPropsWithRef<"span"> {}
const DropZoneFileMeta = ({children, className, ...props}: DropZoneFileMetaProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <span
      className={composeSlotClassName(slots?.fileMeta, className)}
      data-slot="drop-zone-file-meta"
      {...props}
    >
      {children}
    </span>
  );
};

export interface DropZoneFileProgressProps extends ComponentProps<typeof ProgressBarRoot> {}
const DropZoneFileProgress = ({
  children,
  className,
  size = "sm",
  ...props
}: DropZoneFileProgressProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <ProgressBarRoot
      {...props}
      className={composeTwRenderProps(className, slots?.fileProgress())}
      data-slot="drop-zone-file-progress"
      size={size}
    >
      {children ?? (
        <ProgressBarTrack>
          <ProgressBarFill />
        </ProgressBarTrack>
      )}
    </ProgressBarRoot>
  );
};

export interface DropZoneFileRetryTriggerProps extends ComponentPropsWithRef<typeof Button> {}
const DropZoneFileRetryTrigger = ({
  children,
  className,
  ...props
}: DropZoneFileRetryTriggerProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <Button
      {...props}
      className={composeTwRenderProps(className, slots?.fileRetryTrigger())}
      data-slot="drop-zone-file-retry-trigger"
      size="sm"
      type="button"
      variant="danger-soft"
    >
      {children ?? "Retry"}
    </Button>
  );
};

export interface DropZoneFileRemoveTriggerProps extends ComponentPropsWithRef<typeof CloseButton> {}
const DropZoneFileRemoveTrigger = ({
  children,
  className,
  ...props
}: DropZoneFileRemoveTriggerProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <CloseButton
      aria-label="Remove file"
      {...props}
      className={composeTwRenderProps(className, slots?.fileRemoveTrigger())}
      data-slot="drop-zone-file-remove-trigger"
      type="button"
    >
      {children}
    </CloseButton>
  );
};

export interface DropZonePreviewTriggerProps extends ComponentPropsWithRef<
  typeof ButtonPrimitive
> {}
const DropZonePreviewTrigger = ({children, className, ...props}: DropZonePreviewTriggerProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <ButtonPrimitive
      aria-label="Toggle preview"
      {...props}
      className={composeTwRenderProps(className, slots?.previewTrigger())}
      data-slot="drop-zone-preview-trigger"
      slot="trigger"
      type="button"
    >
      {children ?? <EyeIcon />}
    </ButtonPrimitive>
  );
};

export interface DropZonePreviewPanelProps extends Omit<
  ComponentPropsWithRef<typeof DisclosurePanel>,
  "children"
> {
  alt?: string;
  children?: ReactNode;
  src?: string;
}
const DropZonePreviewPanel = ({
  alt = "",
  children,
  className,
  src,
  ...props
}: DropZonePreviewPanelProps) => {
  const {slots} = use(DropZoneContext);
  const {isExpanded} = use(DisclosureStateContext)!;

  return (
    <DisclosurePanel
      {...props}
      className={composeTwRenderProps(className, slots?.previewPanel())}
      data-expanded={dataAttr(isExpanded)}
      data-slot="drop-zone-preview-panel"
    >
      {children ?? (src && <img alt={alt} src={src} />)}
    </DisclosurePanel>
  );
};

/* ------------------------------------------------------------------------------------------------
 * Slot — one row: the trailing empty trigger, or a file card. Purely presentational; CSS alone
 * drives every transition (entrance via @starting-style, preview height via :has(), the
 * card-to-square exit width via `data-leaving`). `isLeaving` only toggles that attribute and makes
 * the row `inert` — `Slots` below owns the timing.
 * --------------------------------------------------------------------------------------------- */
export interface DropZoneSlotProps extends ComponentPropsWithRef<"div"> {
  isEmpty: boolean;
  isInvalid?: boolean;
  isLeaving?: boolean;
}

const DropZoneSlot = ({
  children,
  className,
  isEmpty,
  isInvalid,
  isLeaving,
  ...props
}: DropZoneSlotProps) => {
  const {slots} = use(DropZoneContext);

  return (
    <div
      {...props}
      className={composeSlotClassName(slots?.row, className)}
      data-leaving={isLeaving || undefined}
      data-slot="drop-zone-row"
      inert={isLeaving || undefined}
    >
      <div
        className={slots?.capsule()}
        // Not `dataAttr`: the CSS keys off an explicit "false", not just the attribute's
        // absence, to tell "still empty" apart from "not yet reconciled".
        data-empty={isEmpty ? "true" : "false"}
        data-invalid={isInvalid || undefined}
        data-slot="drop-zone-capsule"
      >
        {children}
      </div>
    </div>
  );
};

// Matches the capsule's `flex-grow` transition duration in drop-zone.css.
const DROP_ZONE_EXIT_DURATION = 200;

const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------------------------------------
 * Slots — one row per active file plus a trailing empty trigger while there's room, derived
 * directly from `state.files`. A card's remove button and the trailing trigger are never both
 * mounted in the same spot, so removing a card (or filling the last slot) always drops focus to
 * <body>; this reclaims it inside this DropZone's own container so multiple DropZones on one page
 * never steal each other's focus.
 *
 * Pressing a card's remove button doesn't call `state.remove` right away: it marks the file
 * "leaving" (rectangle-to-square exit, driven by CSS off `data-leaving`) and defers the actual
 * removal for one transition. `state.remove`/`clear()` called directly (bypassing this UI) still
 * remove immediately, with no exit transition — this only covers the rendered button.
 * --------------------------------------------------------------------------------------------- */
export interface DropZoneSlotsProps<TResult = unknown> extends ComponentPropsWithRef<"div"> {
  state: Pick<
    UseDropZoneStateResult<TResult>,
    | "files"
    | "getTriggerProps"
    | "isDisabled"
    | "isFull"
    | "previews"
    | "remove"
    | "retry"
    | "validationError"
  >;
}

const DropZoneSlots = <TResult,>({className, state, ...props}: DropZoneSlotsProps<TResult>) => {
  const {slots} = use(DropZoneContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevFileIdsRef = useRef(state.files.map((item) => item.id));
  const [leavingIds, setLeavingIds] = useState<ReadonlySet<string>>(() => new Set());
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // ponytail: cancels pending exits on unmount to keep tests/dev tools quiet. If `Slots` unmounts
  // on its own while `state` lives on elsewhere, an in-flight removal is dropped instead of
  // completing — reinstate via a ref that outlives remounts if that composition shows up.
  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  const startRemove = (id: string) => {
    if (leavingIds.has(id) || timersRef.current.has(id)) return;
    setLeavingIds((current) => new Set(current).add(id));
    timersRef.current.set(
      id,
      setTimeout(
        () => {
          timersRef.current.delete(id);
          setLeavingIds((current) => {
            if (!current.has(id)) return current;
            const next = new Set(current);

            next.delete(id);

            return next;
          });
          state.remove(id);
        },
        prefersReducedMotion() ? 0 : DROP_ZONE_EXIT_DURATION,
      ),
    );
  };

  useLayoutEffect(() => {
    const nextIds = state.files.map((item) => item.id);
    const prevIds = prevFileIdsRef.current;

    prevFileIdsRef.current = nextIds;
    const unchanged =
      prevIds.length === nextIds.length && prevIds.every((id, index) => id === nextIds[index]);

    if (unchanged || document.activeElement !== document.body) return;
    const container = containerRef.current;

    if (!container) return;
    // Prefer the card that shifted into the removed one's place; fall back to the first card,
    // then the trailing trigger, then the underlying file input.
    const removedIndex = prevIds.findIndex((id) => !nextIds.includes(id));
    const removeTriggers = container.querySelectorAll<HTMLElement>(
      '[data-slot="drop-zone-file-remove-trigger"]',
    );
    const target =
      (removedIndex >= 0 ? removeTriggers[removedIndex] : undefined) ??
      removeTriggers[0] ??
      container.querySelector<HTMLElement>('[data-slot="drop-zone-trigger"]') ??
      container
        .closest<HTMLElement>('[data-slot="drop-zone-area"]')
        ?.querySelector<HTMLElement>('input[type="file"]');

    target?.focus();
  }, [state.files]);

  return (
    <div
      ref={containerRef}
      className={composeSlotClassName(slots?.slots, className)}
      data-slot="drop-zone-slots"
      {...props}
    >
      {state.files.map((item) => {
        const canPreview = isImageFile(item) && !!(item.file || item.previewUrl);

        return (
          <DropZoneSlot key={item.id} isEmpty={false} isLeaving={leavingIds.has(item.id)}>
            <DropZoneFileItem isDisabled={state.isDisabled} status={item.status}>
              <DropZoneFileHeader>
                <DropZoneFileFormatIcon format={formatFileType(item.type, item.name)} />
                <DropZoneFileInfo>
                  <DropZoneFileName>{item.name}</DropZoneFileName>
                  <DropZoneFileMeta>
                    {item.status === "failed" ? item.errorMessage : formatFileSize(item.size)}
                  </DropZoneFileMeta>
                  {item.status === "uploading" && (
                    <DropZoneFileProgress
                      aria-label={`Uploading ${item.name}`}
                      value={item.progress * 100}
                    />
                  )}
                </DropZoneFileInfo>
                {item.status === "failed" && !!item.file && (
                  <DropZoneFileRetryTrigger
                    isDisabled={state.isDisabled}
                    onPress={() => state.retry(item.id)}
                  />
                )}
                {!!canPreview && <DropZonePreviewTrigger isDisabled={state.isDisabled} />}
                <DropZoneFileRemoveTrigger
                  aria-label={`Remove ${item.name}`}
                  isDisabled={state.isDisabled}
                  onPress={() => startRemove(item.id)}
                />
              </DropZoneFileHeader>
              {!!canPreview && (
                <DropZonePreviewPanel
                  alt={item.name}
                  src={state.previews[item.id]?.url ?? item.previewUrl}
                />
              )}
            </DropZoneFileItem>
          </DropZoneSlot>
        );
      })}
      {!state.isFull && (
        <DropZoneSlot isEmpty isInvalid={!!state.validationError}>
          <DropZoneTrigger {...state.getTriggerProps()} />
        </DropZoneSlot>
      )}
    </div>
  );
};

DropZoneRoot.displayName = "SY INC.DropZone";
DropZoneArea.displayName = "SY INC.DropZone.Area";
DropZoneTrigger.displayName = "SY INC.DropZone.Trigger";
DropZoneClearTrigger.displayName = "SY INC.DropZone.ClearTrigger";
DropZoneSlots.displayName = "SY INC.DropZone.Slots";
DropZoneSlot.displayName = "SY INC.DropZone.Slot";
DropZoneFileItem.displayName = "SY INC.DropZone.FileItem";
DropZoneFileHeader.displayName = "SY INC.DropZone.FileHeader";
DropZoneFileFormatIcon.displayName = "SY INC.DropZone.FileFormatIcon";
DropZoneFileInfo.displayName = "SY INC.DropZone.FileInfo";
DropZoneFileName.displayName = "SY INC.DropZone.FileName";
DropZoneFileMeta.displayName = "SY INC.DropZone.FileMeta";
DropZoneFileProgress.displayName = "SY INC.DropZone.FileProgress";
DropZoneFileRetryTrigger.displayName = "SY INC.DropZone.FileRetryTrigger";
DropZoneFileRemoveTrigger.displayName = "SY INC.DropZone.FileRemoveTrigger";
DropZonePreviewTrigger.displayName = "SY INC.DropZone.PreviewTrigger";
DropZonePreviewPanel.displayName = "SY INC.DropZone.PreviewPanel";

export {
  DropZoneRoot,
  DropZoneArea,
  DropZoneTrigger,
  DropZoneClearTrigger,
  DropZoneSlots,
  DropZoneSlot,
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

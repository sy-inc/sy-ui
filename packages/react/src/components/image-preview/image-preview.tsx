"use client";

import type {ComponentPropsWithRef, ReactElement, RefObject} from "react";
import type {ControlledProps} from "react-medium-image-zoom";

import {mergeRefs, useLayoutEffect} from "@react-aria/utils";
import {closeButtonVariants, imagePreviewVariants} from "@sy-inc/styles";
import {cloneElement, createContext, use, useEffect, useRef, useState} from "react";
import {Controlled as Zoom} from "react-medium-image-zoom";

import {useOverlayState} from "../../hooks/use-overlay-state";
import {composeSlotClassName} from "../../utils/compose";
import {CloseIcon} from "../icons";

const slots = imagePreviewVariants();

export interface ImagePreviewProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** One image, or a picture element containing an image. Keep its native alt and ref. */
  children: ReactElement;
  /** Optional full-resolution image. Falls back to the thumbnail while loading or on failure. */
  previewSrc?: string;
  /** Whether the preview is open (controlled). */
  isOpen?: boolean;
  /** Whether to open after the image has loaded. @default false */
  defaultOpen?: boolean;
  /** Called once for each requested change of open state. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Render the image without preview interaction. @default false */
  isDisabled?: boolean;
  /** Accessible prefix for the opening button; the image alt is appended. @default "Open image" */
  openLabel?: string;
  /** Accessible name for the closing button. @default "Close image" */
  closeLabel?: string;
  /** Class overrides for independently styled DOM parts. */
  classNames?: Partial<Record<"dialog" | "closeButton", string>>;
}

// ZoomContent mounts only when a decoded image and its dialog exist. Waiting for it
// makes initial controlled/default-open previews safe for lazy images as well.
const PreviewContext = createContext<{
  setReady: (ready: boolean) => void;
  closeButtonClassName?: string;
  rootRef: RefObject<HTMLDivElement | null>;
} | null>(null);

function PreviewContent({
  buttonUnzoom,
  img,
  modalState,
}: Parameters<NonNullable<ControlledProps["ZoomContent"]>>[0]) {
  const {closeButtonClassName, rootRef, setReady} = use(PreviewContext)!;
  const cropRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const crop = cropRef.current;

    if (!crop) return;
    // Only the closing handoff is clipped; the open states force inset(0) in CSS.
    // Clearing otherwise keeps a stale rect from leaking into the next open.
    if (modalState !== "UNLOADING") {
      crop.style.removeProperty("--image-preview-crop");

      return;
    }
    const thumbnail = rootRef.current?.querySelector("img");

    if (!thumbnail) return;
    // The engine returns the full image to its object-fit position. Clip that
    // image to the thumbnail's box so the final handoff does not visibly jump.
    const bounds = thumbnail.getBoundingClientRect();
    const viewport = crop.getBoundingClientRect();
    const style = getComputedStyle(thumbnail);

    crop.style.setProperty(
      "--image-preview-crop",
      `inset(${bounds.top - viewport.top}px ${viewport.right - bounds.right}px ${viewport.bottom - bounds.bottom}px ${bounds.left - viewport.left}px round ${style.borderRadius})`,
    );
  }, [modalState, rootRef]);

  useEffect(() => {
    setReady(true);

    return () => setReady(false);
  }, [setReady]);

  return (
    <>
      <div ref={cropRef} className={slots.crop()} data-state={modalState}>
        {img}
      </div>
      {cloneElement(buttonUnzoom, {
        className: closeButtonVariants({
          className: composeSlotClassName(slots.closeButton, closeButtonClassName),
        }),
        ...{"data-slot": "image-preview-close-button"},
      })}
    </>
  );
}

export function ImagePreview({
  children,
  className,
  classNames,
  closeLabel = "Close image",
  defaultOpen = false,
  isDisabled = false,
  isOpen,
  onOpenChange,
  openLabel = "Open image",
  previewSrc,
  ref,
  ...props
}: ImagePreviewProps) {
  const state = useOverlayState({defaultOpen, isOpen, onOpenChange});
  const rootRef = useRef<HTMLDivElement>(null);
  const [isReady, setReady] = useState(false);
  const open = state.isOpen && isReady && !isDisabled;

  return (
    <div
      {...props}
      ref={mergeRefs(rootRef, ref)}
      className={composeSlotClassName(slots.base, className)}
      data-disabled={isDisabled || undefined}
      data-open={open}
      data-slot="image-preview"
    >
      {isDisabled ? (
        children
      ) : (
        <PreviewContext value={{closeButtonClassName: classNames?.closeButton, rootRef, setReady}}>
          <Zoom
            a11yNameButtonUnzoom={closeLabel}
            a11yNameButtonZoom={openLabel}
            classDialog={composeSlotClassName(slots.dialog, classNames?.dialog)}
            IconUnzoom={CloseIcon}
            isZoomed={open}
            ZoomContent={PreviewContent}
            zoomImg={previewSrc ? {src: previewSrc, srcSet: "", sizes: ""} : undefined}
            onZoomChange={(nextOpen) => {
              // Native dialog close follows the requested animated close.
              if (nextOpen !== state.isOpen) state.setOpen(nextOpen);
            }}
          >
            {children}
          </Zoom>
        </PreviewContext>
      )}
    </div>
  );
}

ImagePreview.displayName = "SY INC.ImagePreview";

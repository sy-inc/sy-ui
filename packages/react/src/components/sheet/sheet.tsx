"use client";

import type {UseOverlayStateReturn} from "../../hooks/use-overlay-state";
import type {DOMRenderProps} from "../../utils/dom";
import type {SurfaceVariants} from "../surface";
import type {SheetVariants} from "@sy-inc/styles";
import type {CSSProperties, ComponentPropsWithRef, ReactElement, ReactNode} from "react";
import type {ButtonProps as ButtonPrimitiveProps} from "react-aria-components/Button";
import type {DialogProps as DialogPrimitiveProps} from "react-aria-components/Dialog";

import {mergeProps, mergeRefs} from "@react-aria/utils";
import {sheetVariants} from "@sy-inc/styles";
import React, {createContext, use, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  Dialog as DialogPrimitive,
  DialogTrigger as DialogTriggerPrimitive,
  Heading as HeadingPrimitive,
  OverlayTriggerStateContext,
} from "react-aria-components/Dialog";
import {
  ModalOverlay as ModalOverlayPrimitive,
  Modal as ModalPrimitive,
} from "react-aria-components/Modal";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {CloseButton} from "../close-button";
import {SurfaceContext} from "../surface";

export type SheetPlacement = "top" | "bottom" | "left" | "right";
export type SheetSnapPoint = number | `${number}px` | `${number}%`;
type ParsedSnapPoint = {css: string; unit: "px" | "relative"; value: number};

const EMPTY_SNAP_POINTS: readonly SheetSnapPoint[] = [];
const backgroundScales = new WeakMap<HTMLElement, number>();
const nestedTransforms: Record<SheetPlacement, string> = {
  bottom: "scale(0.9875) translate3d(0, -16px, 0)",
  left: "scale(0.9875) translate3d(16px, 0, 0)",
  right: "scale(0.9875) translate3d(-16px, 0, 0)",
  top: "scale(0.9875) translate3d(0, 16px, 0)",
};

function parseSnapPoint(point: SheetSnapPoint): ParsedSnapPoint {
  if (typeof point === "number") {
    if (!Number.isFinite(point) || point < 0 || point > 1)
      throw new Error("Sheet snap point numbers must be between 0 and 1.");

    return {css: `${point * 100}%`, unit: "relative", value: point};
  }
  const match = /^(\d+(?:\.\d+)?)(px|%)$/.exec(point);

  if (!match) throw new Error("Sheet snap points only support numbers, px, and % values.");
  const unit = match[2] === "px" ? "px" : "relative";

  return {css: point, unit, value: unit === "relative" ? Number(match[1]) / 100 : Number(match[1])};
}

function validateSnapPoints(points: readonly SheetSnapPoint[]) {
  const parsed = points.map(parseSnapPoint);

  for (let index = 1; index < parsed.length; index++) {
    if (parsed[index - 1]!.unit !== parsed[index]!.unit)
      throw new Error("Sheet snap points cannot mix px values with number or % values.");
    if (parsed[index - 1]!.value >= parsed[index]!.value)
      throw new Error("Sheet snap points must be strictly increasing.");
  }

  return parsed;
}

function pointPixels(point: SheetSnapPoint, dimension: number) {
  const parsed = parseSnapPoint(point);

  return parsed.unit === "px" ? parsed.value : parsed.value * dimension;
}

function snapPointIndex(points: readonly SheetSnapPoint[], value: SheetSnapPoint | undefined) {
  if (value === undefined) return Math.max(0, points.length - 1);
  const index = points.findIndex((point) => point === value);

  return index < 0 ? Math.max(0, points.length - 1) : index;
}

function useBackgroundScale(enabled: boolean, open: boolean) {
  useEffect(() => {
    if (!enabled || !open) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-sheet-background]"));

    for (const target of targets) {
      const count = backgroundScales.get(target) ?? 0;

      backgroundScales.set(target, count + 1);
      if (count === 0) target.dataset["sheetBackgroundScaled"] = "true";
    }

    return () => {
      for (const target of targets) {
        const count = backgroundScales.get(target);

        if (!count) continue;
        if (count === 1) {
          delete target.dataset["sheetBackgroundScaled"];
          backgroundScales.delete(target);
        } else backgroundScales.set(target, count - 1);
      }
    };
  }, [enabled, open]);
}

type SheetContextValue = {
  activeIndex: number;
  backdropVisible: boolean;
  closeThreshold: number;
  dragging: boolean;
  isDetached: boolean;
  isDismissable: boolean;
  isHandleOnly: boolean;
  isModal: boolean;
  isNested: boolean;
  onAnimationEnd?: React.AnimationEventHandler<HTMLElement>;
  onDrag?: (event: React.PointerEvent<Element>) => void;
  onRelease?: (event: React.PointerEvent<Element>) => void;
  nestedOpen: boolean;
  placement: SheetPlacement;
  shouldScaleBackground: boolean;
  parentSetNestedOpen?: (open: boolean) => void;
  setDragging: (dragging: boolean) => void;
  setNestedOpen?: (open: boolean) => void;
  setSnapIndex: (index: number) => void;
  slots?: ReturnType<typeof sheetVariants>;
  snapPoints: readonly SheetSnapPoint[];
};
const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = use(SheetContext);

  if (!context) throw new Error("Sheet parts must be rendered inside Sheet.Root.");

  return context;
}
function sheetData(context: SheetContextValue) {
  return {
    "data-active-snap-point": context.snapPoints[context.activeIndex],
    "data-detached": context.isDetached || undefined,
    "data-dragging": context.dragging || undefined,
    "data-handle-only": context.isHandleOnly || undefined,
    "data-modal": String(context.isModal),
    "data-nested": context.isNested || undefined,
    "data-nested-open": context.nestedOpen || undefined,
    "data-placement": context.placement,
    "data-sheet-snap-points": context.snapPoints.length > 0 || undefined,
    "data-sheet-backdrop-visible": String(context.backdropVisible),
    "data-snap-points": context.snapPoints.join(","),
  };
}

function useSheetDrag(contentRef: React.RefObject<HTMLDivElement | null>) {
  const context = useSheetContext();
  const overlayState = use(OverlayTriggerStateContext);
  const start = useRef(0),
    offset = useRef(0),
    velocity = useRef(0),
    last = useRef(0),
    lastTime = useRef(0),
    active = useRef(false);
  const vertical = context.placement === "top" || context.placement === "bottom";
  const direction = context.placement === "top" || context.placement === "left" ? -1 : 1;
  const position = useCallback(
    (event: React.PointerEvent) => (vertical ? event.clientY : event.clientX),
    [vertical],
  );
  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;

      if (context.isHandleOnly && !target.closest("[data-slot='sheet-handle']")) return;
      if (
        !context.isHandleOnly &&
        target.closest(
          "input, textarea, button, [role='button'], select, a, [data-slot='sheet-body']",
        )
      )
        return;
      start.current = position(event);
      last.current = start.current;
      lastTime.current = event.timeStamp;
      offset.current = 0;
      velocity.current = 0;
      active.current = true;
      try {
        contentRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is unavailable in some browser and test environments.
      }
    },
    [contentRef, context.isHandleOnly, position],
  );
  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!active.current || !contentRef.current) return;
      const current = position(event);

      offset.current = current - start.current;
      const elapsed = event.timeStamp - lastTime.current;

      if (elapsed > 0) velocity.current = (current - last.current) / elapsed;
      last.current = current;
      lastTime.current = event.timeStamp;
      contentRef.current.style.transition = "none";
      contentRef.current.style.transform = `translate${vertical ? "Y" : "X"}(${offset.current}px)`;
      context.setDragging(true);
      context.onDrag?.(event);
    },
    [contentRef, context, position, vertical],
  );
  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (!active.current) return;
      active.current = false;
      context.onRelease?.(event);
      const element = contentRef.current;

      if (!element) return;
      try {
        element.releasePointerCapture(event.pointerId);
      } catch {
        // The browser may already have released this pointer.
      }
      const dimension = vertical ? element.offsetHeight : element.offsetWidth;
      const shouldClose =
        context.isDismissable &&
        (direction * offset.current > dimension * context.closeThreshold ||
          direction * velocity.current > 0.5);
      const resetDrag = () => {
        element.style.transition = "transform 200ms var(--sheet-ease)";
        element.style.transform = "";
        const clear = () => {
          element.style.transition = "";
        };

        element.addEventListener("transitionend", clear, {once: true});
        window.setTimeout(clear, 250);
      };

      if (shouldClose) {
        overlayState?.close();
        resetDrag();
      } else if (context.snapPoints.length) {
        const desired =
          pointPixels(context.snapPoints[context.activeIndex]!, dimension) -
          direction * offset.current;
        let nearest = 0;

        context.snapPoints.forEach((point, index) => {
          if (
            Math.abs(pointPixels(point, dimension) - desired) <
            Math.abs(pointPixels(context.snapPoints[nearest]!, dimension) - desired)
          )
            nearest = index;
        });
        context.setSnapIndex(nearest);
        resetDrag();
      } else resetDrag();
      context.setDragging(false);
      offset.current = 0;
      velocity.current = 0;
    },
    [contentRef, context, direction, overlayState, vertical],
  );

  return {onPointerDown, onPointerMove, onPointerUp};
}

export interface SheetRootProps extends ComponentPropsWithRef<typeof DialogTriggerPrimitive> {
  activeSnapPoint?: SheetSnapPoint;
  closeThreshold?: number;
  defaultActiveSnapPoint?: SheetSnapPoint;
  fadeFromIndex?: number;
  isDetached?: boolean;
  isDismissable?: boolean;
  isHandleOnly?: boolean;
  isModal?: boolean;
  onAnimationEnd?: React.AnimationEventHandler<HTMLElement>;
  onActiveSnapPointChange?: (point: SheetSnapPoint) => void;
  onClose?: () => void;
  onDrag?: (event: React.PointerEvent<Element>) => void;
  onRelease?: (event: React.PointerEvent<Element>) => void;
  placement?: SheetPlacement;
  shouldScaleBackground?: boolean;
  snapPoints?: readonly SheetSnapPoint[];
  state?: UseOverlayStateReturn;
}
type SheetRootBaseProps = SheetRootProps & {nested?: boolean};
const SheetRootBase = ({
  activeSnapPoint,
  children,
  closeThreshold = 0.25,
  defaultActiveSnapPoint,
  fadeFromIndex,
  isDetached = false,
  isDismissable = true,
  isHandleOnly = false,
  isModal = true,
  nested: isNested = false,
  onActiveSnapPointChange,
  onAnimationEnd,
  onClose,
  onDrag,
  onOpenChange,
  onRelease,
  placement = "bottom",
  shouldScaleBackground = false,
  snapPoints: providedSnapPoints = EMPTY_SNAP_POINTS,
  state,
  ...triggerProps
}: SheetRootBaseProps) => {
  if (closeThreshold < 0 || closeThreshold > 1)
    throw new Error("Sheet closeThreshold must be between 0 and 1.");
  validateSnapPoints(providedSnapPoints);
  const parent = use(SheetContext);
  const resolvedFadeFromIndex = fadeFromIndex ?? Math.max(0, providedSnapPoints.length - 1);

  if (resolvedFadeFromIndex < 0 || resolvedFadeFromIndex >= Math.max(1, providedSnapPoints.length))
    throw new Error("Sheet fadeFromIndex must be a snap point index.");
  const [dragging, setDragging] = useState(false),
    [uncontrolledSnap, setUncontrolledSnap] = useState(() =>
      snapPointIndex(providedSnapPoints, defaultActiveSnapPoint),
    ),
    [nestedOpen, setNestedOpen] = useState(false);
  const activeIndex =
    activeSnapPoint === undefined
      ? uncontrolledSnap
      : snapPointIndex(providedSnapPoints, activeSnapPoint);
  const setSnapIndex = useCallback(
    (next: number) => {
      const bounded = Math.max(0, Math.min(next, providedSnapPoints.length - 1));
      const point = providedSnapPoints[bounded];

      if (point === undefined) return;
      if (activeSnapPoint === undefined) setUncontrolledSnap(bounded);
      onActiveSnapPointChange?.(point);
    },
    [activeSnapPoint, onActiveSnapPointChange, providedSnapPoints],
  );
  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange?.(open);
      state?.setOpen(open);
      if (!open) onClose?.();
    },
    [onClose, onOpenChange, state],
  );
  const context = useMemo<SheetContextValue>(
    () => ({
      activeIndex,
      backdropVisible: !providedSnapPoints.length || activeIndex >= resolvedFadeFromIndex,
      closeThreshold,
      dragging,
      isDetached,
      isDismissable,
      isHandleOnly,
      isModal,
      isNested,
      nestedOpen,
      onAnimationEnd,
      onDrag,
      onRelease,
      parentSetNestedOpen: parent?.setNestedOpen,
      placement,
      setDragging,
      setNestedOpen,
      setSnapIndex,
      shouldScaleBackground,
      slots: sheetVariants({placement}),
      snapPoints: providedSnapPoints,
    }),
    [
      activeIndex,
      closeThreshold,
      dragging,
      isDetached,
      isDismissable,
      isHandleOnly,
      isModal,
      isNested,
      nestedOpen,
      onAnimationEnd,
      onDrag,
      onRelease,
      parent?.setNestedOpen,
      placement,
      providedSnapPoints,
      resolvedFadeFromIndex,
      setSnapIndex,
      shouldScaleBackground,
    ],
  );
  const controlledProps = state ? {isOpen: state.isOpen} : {};

  return (
    <SheetContext value={context}>
      <DialogTriggerPrimitive
        {...(mergeProps(triggerProps as object, controlledProps, {
          onOpenChange: handleOpenChange,
        }) as object)}
      >
        {children}
      </DialogTriggerPrimitive>
    </SheetContext>
  );
};

export const SheetRoot = SheetRootBase;
export const SheetNestedRoot = (props: SheetRootProps) => <SheetRootBase {...props} nested />;

export interface SheetTriggerProps {
  children: ReactElement;
}
export const SheetTrigger = ({children}: SheetTriggerProps) => {
  useSheetContext();

  return children;
};
export interface SheetBackdropProps extends ComponentPropsWithRef<typeof ModalOverlayPrimitive> {
  variant?: SheetVariants["variant"];
}
export const SheetBackdrop = ({
  children,
  className,
  onClick,
  style,
  variant,
  ...props
}: SheetBackdropProps) => {
  const context = useSheetContext();
  const state = use(OverlayTriggerStateContext);
  const open = state?.isOpen ?? true;
  const backdrop = sheetVariants({variant}).backdrop;

  useBackgroundScale(context.shouldScaleBackground, open);
  useEffect(() => {
    if (!context.isNested) return;
    context.parentSetNestedOpen?.(open);

    return () => context.parentSetNestedOpen?.(false);
  }, [context.isNested, context.parentSetNestedOpen, open]);
  // Non-modal backdrops are pointer-events:none so the page behind stays interactive;
  // outside-click dismissal is modal-only.
  if (!context.isModal)
    return (
      <dom.div
        data-slot="sheet-backdrop"
        {...sheetData(context)}
        style={style as CSSProperties}
        {...(props as any)}
        className={
          typeof className === "function"
            ? className({defaultClassName: backdrop()} as never)
            : composeSlotClassName(backdrop, className)
        }
        onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
      >
        {children}
      </dom.div>
    );

  return (
    <ModalOverlayPrimitive
      className={composeTwRenderProps(className, backdrop())}
      data-slot="sheet-backdrop"
      isDismissable={context.isDismissable}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      {...sheetData(context)}
      style={style}
      {...props}
    >
      {children}
    </ModalOverlayPrimitive>
  );
};
export interface SheetContentProps extends ComponentPropsWithRef<typeof ModalPrimitive> {}
export const SheetContent = ({
  children,
  className,
  onAnimationEnd,
  ref,
  style,
  ...props
}: SheetContentProps) => {
  const context = useSheetContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedRef = mergeRefs(contentRef, ref);
  const dragHandlers = useSheetDrag(contentRef);
  const point = context.snapPoints[context.activeIndex];
  const extent =
    point === undefined
      ? undefined
      : context.placement === "top" || context.placement === "bottom"
        ? {height: parseSnapPoint(point).css}
        : {width: parseSnapPoint(point).css};
  const nestedStyle: CSSProperties = context.nestedOpen
    ? {
        borderRadius: 8,
        overflow: "hidden",
        transform: nestedTransforms[context.placement],
        transition: "transform 500ms var(--sheet-ease)",
      }
    : {};
  const contentStyle =
    typeof style === "function"
      ? (renderProps: Parameters<typeof style>[0]) => ({
          ...extent,
          ...nestedStyle,
          ...style(renderProps),
        })
      : {...extent, ...nestedStyle, ...style};
  const handleAnimationEnd: React.AnimationEventHandler<HTMLDivElement> = (event) => {
    context.onAnimationEnd?.(event);
    onAnimationEnd?.(event);
  };

  if (!context.isModal)
    return (
      <dom.div
        ref={mergedRef}
        data-slot="sheet-content"
        {...sheetData(context)}
        {...dragHandlers}
        {...(props as any)}
        style={contentStyle as CSSProperties}
        className={
          typeof className === "function"
            ? className({defaultClassName: context.slots?.content()} as never)
            : composeSlotClassName(context.slots?.content, className)
        }
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
      </dom.div>
    );

  return (
    <ModalPrimitive
      ref={mergedRef}
      className={composeTwRenderProps(className, context.slots?.content())}
      data-slot="sheet-content"
      {...sheetData(context)}
      {...dragHandlers}
      {...props}
      style={contentStyle}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </ModalPrimitive>
  );
};
export interface SheetDialogProps extends DialogPrimitiveProps {}
export const SheetDialog = ({children, className, ...props}: SheetDialogProps) => {
  const context = useSheetContext();

  return (
    <SurfaceContext value={{variant: "default" as SurfaceVariants["variant"]}}>
      <DialogPrimitive
        className={composeSlotClassName(context.slots?.dialog, className)}
        data-slot="sheet-dialog"
        {...sheetData(context)}
        {...props}
      >
        {children}
      </DialogPrimitive>
    </SurfaceContext>
  );
};

type SheetDivProps = DOMRenderProps<"div", undefined> & ComponentPropsWithRef<"div">;
export type SheetHeaderProps = SheetDivProps;
export const SheetHeader = ({children, className, ...props}: SheetHeaderProps) => {
  const context = useSheetContext();

  return (
    <dom.div
      className={composeSlotClassName(context.slots?.header, className)}
      data-slot="sheet-header"
      {...props}
    >
      {children}
    </dom.div>
  );
};
export type SheetBodyProps = SheetDivProps;
export const SheetBody = ({children, className, ...props}: SheetBodyProps) => {
  const context = useSheetContext();

  return (
    <dom.div
      className={composeSlotClassName(context.slots?.body, className)}
      data-slot="sheet-body"
      {...props}
    >
      {children}
    </dom.div>
  );
};
export type SheetFooterProps = SheetDivProps;
export const SheetFooter = ({children, className, ...props}: SheetFooterProps) => {
  const context = useSheetContext();

  return (
    <dom.div
      className={composeSlotClassName(context.slots?.footer, className)}
      data-slot="sheet-footer"
      {...props}
    >
      {children}
    </dom.div>
  );
};
export interface SheetHeadingProps extends ComponentPropsWithRef<typeof HeadingPrimitive> {}
export const SheetHeading = ({className, ...props}: SheetHeadingProps) => {
  const context = useSheetContext();

  return (
    <HeadingPrimitive
      className={composeSlotClassName(context.slots?.heading, className)}
      data-slot="sheet-heading"
      slot="title"
      {...props}
    />
  );
};
export type SheetHandleProps = SheetDivProps;
export const SheetHandle = ({className, onClick, onKeyDown, ...props}: SheetHandleProps) => {
  const context = useSheetContext();
  const move = (delta: number) => context.setSnapIndex(context.activeIndex + delta);

  return (
    <dom.div
      aria-label="Adjust sheet size"
      className={composeSlotClassName(context.slots?.handle, className)}
      data-slot="sheet-handle"
      role="button"
      tabIndex={0}
      {...props}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        move(1);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (["ArrowUp", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          move(1);
        } else if (["ArrowDown", "ArrowLeft"].includes(event.key)) {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      <span data-slot="sheet-handle-bar" />
    </dom.div>
  );
};
export interface SheetCloseTriggerProps extends ButtonPrimitiveProps {
  children?: ReactNode;
  className?: string;
}
export const SheetCloseTrigger = ({className, onPress, ...props}: SheetCloseTriggerProps) => {
  const context = useSheetContext();
  const state = use(OverlayTriggerStateContext);

  return (
    <CloseButton
      className={composeTwRenderProps(className, context.slots?.closeTrigger())}
      data-slot="sheet-close-trigger"
      slot="close"
      {...props}
      onPress={(event) => {
        onPress?.(event);
        state?.close();
      }}
    />
  );
};

Object.assign(SheetRoot, {displayName: "SY INC.Sheet"});
Object.assign(SheetNestedRoot, {displayName: "SY INC.Sheet.NestedRoot"});
Object.assign(SheetTrigger, {displayName: "SY INC.Sheet.Trigger"});
Object.assign(SheetBackdrop, {displayName: "SY INC.Sheet.Backdrop"});
Object.assign(SheetContent, {displayName: "SY INC.Sheet.Content"});
Object.assign(SheetDialog, {displayName: "SY INC.Sheet.Dialog"});
Object.assign(SheetHeader, {displayName: "SY INC.Sheet.Header"});
Object.assign(SheetBody, {displayName: "SY INC.Sheet.Body"});
Object.assign(SheetFooter, {displayName: "SY INC.Sheet.Footer"});
Object.assign(SheetHeading, {displayName: "SY INC.Sheet.Heading"});
Object.assign(SheetHandle, {displayName: "SY INC.Sheet.Handle"});
Object.assign(SheetCloseTrigger, {displayName: "SY INC.Sheet.CloseTrigger"});

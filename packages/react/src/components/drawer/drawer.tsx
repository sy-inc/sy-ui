"use client";

import type {UseOverlayStateReturn} from "../../hooks/use-overlay-state";
import type {DOMRenderProps} from "../../utils/dom";
import type {SurfaceVariants} from "../surface";
import type {DrawerVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {ButtonProps as ButtonPrimitiveProps} from "react-aria-components/Button";
import type {DialogProps as DialogPrimitiveProps} from "react-aria-components/Dialog";

import {filterDOMProps, useObjectRef} from "@react-aria/utils";
import {drawerVariants} from "@sy-inc/styles";
import React, {createContext, use, useEffect, useMemo, useRef, useState} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
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

export type DrawerPlacement = "top" | "bottom" | "left" | "right";
export type DrawerSnapPoint = number | `${number}px` | `${number}%`;
type ParsedSnapPoint = {css: string; unit: "px" | "relative"; value: number};

const EMPTY_SNAP_POINTS: readonly DrawerSnapPoint[] = [];
const backgroundScales = new WeakMap<HTMLElement, number>();
const DEFAULT_SURFACE_CONTEXT = {variant: "default" as SurfaceVariants["variant"]};

function parseSnapPoint(point: DrawerSnapPoint): ParsedSnapPoint {
  if (typeof point === "number") {
    if (!Number.isFinite(point) || point < 0 || point > 1)
      throw new Error("Drawer snap point numbers must be between 0 and 1.");

    return {css: `${point * 100}%`, unit: "relative", value: point};
  }
  const match = /^(\d+(?:\.\d+)?)(px|%)$/.exec(point);

  if (!match) throw new Error("Drawer snap points only support numbers, px, and % values.");
  const unit = match[2] === "px" ? "px" : "relative";

  return {css: point, unit, value: unit === "relative" ? Number(match[1]) / 100 : Number(match[1])};
}

function validateSnapPoints(points: readonly DrawerSnapPoint[]) {
  const parsed = points.map(parseSnapPoint);

  for (let index = 1; index < parsed.length; index++) {
    if (parsed[index - 1]!.unit !== parsed[index]!.unit)
      throw new Error("Drawer snap points cannot mix px values with number or % values.");
    if (parsed[index - 1]!.value >= parsed[index]!.value)
      throw new Error("Drawer snap points must be strictly increasing.");
  }

  return parsed;
}

function pointPixels(point: ParsedSnapPoint, dimension: number) {
  return point.unit === "px" ? point.value : point.value * dimension;
}

function snapPointIndex(points: readonly DrawerSnapPoint[], value: DrawerSnapPoint | undefined) {
  const index = value === undefined ? -1 : points.indexOf(value);

  return index < 0 ? Math.max(0, points.length - 1) : index;
}

function useBackgroundScale(enabled: boolean, open: boolean) {
  useEffect(() => {
    if (!enabled || !open) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-drawer-background]"));

    for (const target of targets) {
      const count = backgroundScales.get(target) ?? 0;

      backgroundScales.set(target, count + 1);
      if (count === 0) target.dataset["drawerBackgroundScaled"] = "true";
    }

    return () => {
      for (const target of targets) {
        const count = backgroundScales.get(target);

        if (!count) continue;
        if (count === 1) {
          delete target.dataset["drawerBackgroundScaled"];
          backgroundScales.delete(target);
        } else backgroundScales.set(target, count - 1);
      }
    };
  }, [enabled, open]);
}

type DrawerContextValue = {
  activeIndex: number;
  backdropVisible: boolean;
  closeThreshold: number;
  dragging: boolean;
  isDetached: boolean;
  isDismissable: boolean;
  isHandleOnly: boolean;
  isModal: boolean;
  isNested: boolean;
  onDrag?: (event: React.PointerEvent<Element>) => void;
  onRelease?: (event: React.PointerEvent<Element>) => void;
  nestedOpen: boolean;
  parsedSnapPoints: readonly ParsedSnapPoint[];
  placement: DrawerPlacement;
  shouldScaleBackground: boolean;
  parentSetNestedOpen?: (open: boolean) => void;
  setDragging: (dragging: boolean) => void;
  setNestedOpen?: (open: boolean) => void;
  setSnapIndex: (index: number) => void;
  slots: ReturnType<typeof drawerVariants>;
  snapPoints: readonly DrawerSnapPoint[];
};
const DrawerContext = createContext<DrawerContextValue | null>(null);

const noop = () => {};
// Parts rendered without Drawer.Root (e.g. a Backdrop controlled via isOpen) fall back to these.
const DEFAULT_DRAWER_CONTEXT: DrawerContextValue = {
  activeIndex: 0,
  backdropVisible: true,
  closeThreshold: 0.25,
  dragging: false,
  isDetached: false,
  isDismissable: true,
  isHandleOnly: false,
  isModal: true,
  isNested: false,
  nestedOpen: false,
  parsedSnapPoints: [],
  placement: "bottom",
  setDragging: noop,
  setSnapIndex: noop,
  shouldScaleBackground: false,
  slots: drawerVariants({placement: "bottom"}),
  snapPoints: EMPTY_SNAP_POINTS,
};

function useDrawerContext() {
  return use(DrawerContext) ?? DEFAULT_DRAWER_CONTEXT;
}
function drawerData(context: DrawerContextValue) {
  return {
    "data-active-snap-point": context.snapPoints[context.activeIndex],
    "data-detached": context.isDetached || undefined,
    "data-dragging": context.dragging || undefined,
    "data-drawer-backdrop-visible": String(context.backdropVisible),
    "data-drawer-snap-points": context.snapPoints.length > 0 || undefined,
    "data-handle-only": context.isHandleOnly || undefined,
    "data-modal": String(context.isModal),
    "data-nested": context.isNested || undefined,
    "data-nested-open": context.nestedOpen || undefined,
    "data-placement": context.placement,
    "data-snap-points": context.snapPoints.join(","),
  };
}

type OverlayState = React.ContextType<typeof OverlayTriggerStateContext>;

// Non-modal parts are plain divs: resolve RAC render props against a static open state and keep
// only DOM props so overlay-only props (isDismissable, isEntering, …) don't leak onto the div.
function nonModalProps(
  {children, className, ref, render, style, ...props}: DrawerContentProps,
  defaultClassName: string | undefined,
  state: OverlayState,
) {
  const values = {defaultClassName, isEntering: false, isExiting: false, state: state!};
  const resolvedClassName = composeTwRenderProps(className, defaultClassName);

  return {
    ...filterDOMProps(props, {global: true, labelable: true}),
    children:
      typeof children === "function" ? children({...values, defaultChildren: undefined}) : children,
    className:
      typeof resolvedClassName === "function" ? resolvedClassName(values) : resolvedClassName,
    ref,
    render: render as DOMRenderProps<"div", unknown>["render"],
    style: typeof style === "function" ? style({...values, defaultStyle: {}}) : style,
  };
}

// px of movement before a press becomes a drag, so taps don't nudge the panel.
const DRAG_THRESHOLD = 8;

function useDrawerDrag(
  contentRef: React.RefObject<HTMLDivElement | null>,
  context: DrawerContextValue,
) {
  const overlayState = use(OverlayTriggerStateContext);
  const drag = useRef({
    active: false,
    dragging: false,
    last: 0,
    lastTime: 0,
    offset: 0,
    start: 0,
    velocity: 0,
  });
  const vertical = context.placement === "top" || context.placement === "bottom";
  const direction = context.placement === "top" || context.placement === "left" ? -1 : 1;
  const position = (event: React.PointerEvent) => (vertical ? event.clientY : event.clientX);
  const resetTransform = (element: HTMLElement) => {
    element.style.transition = "transform 200ms var(--drawer-ease)";
    element.style.transform = "";
    const clear = () => {
      element.style.transition = "";
    };

    element.addEventListener("transitionend", clear, {once: true});
    window.setTimeout(clear, 250);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    // Nothing to do with a drag that can neither dismiss nor move between snap points.
    if (!context.isDismissable && context.parsedSnapPoints.length < 2) return;
    const target = event.target as HTMLElement;

    // React bubbles events from nested (portaled) drawers through this one; only drag our own content.
    if (target.closest("[data-slot='drawer-content']") !== event.currentTarget) return;
    const onHandle = target.closest("[data-slot='drawer-handle']") !== null;

    if (context.isHandleOnly && !onHandle) return;
    // The handle is role="button" with snap points but still drags, so it skips this exclusion.
    if (
      !onHandle &&
      target.closest(
        "input, textarea, button, [role='button'], select, a, [data-slot='drawer-body']",
      )
    )
      return;
    const start = position(event);

    drag.current = {
      active: true,
      dragging: false,
      last: start,
      lastTime: event.timeStamp,
      offset: 0,
      start,
      velocity: 0,
    };
  };
  const onPointerMove = (event: React.PointerEvent) => {
    const state = drag.current;
    const element = contentRef.current;

    if (!state.active || !element) return;
    const current = position(event);
    const delta = current - state.start;
    const elapsed = event.timeStamp - state.lastTime;

    if (elapsed > 0) state.velocity = (current - state.last) / elapsed;
    state.last = current;
    state.lastTime = event.timeStamp;
    if (!state.dragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      state.dragging = true;
      element.style.transition = "none";
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is unavailable in some browser and test environments.
      }
      context.setDragging(true);
    }
    // Dragging away from dismissal is only meaningful while a larger snap point exists.
    const canExpand = context.activeIndex < context.parsedSnapPoints.length - 1;

    state.offset = canExpand ? delta : direction * Math.max(0, direction * delta);
    element.style.transform = `translate${vertical ? "Y" : "X"}(${state.offset}px)`;
    context.onDrag?.(event);
  };
  // Ends the gesture; returns the content element when a drag actually happened.
  const endDrag = (event: React.PointerEvent) => {
    const state = drag.current;
    const element = contentRef.current;
    const wasDragging = state.active && state.dragging;

    state.active = false;
    state.dragging = false;
    if (!wasDragging || !element) return null;
    context.onRelease?.(event);
    context.setDragging(false);

    return element;
  };
  const onPointerUp = (event: React.PointerEvent) => {
    const state = drag.current;
    const element = endDrag(event);

    if (!element) return;
    try {
      element.releasePointerCapture(event.pointerId);
    } catch {
      // The browser may already have released this pointer.
    }
    const dimension = vertical ? element.offsetHeight : element.offsetWidth;
    const shouldClose =
      context.isDismissable &&
      (direction * state.offset > dimension * context.closeThreshold ||
        direction * state.velocity > 0.5);

    if (shouldClose) overlayState?.close();
    else if (context.parsedSnapPoints.length) {
      const points = context.parsedSnapPoints.map((point) => pointPixels(point, dimension));
      const desired = points[context.activeIndex]! - direction * state.offset;
      let nearest = 0;

      points.forEach((point, index) => {
        if (Math.abs(point - desired) < Math.abs(points[nearest]! - desired)) nearest = index;
      });
      context.setSnapIndex(nearest);
    }
    resetTransform(element);
  };
  // The browser took over the gesture (e.g. scroll or zoom): abandon it without closing or snapping.
  const onPointerCancel = (event: React.PointerEvent) => {
    const element = endDrag(event);

    if (element) resetTransform(element);
  };

  return {onPointerCancel, onPointerDown, onPointerMove, onPointerUp};
}

export interface DrawerRootProps extends ComponentPropsWithRef<typeof DialogTriggerPrimitive> {
  activeSnapPoint?: DrawerSnapPoint;
  closeThreshold?: number;
  defaultActiveSnapPoint?: DrawerSnapPoint;
  fadeFromIndex?: number;
  isDetached?: boolean;
  isDismissable?: boolean;
  isHandleOnly?: boolean;
  isModal?: boolean;
  onActiveSnapPointChange?: (point: DrawerSnapPoint) => void;
  onClose?: () => void;
  onDrag?: (event: React.PointerEvent<Element>) => void;
  onRelease?: (event: React.PointerEvent<Element>) => void;
  placement?: DrawerPlacement;
  shouldScaleBackground?: boolean;
  snapPoints?: readonly DrawerSnapPoint[];
  state?: UseOverlayStateReturn;
}
export const DrawerRoot = ({
  activeSnapPoint,
  children,
  closeThreshold = 0.25,
  defaultActiveSnapPoint,
  // The backdrop shows at every snap point unless fadeFromIndex opts lower points out of it.
  fadeFromIndex = 0,
  isDetached = false,
  isDismissable = true,
  isHandleOnly = false,
  isModal = true,
  onActiveSnapPointChange,
  onClose,
  onDrag,
  onOpenChange,
  onRelease,
  placement = "bottom",
  shouldScaleBackground = false,
  snapPoints: providedSnapPoints = EMPTY_SNAP_POINTS,
  state,
  ...triggerProps
}: DrawerRootProps) => {
  if (closeThreshold < 0 || closeThreshold > 1)
    throw new Error("Drawer closeThreshold must be between 0 and 1.");
  const parsedSnapPoints = validateSnapPoints(providedSnapPoints);
  const parent = use(DrawerContext);
  // Any Drawer rendered under another Drawer is nested; the parent recedes via [data-nested-open].
  const isNested = parent !== null;

  if (fadeFromIndex < 0 || fadeFromIndex >= Math.max(1, providedSnapPoints.length))
    throw new Error("Drawer fadeFromIndex must be a snap point index.");
  const [dragging, setDragging] = useState(false),
    [uncontrolledSnap, setUncontrolledSnap] = useState(() =>
      snapPointIndex(providedSnapPoints, defaultActiveSnapPoint),
    ),
    [nestedOpen, setNestedOpen] = useState(false);
  const activeIndex =
    activeSnapPoint === undefined
      ? uncontrolledSnap
      : snapPointIndex(providedSnapPoints, activeSnapPoint);
  const setSnapIndex = (next: number) => {
    const bounded = Math.max(0, Math.min(next, providedSnapPoints.length - 1));
    const point = providedSnapPoints[bounded];

    if (point === undefined) return;
    if (activeSnapPoint === undefined) setUncontrolledSnap(bounded);
    onActiveSnapPointChange?.(point);
  };
  // Not memoized: every consumer is a descendant that re-renders with the Root anyway.
  const context: DrawerContextValue = {
    activeIndex,
    // Without snap points activeIndex and fadeFromIndex are both 0, so the backdrop shows.
    backdropVisible: activeIndex >= fadeFromIndex,
    closeThreshold,
    dragging,
    isDetached,
    isDismissable,
    isHandleOnly,
    isModal,
    isNested,
    nestedOpen,
    onDrag,
    onRelease,
    parentSetNestedOpen: parent?.setNestedOpen,
    parsedSnapPoints,
    placement,
    setDragging,
    setNestedOpen,
    setSnapIndex,
    shouldScaleBackground,
    slots: drawerVariants({placement}),
    snapPoints: providedSnapPoints,
  };

  return (
    <DrawerContext value={context}>
      <DialogTriggerPrimitive
        {...triggerProps}
        {...(state && {isOpen: state.isOpen})}
        onOpenChange={(open) => {
          onOpenChange?.(open);
          state?.setOpen(open);
          if (!open) onClose?.();
        }}
      >
        {children}
      </DialogTriggerPrimitive>
    </DrawerContext>
  );
};

export interface DrawerTriggerProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {}
// To use an existing pressable (e.g. <Button>) as the trigger, place it directly inside Drawer.
export const DrawerTrigger = ({children, className, ...props}: DrawerTriggerProps) => {
  const context = useDrawerContext();

  return (
    <ButtonPrimitive
      className={composeTwRenderProps(className, context.slots.trigger())}
      data-slot="drawer-trigger"
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
};
export interface DrawerBackdropProps extends ComponentPropsWithRef<typeof ModalOverlayPrimitive> {
  variant?: DrawerVariants["variant"];
  /** Overrides `isDismissable` from `Drawer.Root` for outside-click, drag, and descendants. */
  isDismissable?: boolean;
}
export const DrawerBackdrop = ({
  children,
  className,
  isDismissable,
  onClick,
  style,
  variant,
  ...props
}: DrawerBackdropProps) => {
  const baseContext = useDrawerContext();
  const context = useMemo(
    () => (isDismissable === undefined ? baseContext : {...baseContext, isDismissable}),
    [baseContext, isDismissable],
  );
  const state = use(OverlayTriggerStateContext);
  const open = state?.isOpen ?? true;
  const backdrop = drawerVariants({variant}).backdrop;

  useBackgroundScale(context.shouldScaleBackground, open);
  // Only set when this drawer sits under a parent Drawer.Root.
  const setParentNestedOpen = context.parentSetNestedOpen;

  useEffect(() => {
    if (!setParentNestedOpen) return;
    setParentNestedOpen(open);

    return () => setParentNestedOpen(false);
  }, [setParentNestedOpen, open]);
  // Non-modal backdrops are pointer-events:none so the page behind stays interactive;
  // outside-click dismissal is modal-only.
  if (!context.isModal) {
    if (!open) return null;

    return (
      <DrawerContext value={context}>
        <dom.div
          data-slot="drawer-backdrop"
          {...drawerData(context)}
          {...nonModalProps({...props, children, className, onClick, style}, backdrop(), state)}
        />
      </DrawerContext>
    );
  }

  return (
    <DrawerContext value={context}>
      <ModalOverlayPrimitive
        className={composeTwRenderProps(className, backdrop())}
        data-slot="drawer-backdrop"
        isDismissable={context.isDismissable}
        onClick={(event) => {
          event.stopPropagation();
          onClick?.(event);
        }}
        {...drawerData(context)}
        style={style}
        {...props}
      >
        {children}
      </ModalOverlayPrimitive>
    </DrawerContext>
  );
};
export interface DrawerContentProps extends ComponentPropsWithRef<typeof ModalPrimitive> {
  /** Overrides `placement` from `Drawer.Root` for this panel and its parts. */
  placement?: DrawerPlacement;
}
export const DrawerContent = ({
  children,
  className,
  placement,
  ref,
  style,
  ...props
}: DrawerContentProps) => {
  const baseContext = useDrawerContext();
  const context = useMemo(
    () =>
      placement === undefined || placement === baseContext.placement
        ? baseContext
        : {...baseContext, placement, slots: drawerVariants({placement})},
    [baseContext, placement],
  );
  const state = use(OverlayTriggerStateContext);
  const contentRef = useObjectRef(ref);
  const dragHandlers = useDrawerDrag(contentRef, context);
  const point = context.parsedSnapPoints[context.activeIndex];
  const extent =
    point === undefined
      ? undefined
      : context.placement === "top" || context.placement === "bottom"
        ? {height: point.css}
        : {width: point.css};
  const contentStyle =
    typeof style === "function"
      ? (renderProps: Parameters<typeof style>[0]) => ({...extent, ...style(renderProps)})
      : {...extent, ...style};

  if (!context.isModal) {
    if (state && !state.isOpen) return null;

    return (
      <DrawerContext value={context}>
        <dom.div
          data-slot="drawer-content"
          {...drawerData(context)}
          {...dragHandlers}
          {...nonModalProps(
            {...props, children, className, style: contentStyle},
            context.slots.content(),
            state,
          )}
          ref={contentRef}
        />
      </DrawerContext>
    );
  }

  return (
    <DrawerContext value={context}>
      <ModalPrimitive
        ref={contentRef}
        className={composeTwRenderProps(className, context.slots.content())}
        data-slot="drawer-content"
        {...drawerData(context)}
        {...dragHandlers}
        {...props}
        style={contentStyle}
      >
        {children}
      </ModalPrimitive>
    </DrawerContext>
  );
};
export interface DrawerDialogProps extends DialogPrimitiveProps {}
export const DrawerDialog = ({children, className, ...props}: DrawerDialogProps) => {
  const context = useDrawerContext();

  return (
    <SurfaceContext value={DEFAULT_SURFACE_CONTEXT}>
      <DialogPrimitive
        className={composeSlotClassName(context.slots.dialog, className)}
        data-slot="drawer-dialog"
        {...drawerData(context)}
        {...props}
      >
        {children}
      </DialogPrimitive>
    </SurfaceContext>
  );
};

type IntrinsicElement = keyof React.JSX.IntrinsicElements;
// Generic over the element type like Drawer's parts, so `DrawerHeaderProps<"section">` type-checks.
type DrawerDivProps<E extends IntrinsicElement = "div"> = DOMRenderProps<E, undefined> & {
  children?: ReactNode;
  className?: string;
} & Omit<React.JSX.IntrinsicElements[E], "children" | "className" | "render">;
export type DrawerHeaderProps<E extends IntrinsicElement = "div"> = DrawerDivProps<E>;
export const DrawerHeader = <E extends IntrinsicElement = "div">({
  children,
  className,
  ...props
}: DrawerHeaderProps<E>) => {
  const context = useDrawerContext();

  return (
    <dom.div
      className={composeSlotClassName(context.slots.header, className)}
      data-slot="drawer-header"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};
export type DrawerBodyProps<E extends IntrinsicElement = "div"> = DrawerDivProps<E>;
export const DrawerBody = <E extends IntrinsicElement = "div">({
  children,
  className,
  ...props
}: DrawerBodyProps<E>) => {
  const context = useDrawerContext();

  return (
    <dom.div
      className={composeSlotClassName(context.slots.body, className)}
      data-slot="drawer-body"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};
export type DrawerFooterProps<E extends IntrinsicElement = "div"> = DrawerDivProps<E>;
export const DrawerFooter = <E extends IntrinsicElement = "div">({
  children,
  className,
  ...props
}: DrawerFooterProps<E>) => {
  const context = useDrawerContext();

  return (
    <dom.div
      className={composeSlotClassName(context.slots.footer, className)}
      data-slot="drawer-footer"
      {...(props as any)}
    >
      {children}
    </dom.div>
  );
};
export interface DrawerHeadingProps extends ComponentPropsWithRef<typeof HeadingPrimitive> {}
export const DrawerHeading = ({className, ...props}: DrawerHeadingProps) => {
  const context = useDrawerContext();

  return (
    <HeadingPrimitive
      className={composeSlotClassName(context.slots.heading, className)}
      data-slot="drawer-heading"
      slot="title"
      {...props}
    />
  );
};
export type DrawerHandleProps<E extends IntrinsicElement = "div"> = DrawerDivProps<E>;
export const DrawerHandle = ({className, onClick, onKeyDown, ...props}: DrawerHandleProps) => {
  const context = useDrawerContext();
  // Without snap points to move between, the handle is only a drag affordance, not a control.
  const interactive = context.parsedSnapPoints.length >= 2;
  const move = (delta: number) => context.setSnapIndex(context.activeIndex + delta);

  return (
    <dom.div
      {...(interactive
        ? {"aria-label": "Adjust drawer size", role: "button", tabIndex: 0}
        : {"aria-hidden": true})}
      className={composeSlotClassName(context.slots.handle, className)}
      data-slot="drawer-handle"
      {...props}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (interactive) move(1);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (!interactive) return;
        if (["ArrowUp", "ArrowRight"].includes(event.key)) {
          event.preventDefault();
          move(1);
        } else if (["ArrowDown", "ArrowLeft"].includes(event.key)) {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      <span className={context.slots.handleBar()} data-slot="drawer-handle-bar" />
    </dom.div>
  );
};
export interface DrawerCloseTriggerProps extends ButtonPrimitiveProps {
  children?: ReactNode;
  className?: string;
}
export const DrawerCloseTrigger = ({className, ...props}: DrawerCloseTriggerProps) => {
  const context = useDrawerContext();

  return (
    <CloseButton
      className={composeTwRenderProps(className, context.slots.closeTrigger())}
      data-slot="drawer-close-trigger"
      slot="close"
      {...props}
    />
  );
};

Object.assign(DrawerRoot, {displayName: "SY INC.Drawer"});
Object.assign(DrawerTrigger, {displayName: "SY INC.Drawer.Trigger"});
Object.assign(DrawerBackdrop, {displayName: "SY INC.Drawer.Backdrop"});
Object.assign(DrawerContent, {displayName: "SY INC.Drawer.Content"});
Object.assign(DrawerDialog, {displayName: "SY INC.Drawer.Dialog"});
Object.assign(DrawerHeader, {displayName: "SY INC.Drawer.Header"});
Object.assign(DrawerBody, {displayName: "SY INC.Drawer.Body"});
Object.assign(DrawerFooter, {displayName: "SY INC.Drawer.Footer"});
Object.assign(DrawerHeading, {displayName: "SY INC.Drawer.Heading"});
Object.assign(DrawerHandle, {displayName: "SY INC.Drawer.Handle"});
Object.assign(DrawerCloseTrigger, {displayName: "SY INC.Drawer.CloseTrigger"});

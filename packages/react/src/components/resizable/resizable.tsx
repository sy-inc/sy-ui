"use client";

import type {ResizableHandleVariants} from "@sy-inc/styles";
import type {Ref} from "react";
import type {GroupProps, PanelProps, SeparatorProps} from "react-resizable-panels";

import {resizableHandleVariants, resizablePanelVariants, resizableVariants} from "@sy-inc/styles";
import {Group, Panel, Separator} from "react-resizable-panels";

export type ResizableHandleType = NonNullable<ResizableHandleVariants["type"]>;

export interface ResizableRootProps extends Omit<GroupProps, "elementRef"> {
  /** Ref to the group element. */
  ref?: Ref<HTMLDivElement | null>;
}

const ResizableRoot = ({
  className,
  orientation = "horizontal",
  ref,
  ...props
}: ResizableRootProps) => (
  <Group
    {...props}
    className={resizableVariants({className, orientation})}
    data-orientation={orientation}
    data-slot="resizable"
    elementRef={ref}
    orientation={orientation}
  />
);

ResizableRoot.displayName = "SY INC.Resizable";

export interface ResizablePanelProps extends Omit<PanelProps, "elementRef"> {
  /** Ref to the panel element. */
  ref?: Ref<HTMLDivElement | null>;
}

/**
 * react-resizable-panels renders two nodes per panel: the flex item, which receives `ref`,
 * `data-slot` and every forwarded prop, and the scroll box nested inside it, which receives
 * `className`. Style the box through `className` / `.resizable__panel`, and select the flex
 * item through `[data-slot="resizable-panel"]`.
 */
const ResizablePanel = ({className, ref, ...props}: ResizablePanelProps) => (
  <Panel
    {...props}
    className={resizablePanelVariants({className})}
    data-slot="resizable-panel"
    elementRef={ref}
  />
);

ResizablePanel.displayName = "SY INC.Resizable.Panel";

export interface ResizableHandleProps extends Omit<SeparatorProps, "elementRef"> {
  /** Ref to the separator element. */
  ref?: Ref<HTMLDivElement>;
  /** Visual style of the separator; every type keeps the same behavior. */
  type?: ResizableHandleType;
}

const ResizableHandle = ({
  "aria-label": ariaLabel = "Resize handle",
  children,
  className,
  ref,
  type = "line",
  ...props
}: ResizableHandleProps) => {
  const slots = resizableHandleVariants({type});

  return (
    <Separator
      {...props}
      aria-label={ariaLabel}
      className={slots.base({className})}
      data-slot="resizable-handle"
      elementRef={ref}
    >
      {children ??
        (type === "line" ? null : (
          <span
            aria-hidden="true"
            className={slots.indicator()}
            data-slot="resizable-handle-indicator"
          />
        ))}
    </Separator>
  );
};

ResizableHandle.displayName = "SY INC.Resizable.Handle";

export {ResizableRoot, ResizablePanel, ResizableHandle};

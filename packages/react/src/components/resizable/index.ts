import type {ComponentProps} from "react";

import {ResizableHandle, ResizablePanel, ResizableRoot} from "./resizable";

export const Resizable = Object.assign(ResizableRoot, {
  Root: ResizableRoot,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
});

export type Resizable = {
  Props: ComponentProps<typeof ResizableRoot>;
  RootProps: ComponentProps<typeof ResizableRoot>;
  PanelProps: ComponentProps<typeof ResizablePanel>;
  HandleProps: ComponentProps<typeof ResizableHandle>;
};

export {ResizableRoot, ResizablePanel, ResizableHandle};
export type {
  ResizableRootProps,
  ResizableRootProps as ResizableProps,
  ResizablePanelProps,
  ResizableHandleProps,
  ResizableHandleType,
} from "./resizable";

/** Layout persistence and imperative APIs come straight from react-resizable-panels. */
export {useDefaultLayout, useGroupRef, usePanelRef} from "react-resizable-panels";
export type {GroupImperativeHandle, Layout, PanelImperativeHandle} from "react-resizable-panels";

export {resizableHandleVariants, resizablePanelVariants, resizableVariants} from "@sy-inc/styles";
export type {
  ResizableHandleVariants,
  ResizablePanelVariants,
  ResizableVariants,
} from "@sy-inc/styles";

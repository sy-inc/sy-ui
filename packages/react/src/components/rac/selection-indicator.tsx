"use client";

import type {ComponentPropsWithRef} from "react";

import {mergeRefs, useLayoutEffect} from "@react-aria/utils";
import {useMemo, useRef} from "react";
import {SelectionIndicator as SelectionIndicatorPrimitive} from "react-aria-components/SelectionIndicator";

type SelectionIndicatorProps = ComponentPropsWithRef<typeof SelectionIndicatorPrimitive>;

/**
 * `SelectionIndicator` with React Aria's leaked-inline-style defect patched out.
 *
 * React Aria animates the indicator by writing its *previous* position and size
 * as inline styles, then clearing them one frame later so the CSS transition
 * runs toward the resting state. Its layout-effect cleanup cancels that frame
 * without performing the clear, so whenever the effect is torn down within the
 * same frame — StrictMode's double-invoked effects during hydration, a layout
 * shift, a selection change mid-animation — the overrides leak. The next effect
 * run then reads the leaked values as *its* own restore target and writes them
 * back, pinning the indicator off-target permanently.
 *
 * Layout-effect cleanups run before the next round of layout effects, so
 * clearing the overrides here lands between React Aria's teardown (which has
 * already taken its snapshot) and its next run, handing it a clean slate. The
 * resting state carries no inline overrides, so clearing is always safe.
 *
 * Upstream defect, unchanged in react-aria-components 1.20.0 and 1.21.0. Drop
 * this shim once `SharedElement`'s cleanup performs the restore it cancels.
 */
const SelectionIndicator = ({ref, ...props}: SelectionIndicatorProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useMemo(() => mergeRefs(elementRef, ref), [ref]);

  useLayoutEffect(() => () => {
    const element = elementRef.current;

    if (!element?.style.length) return;

    for (const property of getComputedStyle(element).transitionProperty.split(/\s*,\s*/)) {
      // `all` is a shorthand for every property: removing it would wipe the whole
      // inline style, consumer-supplied declarations included. React Aria never
      // injects a `translate` under it either, so there is nothing to clear.
      if (property === "all" || property === "none") continue;

      element.style.removeProperty(property);
    }
  });

  return <SelectionIndicatorPrimitive {...props} ref={composedRef} />;
};

SelectionIndicator.displayName = "SY INC.SelectionIndicator";

export {SelectionIndicator};
export type {SelectionIndicatorProps};

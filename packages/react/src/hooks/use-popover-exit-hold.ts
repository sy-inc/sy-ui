"use client";

/**
 * Adapter based on HeroUI v3.2.7. Copyright HeroUI contributors, Apache-2.0.
 * https://github.com/heroui-inc/heroui/blob/7cb1642606c6f96f424dad78a961ccf45436be72/packages/react/src/utils/use-popover-exit-hold.ts
 * SY INC change: calls the local internal hook and returns props to spread.
 */

import type {Ref} from "react";
import type {PopoverProps} from "react-aria-components/Popover";

import {use} from "react";
import {OverlayTriggerStateContext} from "react-aria-components/Dialog";
import {PopoverContext} from "react-aria-components/Popover";
import {useSlottedContext} from "react-aria-components/slots";

import {useOverlayExitHoldProps} from "./use-overlay-exit-hold";

type PopoverExitHoldProps<T extends HTMLElement> = Pick<
  PopoverProps,
  "defaultOpen" | "isExiting" | "isOpen" | "shouldSkipAnimation" | "slot"
> & {ref?: Ref<T>};

/**
 * Resolve local/slotted React Aria options once for every popover wrapper.
 * Spread the result after the wrapper's props: `<Popover {...props} {...hold} />`.
 */
export function usePopoverExitHold<T extends HTMLElement>(
  props: PopoverExitHoldProps<T>,
  /** Called when the hold starts. Must be stable. */
  prepare?: (element: HTMLElement) => void,
) {
  const context = useSlottedContext(PopoverContext, props.slot);
  const state = use(OverlayTriggerStateContext);

  return useOverlayExitHoldProps<T>(
    {
      defaultOpen: props.defaultOpen ?? context?.defaultOpen,
      isExiting: props.isExiting,
      isOpen: props.isOpen ?? context?.isOpen,
      ref: props.ref,
    },
    state,
    {enabled: !(props.shouldSkipAnimation ?? context?.shouldSkipAnimation), prepare},
  );
}

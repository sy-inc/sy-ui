"use client";

/* Portions adapted from HeroUI v3.2.7 (Apache-2.0): https://github.com/heroui-inc/heroui/pull/6959 */

import type {PopoverProps} from "react-aria-components/Popover";

import {createElement} from "react";
import {DialogContext} from "react-aria-components/Dialog";
import {PopoverContext} from "react-aria-components/Popover";
import {useSlottedContext} from "react-aria-components/slots";

type PopoverRender = NonNullable<PopoverProps["render"]>;

/**
 * Picker popovers without a composed Dialog act as the dialog themselves, so they take
 * the picker's DialogContext name and id. Honors a local or slotted `render`.
 */
export function usePickerPopoverRender(
  render: PopoverProps["render"],
  slot: PopoverProps["slot"],
): PopoverRender {
  const dialogProps = useSlottedContext(DialogContext);
  const popoverContext = useSlottedContext(PopoverContext, slot);
  const resolvedRender = render ?? popoverContext?.render;

  const renderPopover: PopoverRender = (domProps, values) => {
    const popoverProps =
      domProps.role === "dialog"
        ? {
            ...domProps,
            "aria-labelledby":
              domProps["aria-labelledby"] ??
              (domProps["aria-label"] ? undefined : dialogProps?.["aria-labelledby"]),
            id: domProps.id ?? dialogProps?.id,
          }
        : domProps;

    return resolvedRender
      ? resolvedRender(popoverProps, values)
      : createElement("div", popoverProps);
  };

  return renderPopover;
}

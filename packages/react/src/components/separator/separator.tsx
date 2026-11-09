"use client";

/* Portions adapted from HeroUI v3.2.7 (Apache-2.0): https://github.com/heroui-inc/heroui/pull/6959 */

import type {SeparatorVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {separatorVariants} from "@sy-inc/styles";
import React from "react";
import {SeparatorContext, Separator as SeparatorPrimitive} from "react-aria-components/Separator";
import {useSlottedContext} from "react-aria-components/slots";

/* -------------------------------------------------------------------------------------------------
 * Separator Root
 * -----------------------------------------------------------------------------------------------*/
interface SeparatorRootProps
  extends ComponentPropsWithRef<typeof SeparatorPrimitive>, SeparatorVariants {
  /** Whether this divider is purely visual and hidden from assistive technology. */
  isDecorative?: boolean;
}

const SeparatorRoot = ({
  className,
  isDecorative = false,
  orientation,
  render,
  variant,
  ...props
}: SeparatorRootProps) => {
  const context = useSlottedContext(SeparatorContext, props.slot);
  const resolvedRender = render ?? context?.render;
  const elementType = props.elementType ?? context?.elementType ?? "hr";
  const resolvedOrientation = orientation ?? context?.orientation ?? "horizontal";

  return (
    <SeparatorPrimitive
      data-orientation={resolvedOrientation}
      data-slot="separator"
      orientation={resolvedOrientation}
      className={separatorVariants({
        className,
        orientation: resolvedOrientation,
        variant,
      })}
      {...props}
      render={
        isDecorative
          ? (domProps, values) => {
              const decorativeProps = {
                ...domProps,
                "aria-hidden": true as const,
                "aria-orientation": undefined,
                role: "presentation",
              };

              return resolvedRender
                ? resolvedRender(decorativeProps, values)
                : React.createElement(
                    elementType === "hr" && resolvedOrientation === "vertical"
                      ? "div"
                      : elementType,
                    decorativeProps,
                  );
            }
          : render
      }
    />
  );
};

SeparatorRoot.displayName = "SY INC.Separator";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {SeparatorRoot};

export type {SeparatorRootProps};

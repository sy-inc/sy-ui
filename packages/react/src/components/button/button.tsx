"use client";

import type {ButtonVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {buttonVariants} from "@sy-inc/styles";
import {use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";

import {composeTwRenderProps} from "../../utils";
import {BUTTON_GROUP_CHILD, ButtonGroupContext} from "../button-group";
import {Spinner} from "../spinner";

/* -------------------------------------------------------------------------------------------------
 * Button Root
 * -----------------------------------------------------------------------------------------------*/
interface ButtonRootProps extends ComponentPropsWithRef<typeof ButtonPrimitive>, ButtonVariants {
  [BUTTON_GROUP_CHILD]?: boolean;
}

const ButtonRoot = ({
  children,
  className,
  fullWidth,
  isDisabled,
  isIconOnly,
  isPending,
  size,
  variant,
  [BUTTON_GROUP_CHILD]: isButtonGroupChild,
  ...rest
}: ButtonRootProps) => {
  const buttonGroupContext = use(ButtonGroupContext);

  // Only use context if this button is a direct child of ButtonGroup
  const shouldUseContext = isButtonGroupChild === true;

  // Merge props with precedence: direct props > context props
  const finalSize = size ?? (shouldUseContext ? buttonGroupContext?.size : undefined);
  const finalVariant = variant ?? (shouldUseContext ? buttonGroupContext?.variant : undefined);
  const finalIsDisabled =
    isDisabled ?? (shouldUseContext ? buttonGroupContext?.isDisabled : undefined);
  const finalFullWidth =
    fullWidth ?? (shouldUseContext ? buttonGroupContext?.fullWidth : undefined);

  const styles = buttonVariants({
    fullWidth: finalFullWidth,
    isIconOnly,
    size: finalSize,
    variant: finalVariant,
  });

  return (
    <ButtonPrimitive
      className={composeTwRenderProps(className, styles)}
      data-slot="button"
      isDisabled={finalIsDisabled}
      isPending={isPending}
      {...rest}
    >
      {/* Function children own the pending UI; otherwise the spinner leads the content, or
          replaces it when the button is icon-only (a second glyph would break the square). */}
      {isPending && typeof children !== "function" ? (
        <>
          <Spinner color="current" size="sm" />
          {isIconOnly ? null : children}
        </>
      ) : (
        children
      )}
    </ButtonPrimitive>
  );
};

ButtonRoot.displayName = "SY INC.Button";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {ButtonRoot};

export type {ButtonRootProps};

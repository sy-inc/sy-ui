"use client";

import type {FieldErrorVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {ValidationResult} from "react-aria-components/FieldError";

import {fieldErrorVariants} from "@sy-inc/styles";
import {use} from "react";
import {
  FieldError as FieldErrorPrimitive,
  FieldErrorContext,
} from "react-aria-components/FieldError";
import {TextContext} from "react-aria-components/Text";

import {composeTwRenderProps} from "../../utils/compose";

/* -------------------------------------------------------------------------------------------------
 * Field Error Root
 * -----------------------------------------------------------------------------------------------*/
interface FieldErrorRootProps
  extends ComponentPropsWithRef<typeof FieldErrorPrimitive>, FieldErrorVariants {}

// Outside a React Aria field there is no validation state: the message itself is the error.
const STANDALONE_VALIDATION = {
  isInvalid: true,
  validationDetails: {} as ValidityState,
  validationErrors: [],
} satisfies ValidationResult;

const isEmpty = (children: ReactNode) =>
  children == null ||
  children === false ||
  children === "" ||
  (Array.isArray(children) && children.length === 0);

const FieldErrorRoot = ({children, className, ...rest}: FieldErrorRootProps) => {
  const fieldValidation = use(FieldErrorContext);

  const error = (
    <FieldErrorPrimitive
      data-visible
      className={composeTwRenderProps(className, fieldErrorVariants())}
      data-slot="field-error"
      {...rest}
    >
      {(renderProps) => (typeof children === "function" ? children(renderProps) : children)}
    </FieldErrorPrimitive>
  );

  // Inside a field (`TextField`, `Select`, …) the field decides visibility and wires `aria-describedby`.
  if (fieldValidation) return error;

  if (typeof children !== "function" && isEmpty(children)) return null;

  // Standalone: shown while it has content. Reset `TextContext` so an ancestor (e.g. `DropZone`)
  // can't inject its label id or slots into this message.
  return (
    <FieldErrorContext value={STANDALONE_VALIDATION}>
      <TextContext value={null}>{error}</TextContext>
    </FieldErrorContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {FieldErrorRoot};

export type {FieldErrorRootProps};

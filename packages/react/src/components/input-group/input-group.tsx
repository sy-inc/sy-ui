"use client";

import type {InputGroupVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {inputGroupVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {Group as GroupPrimitive} from "react-aria-components/Group";
import {Input as InputPrimitive} from "react-aria-components/Input";
import {TextArea as TextAreaPrimitive} from "react-aria-components/TextArea";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {Button} from "../button";
import {EyeIcon, EyeSlashIcon} from "../icons";
import {TextFieldContext} from "../textfield";

/* -------------------------------------------------------------------------------------------------
 * InputGroup Context
 * -----------------------------------------------------------------------------------------------*/
type InputGroupContext = {
  slots?: ReturnType<typeof inputGroupVariants>;
  passwordVisible?: boolean;
  togglePasswordVisible?: () => void;
};

const InputGroupContext = createContext<InputGroupContext>({});

/* -------------------------------------------------------------------------------------------------
 * InputGroup Root
 * -----------------------------------------------------------------------------------------------*/
interface InputGroupRootProps
  extends ComponentPropsWithRef<typeof GroupPrimitive>, InputGroupVariants {}

const InputGroupRoot = ({
  children,
  className,
  fullWidth,
  onClick,
  variant,
  ...props
}: InputGroupRootProps) => {
  const textFieldContext = use(TextFieldContext);
  const resolvedVariant = variant ?? textFieldContext?.variant;
  const groupRef = React.useRef<HTMLDivElement>(null);
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  const togglePasswordVisible = React.useCallback(() => {
    setPasswordVisible((visible) => !visible);
  }, []);

  const slots = React.useMemo(
    () => inputGroupVariants({fullWidth, variant: resolvedVariant}),
    [fullWidth, resolvedVariant],
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const input = groupRef.current?.querySelector("input");

    if (input && target !== input && !input.contains(target)) {
      input.focus();
    }

    onClick?.(e);
  };

  const inputGroupContextValue = React.useMemo(
    () => ({passwordVisible, slots, togglePasswordVisible}),
    [passwordVisible, slots, togglePasswordVisible],
  );

  return (
    <InputGroupContext value={inputGroupContextValue}>
      <GroupPrimitive
        {...props}
        ref={groupRef}
        className={composeTwRenderProps(className, slots?.base())}
        data-slot="input-group"
        onClick={handleClick}
      >
        {(renderProps) => (typeof children === "function" ? children(renderProps) : children)}
      </GroupPrimitive>
    </InputGroupContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputGroup Input
 * -----------------------------------------------------------------------------------------------*/
interface InputGroupInputProps extends ComponentPropsWithRef<typeof InputPrimitive> {}

const InputGroupInput = ({className, type, ...props}: InputGroupInputProps) => {
  const {passwordVisible, slots} = use(InputGroupContext);

  return (
    <InputPrimitive
      className={composeTwRenderProps(className, slots?.input())}
      data-slot="input-group-input"
      type={type === "password" && passwordVisible ? "text" : type}
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputGroup Prefix
 * -----------------------------------------------------------------------------------------------*/
interface InputGroupPrefixProps extends ComponentPropsWithRef<"div"> {}

const InputGroupPrefix = ({children, className, ...props}: InputGroupPrefixProps) => {
  const {slots} = use(InputGroupContext);

  return (
    <div
      className={composeSlotClassName(slots?.prefix, className)}
      data-slot="input-group-prefix"
      {...props}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputGroup TextArea
 * -----------------------------------------------------------------------------------------------*/
interface InputGroupTextAreaProps extends ComponentPropsWithRef<typeof TextAreaPrimitive> {}

const InputGroupTextArea = ({className, ...props}: InputGroupTextAreaProps) => {
  const {slots} = use(InputGroupContext);

  return (
    <TextAreaPrimitive
      className={composeTwRenderProps(className, slots?.input())}
      data-slot="input-group-textarea"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputGroup Suffix
 * -----------------------------------------------------------------------------------------------*/
interface InputGroupSuffixProps extends ComponentPropsWithRef<"div"> {}

const InputGroupSuffix = ({children, className, ...props}: InputGroupSuffixProps) => {
  const {slots} = use(InputGroupContext);

  return (
    <div
      className={composeSlotClassName(slots?.suffix, className)}
      data-slot="input-group-suffix"
      {...props}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputGroup PasswordToggle
 * -----------------------------------------------------------------------------------------------*/
interface InputGroupPasswordToggleProps extends Omit<
  ComponentPropsWithRef<typeof Button>,
  "children"
> {
  /** Accessible name while the password is hidden. */
  showLabel?: string;
  /** Accessible name while the password is visible. */
  hideLabel?: string;
}

const InputGroupPasswordToggle = ({
  hideLabel = "Hide password",
  showLabel = "Show password",
  ...props
}: InputGroupPasswordToggleProps) => {
  const {passwordVisible, togglePasswordVisible} = use(InputGroupContext);

  return (
    /* Hover and press backgrounds are zeroed in input-group.css via the data-slot. */
    <Button
      isIconOnly
      aria-label={passwordVisible ? hideLabel : showLabel}
      data-slot="input-group-password-toggle"
      size="sm"
      variant="ghost"
      onPress={togglePasswordVisible}
      {...props}
    >
      {passwordVisible ? <EyeSlashIcon /> : <EyeIcon />}
    </Button>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  InputGroupRoot,
  InputGroupInput,
  InputGroupTextArea,
  InputGroupPrefix,
  InputGroupSuffix,
  InputGroupPasswordToggle,
};

export type {
  InputGroupRootProps,
  InputGroupInputProps,
  InputGroupTextAreaProps,
  InputGroupPrefixProps,
  InputGroupSuffixProps,
  InputGroupPasswordToggleProps,
};

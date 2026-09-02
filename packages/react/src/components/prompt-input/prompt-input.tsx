"use client";

import type {ButtonProps} from "../button";
import type {FormProps} from "../form";
import type {TextAreaProps} from "../textarea";
import type {Key} from "@react-types/shared";
import type {PromptInputVariants} from "@sy-inc/styles";
import type {ChangeEvent, ComponentPropsWithRef, KeyboardEvent, ReactNode} from "react";
import type {GridListItemProps, GridListProps} from "react-aria-components/GridList";

import {mergeRefs} from "@react-aria/utils";
import {promptInputQueueClasses, promptInputVariants} from "@sy-inc/styles";
import React, {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {GridList, GridListItem} from "react-aria-components/GridList";
import {DropIndicator, useDragAndDrop} from "react-aria-components/useDragAndDrop";
import {cx} from "tailwind-variants";

import {composeSlotClassName, composeTwRenderProps} from "../../utils";
import {Button} from "../button";
import {Form} from "../form";
import {CloseIcon, IconArrowUp, IconEllipsis, IconGrip, IconStop} from "../icons";
import {Spinner} from "../spinner";
import {TextArea} from "../textarea";
import {Tooltip} from "../tooltip";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
type PromptInputStatus = "ready" | "submitted" | "streaming" | "error";
type PromptInputLayout = "stacked" | "compact" | "inline";

type PromptInputContextValue = {
  isExpanded: boolean;
  isDisabled: boolean;
  isInputDisabled: boolean;
  layout: PromptInputLayout;
  maxHeight: number | string;
  onStop?: () => void;
  setExpanded: (isExpanded: boolean) => void;
  setValue: (value: string) => void;
  size: NonNullable<PromptInputVariants["size"]>;
  slots: ReturnType<typeof promptInputVariants>;
  status: PromptInputStatus;
  value: string;
};

const PromptInputContext = createContext<PromptInputContextValue | null>(null);

const usePromptInput = () => use(PromptInputContext);

/* -------------------------------------------------------------------------------------------------
 * PromptInput Root
 * -----------------------------------------------------------------------------------------------*/
interface PromptInputRootProps extends Omit<FormProps, "defaultValue">, PromptInputVariants {
  /** Initial value when the component is uncontrolled. */
  defaultValue?: string;
  /** Disables the complete prompt composer. */
  isDisabled?: boolean;
  /** Structural layout. */
  layout?: PromptInputLayout;
  /** Keeps the text area disabled while a request is submitted or streaming. */
  lockInputOnRun?: boolean;
  /** Maximum auto-growing text area height. Numbers are interpreted as pixels. */
  maxHeight?: number | string;
  /** Called when the form is submitted with a non-empty value. The native default is prevented. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  /** Called by PromptInput.Send while a request is submitted or streaming. */
  onStop?: () => void;
  /** Called whenever the managed text value changes. */
  onValueChange?: (value: string) => void;
  /** Request lifecycle state. */
  status?: PromptInputStatus;
  /** Controlled text value. */
  value?: string;
}

const PromptInputRoot = ({
  children,
  className,
  defaultValue = "",
  isDisabled = false,
  layout = "stacked",
  lockInputOnRun = true,
  maxHeight = 240,
  onStop,
  onSubmit,
  onValueChange,
  size = "md",
  status = "ready",
  style,
  value: valueProp,
  variant = "primary",
  ...props
}: PromptInputRootProps) => {
  const [isAutosizeExpanded, setIsAutosizeExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = valueProp ?? uncontrolledValue;
  const isPending = status === "submitted" || status === "streaming";
  const isExpanded = layout === "compact" && isAutosizeExpanded;
  const slots = useMemo(() => promptInputVariants({size, variant}), [size, variant]);

  const setValue = useCallback(
    (nextValue: string) => {
      if (valueProp === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange, valueProp],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDisabled || isPending || value.trim().length === 0) return;
    onSubmit?.(event);
  };

  const context = useMemo<PromptInputContextValue>(
    () => ({
      isExpanded,
      isDisabled,
      isInputDisabled: isDisabled || (lockInputOnRun && isPending),
      layout,
      maxHeight,
      onStop,
      setExpanded: setIsAutosizeExpanded,
      setValue,
      size,
      slots,
      status,
      value,
    }),
    [
      isExpanded,
      isDisabled,
      isPending,
      layout,
      lockInputOnRun,
      maxHeight,
      onStop,
      setValue,
      size,
      slots,
      status,
      value,
    ],
  );

  const maxHeightValue = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <PromptInputContext value={context}>
      <Form
        {...props}
        className={composeSlotClassName(slots.base, className)}
        data-disabled={isDisabled || undefined}
        data-expanded={isExpanded || undefined}
        data-layout={layout}
        data-pending={isPending || undefined}
        data-slot="prompt-input"
        data-status={status}
        data-variant={variant}
        style={{...style, "--prompt-input-max-height": maxHeightValue} as React.CSSProperties}
        onSubmit={handleSubmit}
      >
        {children}
      </Form>
    </PromptInputContext>
  );
};

PromptInputRoot.displayName = "SY INC.PromptInput";

/* -------------------------------------------------------------------------------------------------
 * Layout slots
 * -----------------------------------------------------------------------------------------------*/
type SlotName = Exclude<keyof PromptInputContextValue["slots"], "base" | "action" | "send">;

const createSlot = <E extends "div" | "p">(displayName: string, slot: SlotName, Element: E) => {
  const Slot = ({className, ...props}: ComponentPropsWithRef<E>) => {
    const context = usePromptInput();

    return React.createElement(Element, {
      ...props,
      className: composeSlotClassName(context?.slots[slot], className),
      "data-slot": `prompt-input-${slot.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`,
    });
  };

  Slot.displayName = `SY INC.PromptInput.${displayName}`;

  return Slot;
};

interface PromptInputShellProps extends ComponentPropsWithRef<"div"> {}

const PromptInputShell = ({className, ...props}: PromptInputShellProps) => {
  const context = usePromptInput();

  return (
    <div
      {...props}
      className={composeSlotClassName(context?.slots.shell, className)}
      data-slot="prompt-input-shell"
      inert={context?.isDisabled || undefined}
    />
  );
};

PromptInputShell.displayName = "SY INC.PromptInput.Shell";

interface PromptInputContentProps extends ComponentPropsWithRef<"div"> {}
interface PromptInputAttachmentsProps extends ComponentPropsWithRef<"div"> {}
interface PromptInputToolbarProps extends ComponentPropsWithRef<"div"> {}
interface PromptInputToolbarStartProps extends ComponentPropsWithRef<"div"> {}
interface PromptInputToolbarEndProps extends ComponentPropsWithRef<"div"> {}
interface PromptInputFooterProps extends ComponentPropsWithRef<"p"> {}

const PromptInputContent = createSlot("Content", "content", "div");
const PromptInputAttachments = createSlot("Attachments", "attachments", "div");
const PromptInputToolbar = createSlot("Toolbar", "toolbar", "div");
const PromptInputToolbarStart = createSlot("ToolbarStart", "toolbarStart", "div");
const PromptInputToolbarEnd = createSlot("ToolbarEnd", "toolbarEnd", "div");
const PromptInputFooter = createSlot("Footer", "footer", "p");

/* -------------------------------------------------------------------------------------------------
 * PromptInput TextArea
 * -----------------------------------------------------------------------------------------------*/
interface PromptInputTextAreaProps extends Omit<TextAreaProps, "defaultValue" | "value"> {
  /** Leaves the text area at the height supplied by CSS or the style prop. */
  disableAutosize?: boolean;
}

const PromptInputTextArea = ({
  className,
  disableAutosize = false,
  disabled,
  onChange,
  onKeyDown,
  ref,
  rows = 1,
  ...props
}: PromptInputTextAreaProps) => {
  const context = usePromptInput();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const value = context?.value ?? "";
  const isExpanded = context?.isExpanded ?? false;
  const layout = context?.layout ?? "stacked";
  const maxHeight = context?.maxHeight ?? 240;
  const setExpanded = context?.setExpanded;

  const resize = useCallback(() => {
    const element = textAreaRef.current;

    if (!element || disableAutosize) return;

    element.style.height = "auto";
    const computedStyle = window.getComputedStyle(element);
    const computedMaxHeight = Number.parseFloat(computedStyle.maxHeight);
    const computedMinHeight = Number.parseFloat(computedStyle.minHeight);
    const numericMaxHeight =
      typeof maxHeight === "number"
        ? maxHeight
        : Number.isFinite(computedMaxHeight)
          ? computedMaxHeight
          : Infinity;
    const nextHeight = Math.min(element.scrollHeight, numericMaxHeight);

    setExpanded?.(
      layout === "compact" &&
        Number.isFinite(computedMinHeight) &&
        element.scrollHeight > computedMinHeight + 0.5,
    );

    if (nextHeight > 0) element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > numericMaxHeight ? "auto" : "hidden";
  }, [disableAutosize, layout, maxHeight, setExpanded]);

  useLayoutEffect(resize, [isExpanded, resize, value]);

  useLayoutEffect(() => {
    const element = textAreaRef.current;

    if (!element || disableAutosize) return;

    let lastWidth = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === lastWidth) return;
      lastWidth = element.clientWidth;
      resize();
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [disableAutosize, resize]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    context?.setValue(event.currentTarget.value);
    onChange?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);

    if (
      event.defaultPrevented ||
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <TextArea
      {...props}
      ref={mergeRefs(textAreaRef, ref)}
      className={composeTwRenderProps(className, context?.slots.textarea())}
      data-slot="prompt-input-textarea"
      disabled={Boolean(context?.isInputDisabled || disabled)}
      rows={rows}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
};

PromptInputTextArea.displayName = "SY INC.PromptInput.TextArea";

/* -------------------------------------------------------------------------------------------------
 * PromptInput Actions
 * -----------------------------------------------------------------------------------------------*/
interface PromptInputActionProps extends ButtonProps {
  tooltip?: ReactNode;
}

const PromptInputAction = ({
  children,
  className,
  isDisabled,
  isIconOnly = true,
  size,
  tooltip,
  variant = "tertiary",
  ...props
}: PromptInputActionProps) => {
  const context = usePromptInput();
  const action = (
    <Button
      {...props}
      className={composeTwRenderProps(className, context?.slots.action())}
      data-slot="prompt-input-action"
      isDisabled={Boolean(context?.isDisabled || isDisabled)}
      isIconOnly={isIconOnly}
      size={size ?? context?.size}
      variant={variant}
    >
      {children}
    </Button>
  );

  if (!tooltip) return action;

  return (
    <Tooltip delay={0}>
      {action}
      <Tooltip.Content>{tooltip}</Tooltip.Content>
    </Tooltip>
  );
};

PromptInputAction.displayName = "SY INC.PromptInput.Action";

interface PromptInputSendProps extends ButtonProps {}

const PromptInputSend = ({
  "aria-label": ariaLabel,
  children,
  className,
  isDisabled,
  isIconOnly = true,
  onPress,
  size,
  type,
  variant,
  ...props
}: PromptInputSendProps) => {
  const context = usePromptInput();
  const status = context?.status ?? "ready";
  const isRunning = status === "submitted" || status === "streaming";
  const cannotSubmit = !context || context.value.trim().length === 0;
  const resolvedIsDisabled = Boolean(
    context?.isDisabled || isDisabled || (!isRunning && cannotSubmit),
  );

  const handlePress: NonNullable<ButtonProps["onPress"]> = (event) => {
    onPress?.(event);
    if (isRunning) context?.onStop?.();
  };

  const defaultChildren =
    status === "submitted" ? (
      <Spinner color="current" size="sm" />
    ) : status === "streaming" ? (
      <IconStop />
    ) : (
      <IconArrowUp />
    );

  return (
    <Button
      {...props}
      aria-label={ariaLabel ?? (isRunning ? "Stop generating" : "Send message")}
      className={composeTwRenderProps(className, context?.slots.send())}
      data-slot="prompt-input-send"
      data-status={status}
      isDisabled={resolvedIsDisabled}
      isIconOnly={isIconOnly}
      size={size ?? context?.size}
      type={type ?? (isRunning ? "button" : "submit")}
      variant={variant ?? (status === "error" ? "danger" : "primary")}
      onPress={isRunning ? handlePress : onPress}
    >
      {children ?? defaultChildren}
    </Button>
  );
};

PromptInputSend.displayName = "SY INC.PromptInput.Send";

/* -------------------------------------------------------------------------------------------------
 * PromptInput Queue (React Aria GridList + useDragAndDrop)
 * -----------------------------------------------------------------------------------------------*/
type PromptInputQueueActionsVisibility = "always" | "hover";

type PromptInputQueueContextValue = {
  canReorder: boolean;
  getKey: (value: unknown) => Key;
};

const PromptInputQueueContext = createContext<PromptInputQueueContextValue | null>(null);

interface PromptInputQueueProps<T> extends Omit<
  GridListProps<object>,
  "children" | "dragAndDropHooks" | "items" | "selectionMode" | "className"
> {
  actionsVisibility?: PromptInputQueueActionsVisibility;
  children?: ReactNode;
  className?: string;
  /** Maps a value to a stable key. Defaults to `String(value)`; required for object values. */
  getKey?: (value: T) => Key;
  onReorder?: (values: T[]) => void;
  values?: T[];
}

const PromptInputQueue = <T,>({
  actionsVisibility = "hover",
  "aria-label": ariaLabel = "Queue",
  className,
  getKey = String,
  onReorder,
  values,
  ...props
}: PromptInputQueueProps<T>) => {
  const promptInput = usePromptInput();
  const canReorder = Boolean(values && onReorder && !promptInput?.isDisabled);

  const {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({"text/plain": String(key)})),
    isDisabled: !canReorder,
    onReorder: ({keys, target}) => {
      if (!values || !onReorder) return;

      const moving = values.filter((value) => keys.has(getKey(value)));
      const rest = values.filter((value) => !keys.has(getKey(value)));
      const targetIndex = rest.findIndex((value) => getKey(value) === target.key);

      if (targetIndex < 0) return;
      const at = target.dropPosition === "after" ? targetIndex + 1 : targetIndex;

      onReorder([...rest.slice(0, at), ...moving, ...rest.slice(at)]);
    },
    renderDropIndicator: (target) => (
      <DropIndicator
        className={promptInputQueueClasses.dropIndicator}
        data-slot="prompt-input-queue-drop-indicator"
        target={target}
      />
    ),
  });

  const context = useMemo(
    () => ({canReorder, getKey: getKey as (value: unknown) => Key}),
    [canReorder, getKey],
  );

  return (
    <PromptInputQueueContext value={context}>
      <GridList
        {...props}
        aria-label={ariaLabel}
        className={cx(promptInputQueueClasses.base, className)}
        data-actions-visibility={actionsVisibility}
        data-slot="prompt-input-queue"
        dragAndDropHooks={dragAndDropHooks}
        inert={promptInput?.isDisabled || undefined}
        selectionMode="none"
      />
    </PromptInputQueueContext>
  );
};

PromptInputQueue.displayName = "SY INC.PromptInput.Queue";

interface PromptInputQueueItemProps<T> extends Omit<
  GridListItemProps,
  "children" | "className" | "value"
> {
  children?: ReactNode;
  className?: string;
  value?: T;
}

const PromptInputQueueItem = <T,>({
  className,
  id,
  textValue,
  value,
  ...props
}: PromptInputQueueItemProps<T>) => {
  const queue = use(PromptInputQueueContext);
  const resolvedId = id ?? (value === undefined ? undefined : queue?.getKey(value));

  return (
    <GridListItem
      {...props}
      className={cx(promptInputQueueClasses.item, className)}
      data-reorder-enabled={queue?.canReorder || undefined}
      data-slot="prompt-input-queue-item"
      id={resolvedId}
      textValue={textValue ?? (resolvedId === undefined ? undefined : String(resolvedId))}
    />
  );
};

PromptInputQueueItem.displayName = "SY INC.PromptInput.Queue.Item";

interface PromptInputQueueItemHandleProps extends ButtonProps {}

const PromptInputQueueItemHandle = ({
  "aria-label": ariaLabel = "Reorder item",
  children,
  className,
  isDisabled,
  ...props
}: PromptInputQueueItemHandleProps) => {
  const queue = use(PromptInputQueueContext);

  return (
    <Button
      {...props}
      isIconOnly
      aria-label={ariaLabel}
      className={composeTwRenderProps(className, promptInputQueueClasses.handle)}
      data-slot="prompt-input-queue-item-handle"
      isDisabled={Boolean(isDisabled || !queue?.canReorder)}
      size="sm"
      slot="drag"
      variant="ghost"
    >
      {children ?? <IconGrip />}
    </Button>
  );
};

PromptInputQueueItemHandle.displayName = "SY INC.PromptInput.Queue.Item.Handle";

const createQueueSlot = <E extends "div" | "span">(
  displayName: string,
  slot: "body" | "icon" | "content" | "actions",
  Element: E,
) => {
  const Slot = ({className, ...props}: ComponentPropsWithRef<E>) =>
    React.createElement(Element, {
      ...props,
      className: cx(promptInputQueueClasses[slot], className),
      "data-slot": `prompt-input-queue-item-${slot}`,
    });

  Slot.displayName = `SY INC.PromptInput.Queue.Item.${displayName}`;

  return Slot;
};

interface PromptInputQueueItemBodyProps extends ComponentPropsWithRef<"div"> {}
interface PromptInputQueueItemIconProps extends ComponentPropsWithRef<"span"> {}
interface PromptInputQueueItemContentProps extends ComponentPropsWithRef<"div"> {}
interface PromptInputQueueItemActionsProps extends ComponentPropsWithRef<"div"> {}

const PromptInputQueueItemBody = createQueueSlot("Body", "body", "div");
const PromptInputQueueItemIcon = createQueueSlot("Icon", "icon", "span");
const PromptInputQueueItemContent = createQueueSlot("Content", "content", "div");
const PromptInputQueueItemActions = createQueueSlot("Actions", "actions", "div");

interface PromptInputQueueItemRemoveProps extends ButtonProps {}
interface PromptInputQueueItemMoreProps extends ButtonProps {}

const PromptInputQueueItemButton = ({className, isDisabled, ...props}: ButtonProps) => {
  const promptInput = usePromptInput();

  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      {...props}
      className={composeTwRenderProps(className, promptInputQueueClasses.action)}
      isDisabled={Boolean(promptInput?.isDisabled || isDisabled)}
    />
  );
};

const PromptInputQueueItemRemove = ({
  "aria-label": ariaLabel = "Remove item",
  children = <CloseIcon />,
  ...props
}: PromptInputQueueItemRemoveProps) => (
  <PromptInputQueueItemButton
    {...props}
    aria-label={ariaLabel}
    data-slot="prompt-input-queue-item-remove"
  >
    {children}
  </PromptInputQueueItemButton>
);

PromptInputQueueItemRemove.displayName = "SY INC.PromptInput.Queue.Item.Remove";

const PromptInputQueueItemMore = ({
  "aria-label": ariaLabel = "More actions",
  children = <IconEllipsis />,
  ...props
}: PromptInputQueueItemMoreProps) => (
  <PromptInputQueueItemButton
    {...props}
    aria-label={ariaLabel}
    data-slot="prompt-input-queue-item-more"
  >
    {children}
  </PromptInputQueueItemButton>
);

PromptInputQueueItemMore.displayName = "SY INC.PromptInput.Queue.Item.More";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  PromptInputRoot,
  PromptInputShell,
  PromptInputContent,
  PromptInputAttachments,
  PromptInputTextArea,
  PromptInputToolbar,
  PromptInputToolbarStart,
  PromptInputToolbarEnd,
  PromptInputAction,
  PromptInputSend,
  PromptInputFooter,
  PromptInputQueue,
  PromptInputQueueItem,
  PromptInputQueueItemHandle,
  PromptInputQueueItemBody,
  PromptInputQueueItemIcon,
  PromptInputQueueItemContent,
  PromptInputQueueItemActions,
  PromptInputQueueItemRemove,
  PromptInputQueueItemMore,
};

export type {
  PromptInputStatus,
  PromptInputLayout,
  PromptInputRootProps,
  PromptInputShellProps,
  PromptInputContentProps,
  PromptInputAttachmentsProps,
  PromptInputTextAreaProps,
  PromptInputToolbarProps,
  PromptInputToolbarStartProps,
  PromptInputToolbarEndProps,
  PromptInputActionProps,
  PromptInputSendProps,
  PromptInputFooterProps,
  PromptInputQueueActionsVisibility,
  PromptInputQueueProps,
  PromptInputQueueItemProps,
  PromptInputQueueItemHandleProps,
  PromptInputQueueItemBodyProps,
  PromptInputQueueItemIconProps,
  PromptInputQueueItemContentProps,
  PromptInputQueueItemActionsProps,
  PromptInputQueueItemRemoveProps,
  PromptInputQueueItemMoreProps,
};

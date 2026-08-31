"use client";

import type {StepperVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, Key, ReactElement, ReactNode} from "react";

import {stepperVariants} from "@sy-inc/styles";
import React, {Children, Fragment, createContext, isValidElement, use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";

import {CloseIcon} from "../icons";

type StepperStatus = "pending" | "current" | "complete" | "error" | "loading";
type StepperItemStatus = Exclude<StepperStatus, "current">;

type StepperItemRenderProps = {
  index: number;
  total: number;
  status: StepperStatus;
  isCurrent: boolean;
  isDisabled: boolean;
};

type StepperStateProps =
  | {currentKey: Key; isComplete?: false}
  | {currentKey?: never; isComplete: true};

type StepperRootBaseProps = Omit<ComponentPropsWithRef<"div">, "children"> &
  StepperVariants & {
    children: ReactNode;
    onCurrentChange?: (key: Key) => void;
  };

type StepperRootProps = StepperRootBaseProps & StepperStateProps;

type StepperItemInternalState = StepperItemRenderProps & {
  id: Key;
  isLast: boolean;
  isInteractive: boolean;
  onCurrentChange?: (key: Key) => void;
  slots: ReturnType<typeof stepperVariants>;
  variant: NonNullable<StepperVariants["variant"]>;
};

interface StepperItemProps extends Omit<ComponentPropsWithRef<"li">, "children" | "id"> {
  children: ReactNode;
  id: Key;
  isDisabled?: boolean;
  status?: StepperItemStatus;
  statusLabel?: ReactNode;
}

interface StepperItemInternalProps extends StepperItemProps {
  __stepper?: StepperItemInternalState;
}

const StepperItemContext = createContext<StepperItemInternalState | null>(null);

const useStepperItemContext = () => {
  const context = use(StepperItemContext);

  if (!context) throw new Error("Stepper parts must be used within Stepper.Item");

  return context;
};

function collectStepperItems(children: ReactNode): ReactElement<StepperItemInternalProps>[] {
  const items: ReactElement<StepperItemInternalProps>[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) {
      collectStepperItems((child.props as {children?: ReactNode}).children).forEach((item) =>
        items.push(item),
      );
    } else if (child.type === StepperItem) {
      items.push(child as ReactElement<StepperItemInternalProps>);
    }
  });

  return items;
}

/* -------------------------------------------------------------------------------------------------
 * Stepper Root
 * -----------------------------------------------------------------------------------------------*/
const StepperRoot = ({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  color,
  currentKey,
  isComplete = false,
  isDisabled = false,
  onCurrentChange,
  orientation = "horizontal",
  ref,
  separatorMode,
  size,
  variant = "primary",
  ...props
}: StepperRootProps) => {
  const slots = React.useMemo(
    () =>
      stepperVariants({
        color,
        isDisabled,
        orientation,
        separatorMode,
        size,
        variant,
      }),
    [color, isDisabled, orientation, separatorMode, size, variant],
  );
  const items = collectStepperItems(children);
  const currentIndex = isComplete
    ? -1
    : items.findIndex((item) => Object.is(item.props.id, currentKey));
  const total = items.length;

  return (
    <div
      ref={ref}
      className={slots.base({className})}
      data-disabled={isDisabled ? "true" : undefined}
      data-orientation={orientation}
      data-slot="stepper"
      {...props}
    >
      <ol
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={slots.list()}
        data-orientation={orientation}
        data-slot="stepper-list"
      >
        {items.map((item, index) => {
          const isCurrent = !isComplete && Object.is(item.props.id, currentKey);
          const status =
            item.props.status ??
            (isComplete
              ? "complete"
              : isCurrent
                ? "current"
                : currentIndex >= 0 && index < currentIndex
                  ? "complete"
                  : "pending");

          return React.cloneElement(item, {
            key: item.key ?? item.props.id,
            __stepper: {
              id: item.props.id,
              index,
              isCurrent,
              isDisabled: isDisabled || Boolean(item.props.isDisabled),
              isInteractive: Boolean(onCurrentChange),
              isLast: index === total - 1,
              onCurrentChange,
              slots,
              status,
              total,
              variant,
            },
          });
        })}
      </ol>
    </div>
  );
};

StepperRoot.displayName = "SY INC.Stepper";

/* -------------------------------------------------------------------------------------------------
 * Stepper Item
 * -----------------------------------------------------------------------------------------------*/
const StepperItem = (publicProps: StepperItemProps) => {
  const {
    __stepper,
    children,
    className,
    id,
    isDisabled: _isDisabled,
    ref,
    status: _status,
    statusLabel,
    ...props
  } = publicProps as StepperItemInternalProps;

  if (!__stepper) throw new Error("Stepper.Item must be used within Stepper");

  const {
    index,
    isCurrent,
    isDisabled,
    isInteractive,
    isLast,
    onCurrentChange,
    slots,
    status,
    total,
  } = __stepper;
  const content = (
    <>
      {children}
      {statusLabel != null && <span className={slots.statusLabel()}>{statusLabel}</span>}
    </>
  );
  const triggerProps = {
    "aria-busy": status === "loading" || undefined,
    "aria-current": isCurrent ? ("step" as const) : undefined,
    "data-current": isCurrent ? "true" : undefined,
    "data-disabled": isDisabled ? "true" : undefined,
    "data-slot": "stepper-trigger",
    "data-status": status,
  };

  return (
    <StepperItemContext value={__stepper}>
      <li
        ref={ref}
        aria-posinset={index + 1}
        aria-setsize={total}
        className={slots.item({className})}
        data-current={isCurrent ? "true" : undefined}
        data-disabled={isDisabled ? "true" : undefined}
        data-key={String(id)}
        data-slot="stepper-item"
        data-status={status}
        {...props}
      >
        {isInteractive ? (
          <ButtonPrimitive
            {...triggerProps}
            className={slots.trigger()}
            isDisabled={isDisabled}
            onPress={() => {
              if (!isCurrent) onCurrentChange?.(id);
            }}
          >
            {content}
          </ButtonPrimitive>
        ) : (
          <div
            {...triggerProps}
            aria-disabled={isDisabled || undefined}
            className={slots.trigger()}
          >
            {content}
          </div>
        )}
        {!isLast && (
          <span
            aria-hidden="true"
            className={slots.separator()}
            data-slot="stepper-separator"
            data-status={status}
          >
            <span className={slots.separatorFill()} data-slot="stepper-separator-fill" />
          </span>
        )}
      </li>
    </StepperItemContext>
  );
};

StepperItem.displayName = "SY INC.Stepper.Item";

/* -------------------------------------------------------------------------------------------------
 * Stepper Indicator
 * -----------------------------------------------------------------------------------------------*/
interface StepperIndicatorProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  children?: ReactNode | ((props: StepperItemRenderProps) => ReactNode);
}

const StepperIndicator = ({children, className, ...props}: StepperIndicatorProps) => {
  const {index, isCurrent, isDisabled, slots, status, total, variant} = useStepperItemContext();
  const renderProps = {index, isCurrent, isDisabled, status, total};
  const defaultIndicator =
    variant === "dot" ? null : status === "complete" ? (
      <svg
        aria-hidden="true"
        data-slot="stepper-check-icon"
        fill="none"
        role="presentation"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 16 16"
      >
        <path d="m3 8 3 3 7-7" />
      </svg>
    ) : status === "error" ? (
      <CloseIcon data-slot="stepper-error-icon" />
    ) : status === "loading" ? (
      <span aria-hidden="true" className={slots.spinner()} data-slot="stepper-spinner" />
    ) : (
      index + 1
    );

  return (
    <span
      aria-hidden="true"
      className={slots.indicator({className})}
      data-slot="stepper-indicator"
      data-status={status}
      {...props}
    >
      {typeof children === "function"
        ? children(renderProps)
        : children !== undefined
          ? children
          : defaultIndicator}
    </span>
  );
};

StepperIndicator.displayName = "SY INC.Stepper.Indicator";

/* -------------------------------------------------------------------------------------------------
 * Stepper Content
 * -----------------------------------------------------------------------------------------------*/
interface StepperContentProps extends ComponentPropsWithRef<"span"> {}

const StepperContent = ({className, ...props}: StepperContentProps) => {
  const {slots} = useStepperItemContext();

  return <span className={slots.content({className})} data-slot="stepper-content" {...props} />;
};

StepperContent.displayName = "SY INC.Stepper.Content";

/* -------------------------------------------------------------------------------------------------
 * Stepper Title
 * -----------------------------------------------------------------------------------------------*/
interface StepperTitleProps extends ComponentPropsWithRef<"span"> {}

const StepperTitle = ({className, ...props}: StepperTitleProps) => {
  const {slots} = useStepperItemContext();

  return <span className={slots.title({className})} data-slot="stepper-title" {...props} />;
};

StepperTitle.displayName = "SY INC.Stepper.Title";

/* -------------------------------------------------------------------------------------------------
 * Stepper Description
 * -----------------------------------------------------------------------------------------------*/
interface StepperDescriptionProps extends ComponentPropsWithRef<"span"> {}

const StepperDescription = ({className, ...props}: StepperDescriptionProps) => {
  const {slots} = useStepperItemContext();

  return (
    <span className={slots.description({className})} data-slot="stepper-description" {...props} />
  );
};

StepperDescription.displayName = "SY INC.Stepper.Description";

export {
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperRoot,
  StepperTitle,
};

export type {
  StepperContentProps,
  StepperDescriptionProps,
  StepperIndicatorProps,
  StepperItemProps,
  StepperItemRenderProps,
  StepperItemStatus,
  StepperRootProps,
  StepperStateProps,
  StepperStatus,
  StepperTitleProps,
};

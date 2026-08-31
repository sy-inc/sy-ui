"use client";

import type {Key} from "../rac";
import type {SegmentVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {useControlledState} from "@react-stately/utils";
import {segmentVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {SelectionIndicator as SelectionIndicatorPrimitive} from "react-aria-components/SelectionIndicator";
import {
  ToggleButtonGroup as ToggleButtonGroupPrimitive,
  ToggleButton as ToggleButtonPrimitive,
} from "react-aria-components/ToggleButtonGroup";

import {composeTwRenderProps} from "../../utils";

type SegmentContextValue = {
  slots?: ReturnType<typeof segmentVariants>;
};
const SegmentContext = createContext<SegmentContextValue>({});

type SegmentRootProps = Omit<
  ComponentPropsWithRef<typeof ToggleButtonGroupPrimitive>,
  | "defaultSelectedKeys"
  | "disallowEmptySelection"
  | "onSelectionChange"
  | "orientation"
  | "selectedKeys"
  | "selectionMode"
> &
  SegmentVariants & {
    defaultSelectedKey?: Key;
    onSelectionChange?: (key: Key) => void;
    selectedKey?: Key | null;
    separators?: boolean;
  };

const SegmentRoot = ({
  children,
  className,
  defaultSelectedKey,
  onSelectionChange,
  selectedKey,
  separators,
  size,
  variant,
  ...props
}: SegmentRootProps) => {
  const [selectedKeyState, setSelectedKey] = useControlledState(
    selectedKey,
    defaultSelectedKey ?? null,
    onSelectionChange,
  );
  const slots = React.useMemo(
    () => segmentVariants({separators, size, variant}),
    [separators, size, variant],
  );

  return (
    <SegmentContext value={{slots}}>
      <ToggleButtonGroupPrimitive
        {...props}
        disallowEmptySelection
        className={composeTwRenderProps(className, slots.base())}
        data-slot="segment"
        selectedKeys={selectedKeyState == null ? [] : [selectedKeyState]}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const nextKey = keys.values().next().value as Key | undefined;

          if (nextKey !== undefined) setSelectedKey(nextKey);
        }}
      >
        {children}
      </ToggleButtonGroupPrimitive>
    </SegmentContext>
  );
};

type SegmentItemProps = ComponentPropsWithRef<typeof ToggleButtonPrimitive>;

const SegmentItem = ({children, className, ...props}: SegmentItemProps) => {
  const {slots} = use(SegmentContext);

  return (
    <ToggleButtonPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.item())}
      data-slot="segment-item"
    >
      {(renderProps) => (
        <>
          <SelectionIndicatorPrimitive
            className={slots?.indicator()}
            data-slot="segment-indicator"
          />
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </ToggleButtonPrimitive>
  );
};

SegmentRoot.displayName = "SY INC.Segment";
SegmentItem.displayName = "SY INC.Segment.Item";

export {SegmentRoot, SegmentItem};
export type {SegmentRootProps, SegmentItemProps};

"use client";

import type {ButtonRootProps} from "../button";
import type {ComponentPropsWithRef, FocusEvent, Key, ReactNode} from "react";

import {
  isFocusable,
  mergeRefs,
  useEffectEvent,
  useExitAnimation,
  useLayoutEffect,
  useResizeObserver,
  useSlotId,
} from "@react-aria/utils";
import {useControlledState} from "@react-stately/utils";
import {viewStackVariants} from "@sy-inc/styles";
import React, {createContext, use, useEffect, useRef, useState} from "react";

import {composeTwRenderProps} from "../../utils/compose";
import {Button} from "../button";
import {IconChevronLeft} from "../icons";

type ViewStackDirection = "forward" | "backward";

type ViewStackStateProps =
  | {currentKey: Key; defaultKey?: never}
  | {currentKey?: never; defaultKey: Key};

type ViewStackRootProps = Omit<ComponentPropsWithRef<"div">, "children"> &
  ViewStackStateProps & {
    children: ReactNode;
    onCurrentChange?: (key: Key) => void;
  };

interface ViewStackState {
  currentKey: Key;
  /** `null` until the first navigation, so the initial page never animates or steals focus. */
  direction: ViewStackDirection | null;
  canGoBack: boolean;
  goBack: () => void;
  navigate: (key: Key) => void;
}

interface FocusMemory {
  element: Element;
  /** Position among the page's focusables, for pages that remount on return. */
  index: number;
}

interface ViewStackContextValue extends ViewStackState {
  focusMemory: Map<Key, FocusMemory>;
}

interface Navigation {
  history: Key[];
  direction: ViewStackDirection | null;
}

/* Root, views, header, back and title have no appearance variants. */
const slots = viewStackVariants();

const ViewStackContext = createContext<ViewStackContextValue | null>(null);

const useViewStackContext = () => {
  const context = use(ViewStackContext);

  if (!context) throw new Error("ViewStack parts must be used within ViewStack");

  return context;
};

const useViewStack = (): ViewStackState => {
  const {canGoBack, currentKey, direction, goBack, navigate} = useViewStackContext();

  return {canGoBack, currentKey, direction, goBack, navigate};
};

const getFocusables = (view: Element) =>
  Array.from(view.querySelectorAll("*")).filter((el) => isFocusable(el));

/**
 * A key already on the path is a step back (truncate to it); a new key is a step forward
 * (append). This covers linear steps, branches, and jumps back to an earlier step.
 */
const resolveNavigation = (navigation: Navigation, key: Key): Navigation => {
  if (Object.is(navigation.history.at(-1), key)) return navigation;

  const index = navigation.history.findIndex((entry) => Object.is(entry, key));

  return index >= 0
    ? {direction: "backward", history: navigation.history.slice(0, index + 1)}
    : {direction: "forward", history: [...navigation.history, key]};
};

/* -------------------------------------------------------------------------------------------------
 * ViewStack Root
 * -----------------------------------------------------------------------------------------------*/

const ViewStackRoot = ({
  children,
  className,
  currentKey: controlledKey,
  defaultKey,
  onCurrentChange,
  ref: forwardedRef,
  ...props
}: ViewStackRootProps) => {
  const [currentKey, setCurrentKey] = useControlledState<Key>(
    controlledKey as Key,
    defaultKey as Key,
    onCurrentChange,
  );
  const [storedNavigation, setNavigation] = useState<Navigation>({
    direction: null,
    history: [currentKey],
  });
  const [focusMemory] = useState(() => new Map<Key, FocusMemory>());
  const ref = useRef<HTMLDivElement>(null);
  const previousHeight = useRef<number | null>(null);

  // Derived during render so controlled changes from outside get the same direction rules.
  const navigation = resolveNavigation(storedNavigation, currentKey);

  if (navigation !== storedNavigation) setNavigation(navigation);

  // Observers fire after layout, so on a page swap this still holds the outgoing height.
  useResizeObserver({
    onResize: () => {
      if (ref.current) previousHeight.current = ref.current.getBoundingClientRect().height;
    },
    ref,
  });

  // The first page now has computed styles, so only later pages match `@starting-style`.
  useEffect(() => ref.current?.setAttribute("data-motion", "true"), []);

  useLayoutEffect(() => {
    const el = ref.current;
    // Still null on mount: the observer has not reported a height yet.
    const from = previousHeight.current;

    if (
      !el ||
      from === null ||
      !/height|all/.test(window.getComputedStyle(el).transitionProperty)
    ) {
      return;
    }

    el.style.setProperty("--view-stack-height", "auto");
    const to = el.getBoundingClientRect().height;

    if (from === to) return;

    el.style.setProperty("--view-stack-height", `${from}px`);
    // Force a style recalculation so the next value transitions instead of jumping.
    void el.offsetHeight;
    el.style.setProperty("--view-stack-height", `${to}px`);
    let isActive = true;

    Promise.allSettled(el.getAnimations().map((animation) => animation.finished)).then(() => {
      if (isActive) el.style.setProperty("--view-stack-height", "auto");
    });

    return () => {
      isActive = false;
    };
  }, [currentKey]);

  const {direction, history} = navigation;
  const canGoBack = history.length > 1;
  const context: ViewStackContextValue = {
    canGoBack,
    currentKey,
    direction,
    focusMemory,
    goBack: () => {
      const previous = history.at(-2);

      if (previous !== undefined) setCurrentKey(previous);
    },
    navigate: setCurrentKey,
  };

  return (
    <ViewStackContext value={context}>
      <div
        {...props}
        ref={mergeRefs(ref, forwardedRef)}
        className={slots.base({className})}
        data-direction={direction ?? undefined}
        data-slot="view-stack"
      >
        {children}
      </div>
    </ViewStackContext>
  );
};

ViewStackRoot.displayName = "SY INC.ViewStack";

/* -------------------------------------------------------------------------------------------------
 * ViewStack View
 * -----------------------------------------------------------------------------------------------*/

interface ViewStackViewProps extends Omit<ComponentPropsWithRef<"div">, "id"> {
  id: Key;
  /** Keep the page mounted (hidden and inert) while it is not current. @default false */
  shouldForceMount?: boolean;
}

const ViewTitleIdContext = createContext<string | undefined>(undefined);

const ViewStackView = ({
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  id,
  onFocus,
  ref: forwardedRef,
  shouldForceMount = false,
  ...props
}: ViewStackViewProps) => {
  const stack = useViewStackContext();
  const ref = useRef<HTMLDivElement>(null);
  const isCurrent = Object.is(id, stack.currentKey);
  // Re-checked when the page is shown again: a non-current page renders no Title to find.
  const titleId = useSlotId([isCurrent]);
  const isExiting = useExitAnimation(ref, isCurrent);

  const moveFocus = useEffectEvent(() => {
    const view = ref.current;
    const active = view?.ownerDocument.activeElement;

    if (!view || stack.direction === null) return;
    // An `autoFocus` element inside the page already took focus.
    if (active && active !== view && view.contains(active)) return;

    let target: Element | null | undefined = null;

    if (stack.direction === "backward") {
      const memory = stack.focusMemory.get(id);

      target =
        memory && memory.element.isConnected && view.contains(memory.element)
          ? memory.element
          : memory && getFocusables(view)[memory.index];
    }
    target ??= view.querySelector('[data-slot="view-stack-title"]') ?? view;
    (target as HTMLElement).focus({preventScroll: true});
  });

  // A passive effect, so autoFocus done in effects by RAC fields runs first.
  useEffect(() => {
    if (isCurrent) moveFocus();
  }, [isCurrent]);

  if (!isCurrent && !isExiting && !shouldForceMount) return null;

  return (
    <ViewTitleIdContext value={titleId}>
      <div
        {...props}
        ref={mergeRefs(ref, forwardedRef)}
        aria-labelledby={ariaLabelledBy ?? titleId}
        className={slots.view({className})}
        data-current={isCurrent ? "true" : undefined}
        data-exiting={isExiting ? "true" : undefined}
        data-slot="view-stack-view"
        hidden={!isCurrent && !isExiting}
        inert={!isCurrent}
        role="group"
        tabIndex={-1}
        onFocus={(event: FocusEvent<HTMLDivElement>) => {
          onFocus?.(event);
          if (!isCurrent) return;
          stack.focusMemory.set(id, {
            element: event.target,
            index: getFocusables(event.currentTarget).indexOf(event.target),
          });
        }}
      >
        {children}
      </div>
    </ViewTitleIdContext>
  );
};

ViewStackView.displayName = "SY INC.ViewStack.View";

/* -------------------------------------------------------------------------------------------------
 * ViewStack Header
 * -----------------------------------------------------------------------------------------------*/

interface ViewStackHeaderProps extends ComponentPropsWithRef<"div"> {}

const ViewStackHeader = ({className, ...props}: ViewStackHeaderProps) => (
  <div {...props} className={slots.header({className})} data-slot="view-stack-header" />
);

ViewStackHeader.displayName = "SY INC.ViewStack.Header";

/* -------------------------------------------------------------------------------------------------
 * ViewStack Back
 * -----------------------------------------------------------------------------------------------*/

interface ViewStackBackProps extends ButtonRootProps {}

/**
 * Renders nothing on the first page of the path. A passed `onPress` replaces going back.
 * Without children it is a chevron icon button for the header; with children (e.g. "Back")
 * it is a text button for the footer.
 */
const ViewStackBack = ({children, className, onPress, ...props}: ViewStackBackProps) => {
  const {canGoBack, goBack} = useViewStackContext();
  const isIconOnly = children === undefined;

  if (!canGoBack) return null;

  return (
    <Button
      aria-label={isIconOnly ? "Back" : undefined}
      isIconOnly={isIconOnly}
      size={isIconOnly ? "sm" : undefined}
      variant={isIconOnly ? "ghost" : "tertiary"}
      {...props}
      className={composeTwRenderProps(className, slots.back())}
      data-icon-only={isIconOnly ? "true" : undefined}
      data-slot="view-stack-back"
      onPress={onPress ?? goBack}
    >
      {children ?? <IconChevronLeft />}
    </Button>
  );
};

ViewStackBack.displayName = "SY INC.ViewStack.Back";

/* -------------------------------------------------------------------------------------------------
 * ViewStack Title
 * -----------------------------------------------------------------------------------------------*/

interface ViewStackTitleProps extends ComponentPropsWithRef<"h2"> {
  /** @default 2 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Labels its page and is the fallback focus target when a page is entered. */
const ViewStackTitle = ({className, level = 2, ...props}: ViewStackTitleProps) => {
  const titleId = use(ViewTitleIdContext);
  const Tag = `h${level}` as const;

  return (
    <Tag
      {...props}
      className={slots.title({className})}
      data-slot="view-stack-title"
      id={titleId ?? props.id}
      tabIndex={-1}
    />
  );
};

ViewStackTitle.displayName = "SY INC.ViewStack.Title";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export {
  ViewStackBack,
  ViewStackHeader,
  ViewStackRoot,
  ViewStackTitle,
  ViewStackView,
  // eslint-disable-next-line react-refresh/only-export-components
  useViewStack,
};

export type {
  ViewStackBackProps,
  ViewStackDirection,
  ViewStackHeaderProps,
  ViewStackRootProps,
  ViewStackState,
  ViewStackStateProps,
  ViewStackTitleProps,
  ViewStackViewProps,
};

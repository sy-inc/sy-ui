"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {TabsVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {tabsVariants} from "@sy-inc/styles";
import React, {createContext, use, useCallback, useRef} from "react";
import {
  TabList as TabListPrimitive,
  TabPanel as TabPanelPrimitive,
  Tab as TabPrimitive,
  Tabs as TabsPrimitive,
} from "react-aria-components/Tabs";

import {createCollectionSlot} from "../../utils";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp} from "../icons";
import {SelectionIndicator as SelectionIndicatorPrimitive} from "../rac/selection-indicator";
import {ScrollShadow} from "../scroll-shadow";

/* -------------------------------------------------------------------------------------------------
 * Tabs Context
 * -----------------------------------------------------------------------------------------------*/
type TabsContext = {
  orientation?: "horizontal" | "vertical";
  slots?: ReturnType<typeof tabsVariants>;
};

const TabsContext = createContext<TabsContext>({});

/* -------------------------------------------------------------------------------------------------
 * Tabs Collection Slot
 * -----------------------------------------------------------------------------------------------*/
type ListContainerInjectedProps = {
  className?: string;
  render?: DOMRenderProps<"div", undefined>["render"];
} & React.ComponentPropsWithRef<"div">;

const listContainerSlot = createCollectionSlot<ListContainerInjectedProps>("tabs.listContainer");

// RAC reveals keyboard focus in the next frame, so centering waits two frames. Only the newest
// request survives: arrowing on through the strip must not let a stale frame drag the previous
// tab back into the centre.
// ponytail: one module-level handle, so two independent tab strips centring in the same frame
// would cancel each other; give each Tabs its own handle if that ever ships.
let pendingCenterFrame = 0;

const scheduleCenter = (center: () => void) => {
  cancelAnimationFrame(pendingCenterFrame);
  pendingCenterFrame = requestAnimationFrame(() => {
    pendingCenterFrame = requestAnimationFrame(center);
  });
};

const scrollTabsBy = (
  scroller: HTMLElement,
  isVertical: boolean,
  delta: number,
  behavior: ScrollBehavior = "smooth",
) => {
  const size = isVertical ? scroller.clientHeight : scroller.clientWidth;
  const current = isVertical ? scroller.scrollTop : scroller.scrollLeft;
  const maxScroll = Math.max(0, (isVertical ? scroller.scrollHeight : scroller.scrollWidth) - size);
  const isRTL = !isVertical && getComputedStyle(scroller).direction === "rtl";

  // Clamp before smooth scrolling so presses near an edge land flush on it,
  // including on iOS Safari. Horizontal RTL ranges run [-maxScroll, 0].
  const next = Math.min(isRTL ? 0 : maxScroll, Math.max(isRTL ? -maxScroll : 0, current + delta));

  if (next !== current) scroller.scrollTo({behavior, [isVertical ? "top" : "left"]: next});
};

/* -------------------------------------------------------------------------------------------------
 * Tabs Root
 * -----------------------------------------------------------------------------------------------*/
interface TabsRootProps extends ComponentPropsWithRef<typeof TabsPrimitive>, TabsVariants {
  children: React.ReactNode;
  className?: string;
}

const TabsRoot = ({
  align,
  children,
  className,
  orientation = "horizontal",
  variant,
  ...props
}: TabsRootProps) => {
  const slots = React.useMemo(() => tabsVariants({align, variant}), [align, variant]);

  return (
    <TabsContext value={{orientation, slots}}>
      <TabsPrimitive
        {...props}
        className={composeTwRenderProps(className, slots.base())}
        data-slot="tabs"
        orientation={orientation}
      >
        {children}
      </TabsPrimitive>
    </TabsContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tabs List Container
 * -----------------------------------------------------------------------------------------------*/
interface TabListContainerProps extends ListContainerInjectedProps {}

const TabListContainer = ({
  children,
  className,
  render,
  ...containerProps
}: TabListContainerProps) => {
  return (
    <listContainerSlot.Injector {...containerProps} className={className} render={render}>
      {children}
    </listContainerSlot.Injector>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tabs List
 * -----------------------------------------------------------------------------------------------*/
interface TabListProps extends ComponentPropsWithRef<typeof TabListPrimitive<object>> {
  children: React.ReactNode;
  className?: string;
}

const TabList = ({children, className, ...props}: TabListProps) => {
  const {orientation = "horizontal", slots} = use(TabsContext);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isVertical = orientation === "vertical";

  const [listContainerProps, restProps] = listContainerSlot.useSlot(props);

  const scrollBy = useCallback(
    (direction: 1 | -1) => {
      const el = scrollerRef.current;

      if (!el) return;
      const size = isVertical ? el.clientHeight : el.clientWidth;

      // In RTL, the horizontal scroll range runs from 0 (start, on the right) to negative,
      // so the delta sign must be flipped for `scrollLeft` to move toward the intended edge.
      const isRTL = !isVertical && getComputedStyle(el).direction === "rtl";
      const delta = direction * size * 0.8 * (isRTL ? -1 : 1);

      scrollTabsBy(el, isVertical, delta);
    },
    [isVertical],
  );

  // Without ListContainer, stay a thin RAC TabList
  if (!listContainerProps) {
    return (
      <TabListPrimitive
        {...restProps}
        className={composeTwRenderProps(className, slots?.tabList())}
        data-slot="tabs-list"
      >
        {children}
      </TabListPrimitive>
    );
  }

  const {
    className: containerClassName,
    render: containerRender,
    ...containerRest
  } = listContainerProps;

  return (
    <TabListPrimitive
      {...restProps}
      className={composeTwRenderProps(className, slots?.tabList())}
      data-slot="tabs-list"
      render={(renderProps) => {
        const {
          children: listChildren,
          className: listClassName,
          ref: listRef,
          ...listRest
        } = renderProps as typeof renderProps & {
          ref?: React.Ref<HTMLDivElement>;
        };

        return (
          <dom.div
            className={composeSlotClassName(slots?.tabListContainer, containerClassName)}
            data-slot="tabs-list-container"
            render={containerRender}
            {...containerRest}
          >
            <ScrollShadow
              ref={scrollerRef}
              hideScrollBar
              className={composeSlotClassName(slots?.scroller)}
              orientation={orientation}
              size={64}
            >
              <div {...listRest} ref={listRef} className={listClassName}>
                {listChildren}
              </div>
            </ScrollShadow>

            <button
              aria-label={isVertical ? "Scroll tabs up" : "Scroll tabs left"}
              className={composeSlotClassName(slots?.scrollPrev)}
              tabIndex={-1}
              type="button"
              onClick={() => scrollBy(-1)}
            >
              {isVertical ? <IconChevronUp /> : <IconChevronLeft />}
            </button>

            <button
              aria-label={isVertical ? "Scroll tabs down" : "Scroll tabs right"}
              className={composeSlotClassName(slots?.scrollNext)}
              tabIndex={-1}
              type="button"
              onClick={() => scrollBy(1)}
            >
              {isVertical ? <IconChevronDown /> : <IconChevronRight />}
            </button>
          </dom.div>
        );
      }}
    >
      {children}
    </TabListPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tab
 * -----------------------------------------------------------------------------------------------*/
interface TabProps extends ComponentPropsWithRef<typeof TabPrimitive> {
  className?: string;
}

const Tab = ({children, className, onFocus, onPress, ...props}: TabProps) => {
  const {orientation = "horizontal", slots} = use(TabsContext);

  const centerTab = (tab: Element) => {
    scheduleCenter(() => {
      const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
      const isVertical = orientation === "vertical";
      const scroller = tab
        .closest('[data-slot="tabs-list-container"]')
        ?.querySelector<HTMLElement>(':scope > [data-slot="scroll-shadow"]');

      if (!scroller) {
        tab.scrollIntoView?.({
          behavior,
          block: isVertical ? "center" : "nearest",
          inline: isVertical ? "nearest" : "center",
        });

        return;
      }

      const tabRect = tab.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const size = isVertical ? scroller.clientHeight : scroller.clientWidth;
      const delta = isVertical
        ? tabRect.top + tabRect.height / 2 - scrollerRect.top - scroller.clientTop - size / 2
        : tabRect.left + tabRect.width / 2 - scrollerRect.left - scroller.clientLeft - size / 2;

      scrollTabsBy(scroller, isVertical, delta, behavior);
    });
  };

  return (
    <TabPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.tab())}
      data-slot="tabs-tab"
      onFocus={(event) => {
        onFocus?.(event);
        centerTab(event.currentTarget);
      }}
      onPress={(event) => {
        onPress?.(event);
        centerTab(event.target);
      }}
    >
      {children}
    </TabPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tab Indicator
 * -----------------------------------------------------------------------------------------------*/
interface TabIndicatorProps extends ComponentPropsWithRef<typeof SelectionIndicatorPrimitive> {
  className?: string;
}

const TabIndicator = ({className, ...props}: TabIndicatorProps) => {
  const {slots} = use(TabsContext);

  return (
    <SelectionIndicatorPrimitive
      className={composeSlotClassName(slots?.tabIndicator, className)}
      data-slot="tabs-indicator"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tab Panel
 * -----------------------------------------------------------------------------------------------*/
interface TabPanelProps extends Omit<ComponentPropsWithRef<typeof TabPanelPrimitive>, "children"> {
  children: React.ReactNode;
  className?: string;
}

const TabPanel = ({children, className, ...props}: TabPanelProps) => {
  const {slots} = use(TabsContext);

  return (
    <TabPanelPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.tabPanel())}
      data-slot="tabs-panel"
    >
      {children}
    </TabPanelPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tab Separator
 * -----------------------------------------------------------------------------------------------*/
interface TabSeparatorProps<
  E extends keyof React.JSX.IntrinsicElements = "span",
> extends DOMRenderProps<E, undefined> {
  className?: string;
}

const TabSeparator = <E extends keyof React.JSX.IntrinsicElements = "span">({
  className,
  ...props
}: TabSeparatorProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof TabSeparatorProps<E>>) => {
  const {slots} = use(TabsContext);

  return (
    <dom.span
      aria-hidden="true"
      className={composeSlotClassName(slots?.separator, className)}
      data-slot="tabs-separator"
      {...(props as any)}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {TabsRoot, TabListContainer, TabList, Tab, TabIndicator, TabPanel, TabSeparator};

export type {
  TabsRootProps,
  TabListContainerProps,
  TabListProps,
  TabProps,
  TabIndicatorProps,
  TabPanelProps,
  TabSeparatorProps,
};

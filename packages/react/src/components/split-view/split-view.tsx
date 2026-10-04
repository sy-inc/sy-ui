"use client";

import type {ButtonRootProps} from "../button";
import type {SplitViewVariants} from "@sy-inc/styles";
import type {CSSProperties, ComponentPropsWithoutRef} from "react";

import {useEffectEvent, useLayoutEffect} from "@react-aria/utils";
import {splitViewVariants} from "@sy-inc/styles";
import React, {useContext, useRef, useState} from "react";

import {composeTwRenderProps} from "../../utils/compose";
import {Button} from "../button";
import {IconChevronLeft} from "../icons";
import {SurfaceContext} from "../surface";

export type SplitViewPaneName = "start" | "content" | "end";
export type SplitViewTier = "compact" | "medium" | "wide";
export type SplitViewMediumBehavior = "replace-start" | "replace-content";

export interface SplitViewLayout {
  tier: SplitViewTier;
  visiblePanes: readonly SplitViewPaneName[];
}

export interface SplitViewPaneFocusEvent {
  pane: SplitViewPaneName;
  reason: "navigation" | "visibility";
  preventDefault: () => void;
}

export interface SplitViewRootProps extends ComponentPropsWithoutRef<"div"> {
  /** Foreground pane in compact; an open end pane takes priority in medium. @default "start" */
  activePane?: SplitViewPaneName;
  /** The pane displaced by the end pane in medium. @default "replace-start" */
  mediumBehavior?: SplitViewMediumBehavior;
  /** Reports the actual CSS layout after mount, including visibility changes. */
  onLayoutChange?: (layout: SplitViewLayout) => void;
  /** Customize or cancel focus moves after navigation or pane loss. Never on mount. */
  onPaneFocus?: (event: SplitViewPaneFocusEvent) => void;
}

// Only sections that paint --surface establish a new surface context.
const SURFACE_CONTEXT = {variant: "default" as const};

/* Root, layout and Back have no appearance variants. */
const partSlots = splitViewVariants();

const getPanes = (layout: Element) =>
  Array.from(layout.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement && node.hasAttribute("data-pane"),
  );
const isVisible = (node: HTMLElement) => !node.hidden && node.getClientRects().length > 0;

const SplitViewRoot = React.forwardRef<HTMLDivElement, SplitViewRootProps>(
  (
    {
      activePane = "start",
      children,
      className,
      mediumBehavior = "replace-start",
      onLayoutChange,
      onPaneFocus,
      ...props
    },
    ref,
  ) => {
    const layoutRef = useRef<HTMLDivElement>(null);
    const previous = useRef<SplitViewLayout | null>(null);
    const previousActive = useRef(activePane);
    const focusedPane = useRef<HTMLElement | null>(null);
    const rememberedFocus = useRef(new Map<SplitViewPaneName, HTMLElement>());
    // Rendered with the new activePane, so the entering pane's starting style sees its origin.
    const [motion, setMotion] = useState({active: activePane, from: activePane});

    if (motion.active !== activePane) setMotion({active: activePane, from: motion.active});

    // Reads the latest props, so parent re-renders never rebuild the observers.
    const update = useEffectEvent(() => {
      const layout = layoutRef.current;

      if (!layout) return;

      const ownerDocument = layout.ownerDocument;
      // CSS owns the breakpoints; the tier lives on the query container's child.
      const tier = getComputedStyle(layout).getPropertyValue("--split-view-tier").trim();

      if (tier !== "compact" && tier !== "medium" && tier !== "wide") return;

      const visible = getPanes(layout).filter(isVisible);
      const next: SplitViewLayout = {
        tier,
        visiblePanes: visible.map((pane) => pane.dataset["pane"] as SplitViewPaneName),
      };
      const last = previous.current;
      const destination =
        visible.find((pane) => pane.dataset["pane"] === activePane) ??
        visible.find((pane) => pane.dataset["pane"] === "content") ??
        visible[0];
      const destinationPane = destination?.dataset["pane"] as SplitViewPaneName | undefined;
      const navigation =
        previousActive.current !== activePane &&
        tier !== "wide" &&
        destinationPane &&
        !last?.visiblePanes.includes(destinationPane);
      const lostFocus =
        focusedPane.current &&
        !visible.includes(focusedPane.current) &&
        (focusedPane.current.contains(ownerDocument.activeElement) ||
          ownerDocument.activeElement === ownerDocument.body);

      previous.current = next;
      previousActive.current = activePane;

      if (last && destination && destinationPane && (navigation || lostFocus)) {
        let prevented = false;

        onPaneFocus?.({
          pane: destinationPane,
          preventDefault: () => {
            prevented = true;
          },
          reason: navigation ? "navigation" : "visibility",
        });
        if (!prevented) {
          const saved = rememberedFocus.current.get(destinationPane);
          // A visible destination is connected, so containing `saved` implies it is too.
          const target =
            saved && destination.contains(saved) && isVisible(saved) && !saved.matches(":disabled")
              ? saved
              : destination;

          target.focus({preventScroll: true});
        }
      }

      if (
        !last ||
        last.tier !== next.tier ||
        last.visiblePanes.join() !== next.visiblePanes.join()
      ) {
        onLayoutChange?.(next);
      }
    });

    useLayoutEffect(() => {
      const layout = layoutRef.current;

      if (!layout) return;

      const ownerDocument = layout.ownerDocument;
      const rememberFocus = (target: EventTarget | null) => {
        const pane =
          target instanceof HTMLElement
            ? getPanes(layout).find((node) => node.contains(target))
            : undefined;

        focusedPane.current = pane ?? null;
        if (pane)
          rememberedFocus.current.set(
            pane.dataset["pane"] as SplitViewPaneName,
            target as HTMLElement,
          );
      };
      const remember = (event: FocusEvent) => rememberFocus(event.target);
      // Tiers follow the root's width, which the layout fills.
      const resize = new ResizeObserver(update);
      // Only pane membership and `hidden` affect the layout; edits inside panes do not.
      const mutations = new MutationObserver((records) => {
        if (
          records.some((record) =>
            record.type === "childList"
              ? record.target === layout
              : record.target.parentElement === layout,
          )
        ) {
          update();
        }
      });

      ownerDocument.addEventListener("focusin", remember);
      if (!previous.current) rememberFocus(ownerDocument.activeElement);
      mutations.observe(layout, {
        attributeFilter: ["hidden"],
        attributes: true,
        childList: true,
        subtree: true,
      });
      resize.observe(layout);
      update();
      // Panes now have computed styles, so only later entries match `@starting-style`.
      layout.setAttribute("data-motion", "");

      return () => {
        resize.disconnect();
        mutations.disconnect();
        ownerDocument.removeEventListener("focusin", remember);
      };
    }, [update]);

    // The MutationObserver does not watch these attributes, and navigation focus must be synchronous.
    useLayoutEffect(() => update(), [activePane, mediumBehavior, update]);

    return (
      <div {...props} ref={ref} className={partSlots.base({className})} data-slot="split-view">
        <div
          ref={layoutRef}
          className={partSlots.layout()}
          data-active={activePane}
          data-from={motion.from}
          data-medium-behavior={mediumBehavior}
          data-slot="split-view-layout"
        >
          {children}
        </div>
      </div>
    );
  },
);

interface SplitViewSectionProps extends ComponentPropsWithoutRef<"section"> {
  /** Transparent, or a rounded surface with a subtle shadow. @default "transparent" */
  variant?: SplitViewVariants["variant"];
  /** Use "none" when children own scrolling or contain fixed headers/footers. @default "auto" */
  scroll?: "auto" | "none";
}

export interface SplitViewContentProps extends SplitViewSectionProps {}

const SplitViewContent = React.forwardRef<HTMLElement, SplitViewContentProps>(
  (
    {children, className, scroll = "auto", tabIndex = -1, variant = "transparent", ...props},
    ref,
  ) => {
    const parentSurface = useContext(SurfaceContext);

    return (
      <section
        {...props}
        ref={ref}
        className={partSlots.content({className, variant})}
        data-pane="content"
        data-scroll={scroll}
        data-slot="split-view-content"
        data-variant={variant}
        tabIndex={tabIndex}
      >
        <SurfaceContext value={variant === "surface" ? SURFACE_CONTEXT : parentSurface}>
          {children}
        </SurfaceContext>
      </section>
    );
  },
);

export interface SplitViewPaneProps extends SplitViewSectionProps {
  /** Logical side of the main content. @default "start" */
  position?: "start" | "end";
  /** Closing keeps children mounted, even in wide layouts. @default true */
  isOpen?: boolean;
  /** Preferred width in multi-pane layouts. Numbers are pixels. */
  width?: CSSProperties["width"];
  minWidth?: CSSProperties["minWidth"];
  maxWidth?: CSSProperties["maxWidth"];
}

const cssLength = (value: CSSProperties["width"]) =>
  typeof value === "number" ? `${value}px` : value;

const SplitViewPane = React.forwardRef<HTMLElement, SplitViewPaneProps>(
  (
    {
      children,
      className,
      hidden,
      isOpen = true,
      maxWidth,
      minWidth,
      position = "start",
      scroll = "auto",
      style,
      tabIndex = -1,
      variant = "transparent",
      width,
      ...props
    },
    ref,
  ) => {
    const parentSurface = useContext(SurfaceContext);

    return (
      <section
        {...props}
        ref={ref}
        className={partSlots.pane({className, variant})}
        data-pane={position}
        data-scroll={scroll}
        data-slot="split-view-pane"
        data-variant={variant}
        hidden={hidden || !isOpen}
        tabIndex={tabIndex}
        style={
          {
            "--split-view-pane-max-width": cssLength(maxWidth),
            "--split-view-pane-min-width": cssLength(minWidth),
            "--split-view-pane-width": cssLength(width),
            ...style,
          } as CSSProperties
        }
      >
        <SurfaceContext value={variant === "surface" ? SURFACE_CONTEXT : parentSurface}>
          {children}
        </SurfaceContext>
      </section>
    );
  },
);

export interface SplitViewBackProps extends Omit<ButtonRootProps, "aria-label"> {
  "aria-label": string;
  /** Show only while this pane is displaced. Does not perform navigation. @default "start" */
  targetPane?: SplitViewPaneName;
}

const SplitViewBack = React.forwardRef<HTMLButtonElement, SplitViewBackProps>(
  ({children, className, targetPane = "start", ...props}, ref) => (
    <Button
      isIconOnly
      variant="ghost"
      {...props}
      ref={ref}
      className={composeTwRenderProps(className, partSlots.back())}
      data-slot="split-view-back"
      data-target-pane={targetPane}
    >
      {children ?? <IconChevronLeft />}
    </Button>
  ),
);

SplitViewRoot.displayName = "SY INC.SplitView";
SplitViewContent.displayName = "SY INC.SplitView.Content";
SplitViewPane.displayName = "SY INC.SplitView.Pane";
SplitViewBack.displayName = "SY INC.SplitView.Back";

export {SplitViewRoot, SplitViewContent, SplitViewPane, SplitViewBack};

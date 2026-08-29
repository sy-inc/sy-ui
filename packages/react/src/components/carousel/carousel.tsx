"use client";

import type {EmblaCarouselType, EmblaOptionsType, EmblaPluginType} from "embla-carousel";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {mergeRefs} from "@react-aria/utils";
import {carouselVariants} from "@sy-inc/styles";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import React, {createContext, use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";

import {composeTwRenderProps} from "../../utils";
import {IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp} from "../icons";
import {ProgressBar} from "../progress-bar";

type CarouselOrientation = "horizontal" | "vertical";
type CarouselBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
type CarouselResponsive<T> = T | Partial<Record<CarouselBreakpoint, T>>;
export type CarouselItemsPerView = CarouselResponsive<number>;
export type CarouselGap = CarouselResponsive<number | string>;
export type CarouselPeek = CarouselResponsive<number | string>;

// Tailwind's default min-width breakpoints, reused both for the CSS custom-property cascade and
// as Embla `breakpoints` media queries so `slidesToScroll` stays in lockstep with itemsPerView.
const RESPONSIVE_BREAKPOINTS: Record<Exclude<CarouselBreakpoint, "base">, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Turns a `CarouselResponsive<T>` value into `--carousel-<name>-<breakpoint>` CSS variables.
 * Scalars become the `base` breakpoint rather than the final variable: an inline final value
 * would outrank every stylesheet rule, including the data-scrollable degrade override.
 */
const responsiveStyle = (
  name: string,
  value: CarouselResponsive<number | string> | undefined,
  unit?: (v: number | string) => string,
) => {
  if (value === undefined) return undefined;
  const format = (v: number | string) => (unit ? unit(v) : `${v}`);

  if (typeof value === "number" || typeof value === "string") {
    return {[`--carousel-${name}-base`]: format(value)} as React.CSSProperties;
  }

  return Object.fromEntries(
    Object.entries(value).map(([breakpoint, v]) => [`--carousel-${name}-${breakpoint}`, format(v)]),
  ) as React.CSSProperties;
};

export interface CarouselAutoplayOptions {
  delay?: number;
  /** Accessible name of the toggle while autoplay is running. */
  pauseLabel?: string;
  /** Accessible name of the toggle while autoplay is paused. */
  playLabel?: string;
}

type CarouselAutoplay = boolean | CarouselAutoplayOptions;
export type CarouselAutoplayInteraction = "resume" | "stop";

type CarouselContextValue = {
  api?: EmblaCarouselType;
  autoplayAvailable: boolean;
  autoplayPlaying: boolean;
  toggleAutoplay: () => void;
  canScrollNext: boolean;
  canScrollPrevious: boolean;
  clickable: boolean;
  orientation: CarouselOrientation;
  selectedIndex: number;
  slots: ReturnType<typeof carouselVariants>;
  viewportRef: ReturnType<typeof useEmblaCarousel>[0];
};

const snapForSlide = (api: EmblaCarouselType, slideIndex: number) => {
  const indexes = api.internalEngine().slideIndexes;

  if (!indexes?.length) return slideIndex;
  const snap = indexes.findLastIndex((index) => index <= slideIndex);

  return snap < 0 ? 0 : snap;
};

const leadSlideForSnap = (api: EmblaCarouselType, snapIndex: number) =>
  api.internalEngine().slideIndexes?.[snapIndex] ?? snapIndex;

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarouselContext = () => {
  const context = use(CarouselContext);

  if (!context) {
    throw new Error("Carousel parts must be rendered inside Carousel.Root.");
  }

  return context;
};

/* -------------------------------------------------------------------------------------------------
 * Carousel Root
 * -----------------------------------------------------------------------------------------------*/
interface CarouselRootProps extends Omit<ComponentPropsWithRef<"section">, "children"> {
  children: ReactNode;
  /** Called when the Embla instance is ready. */
  onApiChange?: (api: EmblaCarouselType) => void;
  /** Called once on initialization and when the selected snap index changes. */
  onSelectionChange?: (index: number, value?: string) => void;
  /** Embla options. The axis is derived from orientation. */
  options?: EmblaOptionsType;
  /** Optional Embla plugins such as autoplay. */
  plugins?: EmblaPluginType[];
  /** Number of complete cards visible; card width is derived from this value. */
  itemsPerView?: CarouselItemsPerView;
  gap?: CarouselGap;
  /**
   * Symmetric edge inset that reveals the previous/next item at both sides of the current one.
   * Drives the built-in scroll alignment — do not also pass `options.align`. Dropped automatically
   * while there are no slides beyond one view (`data-scrollable="false"`), so a short set fills
   * the viewport instead of floating between blank gutters.
   */
  peek?: CarouselPeek;
  /** Number of cards advanced by one snap. Defaults to itemsPerView. */
  slidesToScroll?: number;
  /** Enables accessible, internally-managed autoplay. */
  autoplay?: CarouselAutoplay;
  /** Whether pointer interaction resumes autoplay on leave or stops it until Play is pressed. */
  autoplayInteraction?: CarouselAutoplayInteraction;
  /** Enables wheel navigation; keyboard navigation is always available. */
  wheelNavigation?: boolean;
  /** Makes items with no explicit override selectable. */
  clickable?: boolean;
  orientation?: CarouselOrientation;
}

const CarouselRoot = ({
  "aria-label": ariaLabel = "carousel",
  autoplay: autoplayProp,
  autoplayInteraction = "resume",
  children,
  className,
  clickable = false,
  gap,
  itemsPerView = 1,
  onApiChange,
  onSelectionChange,
  options,
  orientation = "horizontal",
  peek,
  plugins,
  ref,
  slidesToScroll,
  style,
  wheelNavigation = false,
  ...props
}: CarouselRootProps) => {
  const autoplayEnabled = autoplayProp === true || typeof autoplayProp === "object";
  const autoplayOptions = React.useMemo(
    () => (autoplayProp && typeof autoplayProp === "object" ? autoplayProp : {}),
    [autoplayProp],
  );
  // Resolved in an effect so the server and the first client render always agree.
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const autoplayPlugin = React.useMemo(
    () =>
      autoplayEnabled && !reducedMotion
        ? Autoplay({
            delay: autoplayOptions.delay ?? 4000,
            // Leaves every pause/resume decision to the pointer-in/pointer-out rule below.
            defaultInteraction: false,
          })
        : undefined,
    [autoplayEnabled, autoplayOptions.delay, reducedMotion],
  );
  // Keeps slidesToScroll in sync with a responsive itemsPerView via Embla's own breakpoint
  // watcher, instead of polling layout with a ResizeObserver.
  const itemsPerViewBreakpoints = React.useMemo(() => {
    if (typeof itemsPerView === "number") return undefined;

    const entries = Object.entries(itemsPerView).filter(([breakpoint]) => breakpoint !== "base");

    if (!entries.length) return undefined;

    return Object.fromEntries(
      entries.map(([breakpoint, count]) => [
        `(min-width: ${RESPONSIVE_BREAKPOINTS[breakpoint as keyof typeof RESPONSIVE_BREAKPOINTS]}px)`,
        {slidesToScroll: count},
      ]),
    );
  }, [itemsPerView]);
  const baseItemsPerView =
    typeof itemsPerView === "number" ? itemsPerView : (itemsPerView.base ?? 1);
  const rootRef = React.useRef<HTMLElement>(null);
  // Reads the resolved --carousel-peek custom property instead of re-deriving the responsive
  // value in JS, so breakpoint resolution has one source of truth: the CSS cascade.
  const peekAlign = React.useCallback((viewSize: number) => {
    if (typeof window === "undefined" || !rootRef.current) return 0;
    const raw = window.getComputedStyle(rootRef.current).getPropertyValue("--carousel-peek").trim();

    if (!raw) return 0;

    return raw.endsWith("%") ? (parseFloat(raw) / 100) * viewSize : parseFloat(raw) || 0;
  }, []);
  const resolvedOptions = React.useMemo<EmblaOptionsType>(
    () => ({
      ...options,
      axis: orientation === "horizontal" ? "x" : "y",
      slidesToScroll: options?.slidesToScroll ?? slidesToScroll ?? baseItemsPerView,
      ...(itemsPerViewBreakpoints
        ? {breakpoints: {...itemsPerViewBreakpoints, ...options?.breakpoints}}
        : {}),
      ...(autoplayEnabled && options?.loop === undefined ? {loop: true} : {}),
      ...(peek !== undefined && options?.align === undefined ? {align: peekAlign} : {}),
    }),
    [
      autoplayEnabled,
      baseItemsPerView,
      itemsPerViewBreakpoints,
      options,
      orientation,
      peek,
      peekAlign,
      slidesToScroll,
    ],
  );
  const resolvedPlugins = React.useMemo(
    () => (autoplayPlugin ? [...(plugins ?? []), autoplayPlugin] : plugins),
    [autoplayPlugin, plugins],
  );
  const [viewportRef, api] = useEmblaCarousel(resolvedOptions, resolvedPlugins);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrevious, setCanScrollPrevious] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [scrollable, setScrollable] = React.useState<boolean>();
  const [looping, setLooping] = React.useState<boolean>();
  const [autoplayAvailable, setAutoplayAvailable] = React.useState(false);
  const [autoplayPlaying, setAutoplayPlaying] = React.useState(false);
  const userPausedRef = React.useRef(false);
  const pointerInsideRef = React.useRef(false);
  const onSelectionChangeRef = React.useRef(onSelectionChange);
  const lastSelectedIndexRef = React.useRef<number | undefined>(undefined);

  onSelectionChangeRef.current = onSelectionChange;
  const slots = React.useMemo(() => carouselVariants({orientation}), [orientation]);
  const itemsPerViewStyle = React.useMemo(
    () => responsiveStyle("items-per-view", itemsPerView),
    [itemsPerView],
  );
  const gapStyle = React.useMemo(
    () => responsiveStyle("gap", gap, (v) => (typeof v === "number" ? `${v}px` : v)),
    [gap],
  );
  const peekStyle = React.useMemo(
    () => responsiveStyle("peek", peek, (v) => (typeof v === "number" ? `${v}px` : v)),
    [peek],
  );

  React.useEffect(() => {
    if (!api) return;
    const viewport = api.rootNode();
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    const direction = () =>
      getComputedStyle(viewport).direction === "rtl" || viewport.closest("[dir=rtl]") !== null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditable(event.target)) return;
      const selected = api.selectedSnap();
      const last = api.slideNodes().length - 1;
      let target: number | undefined;
      let move: (() => void) | undefined;

      if (event.key === "Home") target = 0;
      else if (event.key === "End") target = last;
      else if (
        orientation === "horizontal" &&
        event.key === (direction() ? "ArrowLeft" : "ArrowRight")
      ) {
        if (api.canGoToNext()) move = () => api.goToNext();
      } else if (
        orientation === "horizontal" &&
        event.key === (direction() ? "ArrowRight" : "ArrowLeft")
      ) {
        if (api.canGoToPrev()) move = () => api.goToPrev();
      } else if (orientation === "vertical" && event.key === "ArrowDown") {
        if (api.canGoToNext()) move = () => api.goToNext();
      } else if (orientation === "vertical" && event.key === "ArrowUp") {
        if (api.canGoToPrev()) move = () => api.goToPrev();
      }
      if (move) {
        event.preventDefault();
        move();

        return;
      }
      if (target === undefined || target === selected) return;
      event.preventDefault();
      api.goTo(target);
    };
    const onWheel = (event: WheelEvent) => {
      if (!wheelNavigation || isEditable(event.target)) return;
      const delta =
        orientation === "horizontal"
          ? Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY
          : event.deltaY;

      if (delta === 0) return;
      const forward = delta > 0;

      if (forward ? !api.canGoToNext() : !api.canGoToPrev()) return;
      event.preventDefault();
      forward ? api.goToNext() : api.goToPrev();
    };

    viewport.tabIndex = 0;
    viewport.addEventListener("keydown", onKeyDown);
    viewport.addEventListener("wheel", onWheel, {passive: false});

    return () => {
      viewport.removeEventListener("keydown", onKeyDown);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [api, orientation, wheelNavigation]);

  React.useEffect(() => {
    if (!autoplayEnabled) return;
    setReducedMotion(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, [autoplayEnabled]);

  const updateState = React.useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedSnap());
    setCanScrollPrevious(emblaApi.canGoToPrev());
    setCanScrollNext(emblaApi.canGoToNext());
    // Embla silently rebuilds without loop when the slides cannot cover a looped view; mirror the
    // engine's decision so loop-only CSS (the seam gap) never applies to a fallback carousel.
    setLooping(!!emblaApi.internalEngine().options.loop);
    // "More slides than one view" rather than canGoToNext/Prev: the CSS drops the peek insets on
    // data-scrollable="false", and a scrollability predicate could flip back once the widened
    // slides overflow — this one is independent of peek. Per-view count comes from the resolved
    // custom property so breakpoint resolution keeps one source of truth, like peekAlign.
    const root = rootRef.current;
    const perView = root
      ? parseFloat(getComputedStyle(root).getPropertyValue("--carousel-items-per-view")) || 1
      : 1;

    setScrollable(emblaApi.slideNodes().length > perView);
  }, []);

  React.useEffect(() => {
    if (!api) return;

    lastSelectedIndexRef.current = undefined;
    updateState(api);
    const notifySelection = () => {
      const index = api.selectedSnap();

      if (lastSelectedIndexRef.current === index) return;
      lastSelectedIndexRef.current = index;
      const leadIndex = leadSlideForSnap(api, index);
      const value =
        leadIndex === undefined
          ? undefined
          : (api.slideNodes()[leadIndex]?.getAttribute("data-value") ?? undefined);

      if (value === undefined) onSelectionChangeRef.current?.(index);
      else onSelectionChangeRef.current?.(index, value);
    };

    notifySelection();
    onApiChange?.(api);
    api.on("reinit", updateState).on("select", updateState).on("select", notifySelection);

    return () => {
      api.off("reinit", updateState).off("select", updateState).off("select", notifySelection);
    };
  }, [api, onApiChange, updateState]);

  React.useEffect(() => {
    const autoplay = api?.plugins()?.autoplay;
    const root = rootRef.current;

    if (!root) return;
    if (!autoplay) {
      setAutoplayAvailable(autoplayEnabled && reducedMotion);

      return;
    }
    // The plugin owns the running state; mirror its transitions instead of tracking them in
    // parallel. It emits before flipping its own flag, so read the event, not isPlaying().
    const onPlay = () => setAutoplayPlaying(true);
    const onStop = () => setAutoplayPlaying(false);
    const syncAutoplay = () => {
      const available = api.snapList().length > 1;

      setAutoplayAvailable(available);
      if (!available || userPausedRef.current || pointerInsideRef.current) autoplay.pause();
      else autoplay.play();
    };
    // Pointer-in pauses, pointer-out resumes. Dragging always happens pointer-in, so it needs no
    // rule of its own. An explicit pause from the toggle outranks pointer-out.
    // Pointer events rather than mouse events so the one rule covers touch too: a touch pointer
    // enters on finger-down and leaves on finger-up, which is what "inside" means without hover.
    const onPointerEnter = () => {
      pointerInsideRef.current = true;
      autoplay.pause();
    };
    const onPointerDown = () => {
      if (autoplayInteraction === "stop") autoplay.stop();
    };
    const onPointerLeave = () => {
      pointerInsideRef.current = false;
      if (autoplayInteraction === "resume" && !userPausedRef.current && api.snapList().length > 1) {
        autoplay.play();
      }
    };

    api.on("autoplay:play", onPlay).on("autoplay:stop", onStop).on("reinit", syncAutoplay);
    syncAutoplay();
    root.addEventListener("pointerenter", onPointerEnter);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      api.off("autoplay:play", onPlay).off("autoplay:stop", onStop).off("reinit", syncAutoplay);
      root.removeEventListener("pointerenter", onPointerEnter);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerleave", onPointerLeave);
      autoplay.stop();
    };
  }, [api, autoplayEnabled, autoplayInteraction, autoplayPlugin, reducedMotion]);

  const toggleAutoplay = React.useCallback(() => {
    const autoplay = api?.plugins()?.autoplay;

    if (!autoplay || api.snapList().length <= 1) return;
    userPausedRef.current = autoplayPlaying;
    if (autoplayPlaying) autoplay.pause();
    else {
      userPausedRef.current = false;
      autoplay.play();
    }
  }, [api, autoplayPlaying]);

  const context = React.useMemo<CarouselContextValue>(
    () => ({
      api,
      autoplayAvailable,
      autoplayPlaying,
      canScrollNext,
      canScrollPrevious,
      clickable,
      orientation,
      selectedIndex,
      slots,
      toggleAutoplay,
      viewportRef,
    }),
    [
      api,
      autoplayAvailable,
      autoplayPlaying,
      canScrollNext,
      canScrollPrevious,
      clickable,
      orientation,
      selectedIndex,
      slots,
      toggleAutoplay,
      viewportRef,
    ],
  );

  return (
    <CarouselContext value={context}>
      <section
        ref={mergeRefs<HTMLElement>(rootRef, ref)}
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        className={slots.base({className})}
        // Requested loop until the engine reports back: the seam-gap margin this attribute enables
        // must already be in place when Embla first measures the slides.
        data-loop={(looping ?? resolvedOptions.loop) ? "true" : undefined}
        data-orientation={orientation}
        data-scrollable={scrollable === undefined ? undefined : scrollable ? "true" : "false"}
        data-slot="carousel"
        style={{...itemsPerViewStyle, ...gapStyle, ...peekStyle, ...style}}
        {...props}
      >
        {children}
      </section>
    </CarouselContext>
  );
};

CarouselRoot.displayName = "SY INC.Carousel";

/* -------------------------------------------------------------------------------------------------
 * Carousel Content
 * -----------------------------------------------------------------------------------------------*/
// Embla requires two nested nodes: an overflow-hidden viewport and the flex track it clips. They
// always appear together with no variation between them, so one part renders both — the clipping
// viewport inherits the root's border radius, so round the carousel itself for clipped corners.
interface CarouselContentProps extends ComponentPropsWithRef<"div"> {}

const CarouselContent = ({className, ref, ...props}: CarouselContentProps) => {
  const {orientation, slots, viewportRef} = useCarouselContext();

  return (
    <div ref={viewportRef} className={slots.viewport()} data-slot="carousel-viewport">
      <div
        ref={ref}
        className={slots.content({className})}
        data-orientation={orientation}
        data-slot="carousel-content"
        {...props}
      />
    </div>
  );
};

CarouselContent.displayName = "SY INC.Carousel.Content";

/* -------------------------------------------------------------------------------------------------
 * Carousel Item
 * -----------------------------------------------------------------------------------------------*/
interface CarouselItemProps extends ComponentPropsWithRef<"div"> {
  clickable?: boolean;
  isDisabled?: boolean;
  value?: string;
}

const CarouselItem = ({
  className,
  clickable: itemClickable,
  isDisabled = false,
  onClick,
  onKeyDown,
  ref,
  value,
  ...props
}: CarouselItemProps) => {
  const {api, clickable, selectedIndex, slots} = useCarouselContext();
  const interactive = itemClickable ?? clickable;
  const itemRef = React.useRef<HTMLDivElement>(null);
  const selectItem = () => {
    const node = itemRef.current;

    if (!interactive || isDisabled || !api || !node) return;
    const index = api.slideNodes().indexOf(node);

    const snap = index >= 0 ? snapForSlide(api, index) : -1;

    if (snap >= 0) api.goTo(snap);
  };

  return (
    <div
      ref={mergeRefs<HTMLDivElement>(itemRef, ref)}
      aria-disabled={interactive && isDisabled ? "true" : undefined}
      aria-roledescription="slide"
      className={slots.item({className})}
      data-slot="carousel-item"
      data-value={value}
      role={interactive ? "button" : "group"}
      tabIndex={interactive && !isDisabled ? 0 : undefined}
      data-selected={
        api &&
        itemRef.current &&
        leadSlideForSnap(api, selectedIndex) === api.slideNodes().indexOf(itemRef.current)
          ? "true"
          : "false"
      }
      onClick={(event) => {
        const onNestedControl = (event.target as HTMLElement).closest(
          "button, a, input, textarea, select, [contenteditable=true]",
        );

        if (!onNestedControl) selectItem();
        onClick?.(event);
      }}
      onKeyDown={(event) => {
        if (interactive && !isDisabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          selectItem();
        }
        onKeyDown?.(event);
      }}
      {...props}
    />
  );
};

CarouselItem.displayName = "SY INC.Carousel.Item";

/* -------------------------------------------------------------------------------------------------
 * Carousel Previous / Next
 * -----------------------------------------------------------------------------------------------*/
interface CarouselControlProps extends Omit<
  ComponentPropsWithRef<typeof ButtonPrimitive>,
  "children"
> {
  children?: ReactNode;
}

type CarouselPreviousProps = CarouselControlProps;

const CarouselPrevious = ({
  "aria-label": ariaLabel = "Previous slide",
  children,
  className,
  isDisabled,
  onPress,
  ...props
}: CarouselPreviousProps) => {
  const {api, canScrollPrevious, orientation, slots} = useCarouselContext();

  return (
    <ButtonPrimitive
      aria-label={ariaLabel}
      className={composeTwRenderProps(className, slots.previous())}
      data-slot="carousel-previous"
      isDisabled={isDisabled || !canScrollPrevious}
      onPress={(event) => {
        api?.goToPrev();
        onPress?.(event);
      }}
      {...props}
    >
      {children ??
        (orientation === "horizontal" ? (
          <IconChevronLeft aria-hidden="true" />
        ) : (
          <IconChevronUp aria-hidden="true" />
        ))}
    </ButtonPrimitive>
  );
};

CarouselPrevious.displayName = "SY INC.Carousel.Previous";

type CarouselNextProps = CarouselControlProps;

const CarouselNext = ({
  "aria-label": ariaLabel = "Next slide",
  children,
  className,
  isDisabled,
  onPress,
  ...props
}: CarouselNextProps) => {
  const {api, canScrollNext, orientation, slots} = useCarouselContext();

  return (
    <ButtonPrimitive
      aria-label={ariaLabel}
      className={composeTwRenderProps(className, slots.next())}
      data-slot="carousel-next"
      isDisabled={isDisabled || !canScrollNext}
      onPress={(event) => {
        api?.goToNext();
        onPress?.(event);
      }}
      {...props}
    >
      {children ??
        (orientation === "horizontal" ? (
          <IconChevronRight aria-hidden="true" />
        ) : (
          <IconChevronDown aria-hidden="true" />
        ))}
    </ButtonPrimitive>
  );
};

CarouselNext.displayName = "SY INC.Carousel.Next";

type CarouselAutoplayControlProps = Pick<CarouselAutoplayOptions, "pauseLabel" | "playLabel">;

const CarouselAutoplayControl = ({
  pauseLabel = "Pause autoplay",
  playLabel = "Play autoplay",
}: CarouselAutoplayControlProps) => {
  const {autoplayAvailable, autoplayPlaying, slots, toggleAutoplay} = useCarouselContext();

  if (!autoplayAvailable) return null;

  return (
    <ButtonPrimitive
      aria-label={autoplayPlaying ? pauseLabel : playLabel}
      className={composeTwRenderProps(undefined, slots.autoplay())}
      data-slot="carousel-autoplay"
      onPress={toggleAutoplay}
    >
      {autoplayPlaying ? "Pause" : "Play"}
    </ButtonPrimitive>
  );
};

CarouselAutoplayControl.displayName = "SY INC.Carousel.AutoplayControl";

/* -------------------------------------------------------------------------------------------------
 * Carousel Autoplay Progress
 * -----------------------------------------------------------------------------------------------*/
type CarouselAutoplayProgressProps = Omit<
  ComponentPropsWithRef<typeof ProgressBar>,
  "children" | "value"
>;

const CarouselAutoplayProgress = ({className, ...props}: CarouselAutoplayProgressProps) => {
  const {api, autoplayAvailable, slots} = useCarouselContext();
  const indicatorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const autoplay = api?.plugins()?.autoplay;
    const indicator = indicatorRef.current;

    if (!autoplay || !indicator || !autoplayAvailable) return;
    let animation: Animation | undefined;
    const onTimerSet = () => {
      if (animation?.playState === "paused") {
        animation.play();

        return;
      }

      const duration = autoplay.timeUntilNext();

      if (duration === null) return;
      animation?.cancel();
      animation = indicator.animate([{transform: "scaleX(0)"}, {transform: "scaleX(1)"}], {
        duration,
        easing: "linear",
        fill: "forwards",
      });
    };
    const onTimerStopped = () => animation?.pause();

    api.on("autoplay:timerset", onTimerSet).on("autoplay:timerstopped", onTimerStopped);
    if (autoplay.isPlaying()) onTimerSet();

    return () => {
      api.off("autoplay:timerset", onTimerSet).off("autoplay:timerstopped", onTimerStopped);
      animation?.cancel();
    };
  }, [api, autoplayAvailable]);

  if (!autoplayAvailable || !api?.plugins()?.autoplay) return null;

  return (
    <ProgressBar
      aria-hidden="true"
      aria-label="Autoplay progress"
      className={composeTwRenderProps(className, slots.autoplayProgress())}
      data-slot="carousel-autoplay-progress"
      value={100}
      {...props}
    >
      <ProgressBar.Track className={slots.autoplayProgressTrack()}>
        <ProgressBar.Fill
          ref={indicatorRef}
          className={slots.autoplayProgressFill()}
          data-slot="carousel-autoplay-progress-indicator"
          style={{transformOrigin: "left"}}
        />
      </ProgressBar.Track>
    </ProgressBar>
  );
};

CarouselAutoplayProgress.displayName = "SY INC.Carousel.AutoplayProgress";

/* -------------------------------------------------------------------------------------------------
 * Carousel Pagination
 * -----------------------------------------------------------------------------------------------*/
interface CarouselPaginationRenderProps {
  index: number;
  isSelected: boolean;
}

interface CarouselPaginationProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  children?: (values: CarouselPaginationRenderProps) => ReactNode;
}

const CarouselPagination = ({children, className, ...props}: CarouselPaginationProps) => {
  const {api, selectedIndex, slots} = useCarouselContext();
  const [pageCount, setPageCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const updatePagination = () => setPageCount(api.snapList().length);

    updatePagination();
    api.on("reinit", updatePagination);

    return () => {
      api.off("reinit", updatePagination);
    };
  }, [api]);

  return (
    <div
      className={slots.pagination({className})}
      data-slot="carousel-pagination"
      role="group"
      {...props}
    >
      {Array.from({length: pageCount}, (_, index) => {
        const isSelected = selectedIndex === index;

        return (
          <ButtonPrimitive
            key={index}
            aria-current={isSelected ? "true" : undefined}
            aria-label={`Go to slide ${index + 1}`}
            className={composeTwRenderProps(undefined, slots.paginationItem())}
            data-custom={children ? "true" : undefined}
            data-selected={isSelected ? "true" : undefined}
            data-slot="carousel-pagination-item"
            onPress={() => api?.goTo(index)}
          >
            {children?.({index, isSelected})}
          </ButtonPrimitive>
        );
      })}
    </div>
  );
};

CarouselPagination.displayName = "SY INC.Carousel.Pagination";

export {
  CarouselAutoplayControl,
  CarouselAutoplayProgress,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPrevious,
  CarouselRoot,
};

export type {
  CarouselAutoplayControlProps,
  CarouselAutoplayProgressProps,
  CarouselContentProps,
  CarouselItemProps,
  CarouselNextProps,
  CarouselPaginationProps,
  CarouselPaginationRenderProps,
  CarouselOrientation,
  CarouselPreviousProps,
  CarouselRootProps,
};

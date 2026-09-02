"use client";

import type {PressEvent} from "@react-types/shared";
import type {CSSProperties, ComponentPropsWithRef, ReactNode} from "react";

import {pressableFeedbackVariants} from "@sy-inc/styles";
import {createContext, use, useCallback, useEffect, useRef, useState} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";

import {composeTwRenderProps} from "../../utils";

/* -------------------------------------------------------------------------------------------------
 * Shared
 * -----------------------------------------------------------------------------------------------*/
/** Press origin relative to the root's border box, plus how and where the press was made. */
type PressPoint = {
  pointerType: PressEvent["pointerType"];
  target: Element;
  x: number;
  y: number;
};

type PressListener = {
  /** Fired only when the press actually activates the root, so a drag-away never counts. */
  onPress?: () => void;
  onPressEnd?: () => void;
  onPressStart?: (point: PressPoint) => void;
};

type PressableFeedbackContextValue = {
  /** Relays the root's press events. Layers react in the callback, so the root never re-renders. */
  subscribe?: (listener: PressListener) => () => void;
};

const PressableFeedbackContext = createContext<PressableFeedbackContextValue>({});

// No variants, so the slot map is a constant rather than per-instance context state.
const slots = pressableFeedbackVariants();

export type PressableFeedbackSweep = "down" | "left" | "right" | "up";

/* -------------------------------------------------------------------------------------------------
 * PressableFeedback Root
 * -----------------------------------------------------------------------------------------------*/
export interface PressableFeedbackRootProps extends Omit<
  ComponentPropsWithRef<typeof ButtonPrimitive>,
  "children"
> {
  children?: ReactNode;
}

const PressableFeedbackRoot = ({
  children,
  className,
  onPress,
  onPressEnd,
  onPressStart,
  ...rest
}: PressableFeedbackRootProps) => {
  const listeners = useRef<Set<PressListener>>(null);

  listeners.current ??= new Set();

  const subscribe = useCallback((listener: PressListener) => {
    listeners.current?.add(listener);

    return () => {
      listeners.current?.delete(listener);
    };
  }, []);

  const handlePressStart = (event: PressEvent) => {
    const point: PressPoint = {
      pointerType: event.pointerType,
      target: event.target,
      x: event.x,
      y: event.y,
    };

    listeners.current?.forEach((listener) => listener.onPressStart?.(point));
    onPressStart?.(event);
  };

  const handlePressEnd = (event: PressEvent) => {
    listeners.current?.forEach((listener) => listener.onPressEnd?.());
    onPressEnd?.(event);
  };

  const handlePress = (event: PressEvent) => {
    listeners.current?.forEach((listener) => listener.onPress?.());
    onPress?.(event);
  };

  return (
    <PressableFeedbackContext value={{subscribe}}>
      <ButtonPrimitive
        {...rest}
        className={composeTwRenderProps(className, slots.base())}
        data-slot="pressable-feedback"
        onPress={handlePress}
        onPressEnd={handlePressEnd}
        onPressStart={handlePressStart}
      >
        {children}
      </ButtonPrimitive>
    </PressableFeedbackContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PressableFeedback.Highlight
 * -----------------------------------------------------------------------------------------------*/
export type PressableFeedbackHighlightProps = ComponentPropsWithRef<"div">;

const PressableFeedbackHighlight = ({className, ...rest}: PressableFeedbackHighlightProps) => (
  <div
    aria-hidden="true"
    {...rest}
    className={slots.highlight({className})}
    data-slot="pressable-feedback-highlight"
  />
);

/* -------------------------------------------------------------------------------------------------
 * PressableFeedback.Scale
 * -----------------------------------------------------------------------------------------------*/
export type PressableFeedbackScaleProps = ComponentPropsWithRef<"div">;

const PressableFeedbackScale = ({className, ...rest}: PressableFeedbackScaleProps) => (
  <div {...rest} className={slots.scale({className})} data-slot="pressable-feedback-scale" />
);

/* -------------------------------------------------------------------------------------------------
 * PressableFeedback.Ripple
 * -----------------------------------------------------------------------------------------------*/
export interface PressableFeedbackRippleProps extends ComponentPropsWithRef<"div"> {
  /** Lifetime in ms of a press wave: it grows and fades over this period. */
  duration?: number;
}

type RippleWave = {id: number; size: number; x: number; y: number};

const PressableFeedbackRipple = ({
  className,
  duration = 225,
  style,
  ...rest
}: PressableFeedbackRippleProps) => {
  const {subscribe} = use(PressableFeedbackContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const waveId = useRef(0);
  const [waves, setWaves] = useState<RippleWave[]>([]);

  useEffect(() => {
    if (!subscribe) return;

    const timers = new Set<ReturnType<typeof setTimeout>>();

    const unsubscribe = subscribe({
      onPressStart: (press) => {
        const rect = containerRef.current?.getBoundingClientRect();

        if (!rect) return;

        // Keyboard and virtual presses have no meaningful origin, so they start from the centre.
        const isPositioned = press.pointerType !== "keyboard" && press.pointerType !== "virtual";
        // The press is measured from the root's border box, this layer sits at its padding box,
        // so a bordered root would otherwise offset every wave by the border width.
        const host = isPositioned ? press.target.getBoundingClientRect() : undefined;
        const x = host ? press.x - (rect.left - host.left) : rect.width / 2;
        const y = host ? press.y - (rect.top - host.top) : rect.height / 2;

        // A wave covers the surface once its radius reaches the farthest corner.
        const radius = Math.max(
          Math.hypot(x, y),
          Math.hypot(rect.width - x, y),
          Math.hypot(x, rect.height - y),
          Math.hypot(rect.width - x, rect.height - y),
        );

        const id = ++waveId.current;

        setWaves((current) => [...current, {id, size: radius * 2, x, y}]);

        const timer = setTimeout(() => {
          timers.delete(timer);
          setWaves((current) => current.filter((wave) => wave.id !== id));
        }, duration);

        timers.add(timer);
      },
    });

    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
      // Timers are gone, so any wave still mounted would otherwise never be removed.
      setWaves([]);
    };
  }, [subscribe, duration]);

  return (
    <div
      aria-hidden="true"
      {...rest}
      ref={containerRef}
      className={slots.ripple({className})}
      data-slot="pressable-feedback-ripple"
      style={{"--pressable-feedback-ripple-duration": `${duration}ms`, ...style} as CSSProperties}
    >
      {waves.map((wave) => (
        <span
          key={wave.id}
          className={slots.rippleWave()}
          data-slot="pressable-feedback-ripple-wave"
          style={{
            height: wave.size,
            left: wave.x - wave.size / 2,
            top: wave.y - wave.size / 2,
            width: wave.size,
          }}
        />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PressableFeedback.Progress
 * -----------------------------------------------------------------------------------------------*/
export interface PressableFeedbackProgressProps extends ComponentPropsWithRef<"div"> {
  /**
   * Whether releasing before the run completes cancels it. Keep it on for hold-to-confirm; turn it
   * off to run the sweep off a plain click instead.
   */
  cancelOnRelease?: boolean;
  /** Run duration in ms before the action is confirmed. */
  duration?: number;
  /** Fired once the run reaches the full duration. */
  onComplete?: () => void;
  /** Fired when the overlay returns to idle. */
  onReset?: () => void;
  /** Delay in ms before returning to idle after completing. `false` keeps the completed state. */
  resetDelay?: false | number;
  /** Which edge the reveal sweeps toward. */
  sweep?: PressableFeedbackSweep;
}

const PressableFeedbackProgress = ({
  cancelOnRelease = true,
  children,
  className,
  duration = 2000,
  onComplete,
  onReset,
  resetDelay = 1500,
  style,
  sweep = "right",
  ...rest
}: PressableFeedbackProgressProps) => {
  const {subscribe} = use(PressableFeedbackContext);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const callbacks = useRef({onComplete, onReset});

  useEffect(() => {
    callbacks.current = {onComplete, onReset};
  });

  useEffect(() => {
    if (!subscribe) return;

    let runTimer: ReturnType<typeof setTimeout> | undefined;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const reset = () => {
      resetTimer = undefined;
      setIsComplete(false);
      callbacks.current.onReset?.();
    };

    const start = () => {
      clearTimeout(runTimer);
      // Pressing again during the reset delay cuts it short, but the overlay still leaves the
      // completed state, so the consumer must still hear about it.
      if (resetTimer !== undefined) {
        clearTimeout(resetTimer);
        reset();
      }
      setIsRunning(true);

      runTimer = setTimeout(() => {
        runTimer = undefined;
        setIsRunning(false);
        setIsComplete(true);
        callbacks.current.onComplete?.();

        if (resetDelay === false) return;

        resetTimer = setTimeout(reset, resetDelay);
      }, duration);
    };

    const cancel = () => {
      // A finished run is left alone so its reset delay still gets to play out.
      if (runTimer === undefined) return;

      clearTimeout(runTimer);
      runTimer = undefined;
      setIsRunning(false);
    };

    // A held run starts on press down and is cancelled by an early release. An uncancellable run
    // starts on `onPress`, which fires only once the press activates the root, so dragging away
    // never confirms an action the user backed out of.
    const unsubscribe = subscribe(
      cancelOnRelease ? {onPressEnd: cancel, onPressStart: start} : {onPress: start},
    );

    return () => {
      unsubscribe();
      clearTimeout(runTimer);
      clearTimeout(resetTimer);
    };
  }, [subscribe, cancelOnRelease, duration, resetDelay]);

  return (
    <div
      aria-hidden="true"
      {...rest}
      className={slots.progress({className})}
      data-complete={isComplete || undefined}
      data-running={isRunning || undefined}
      data-slot="pressable-feedback-progress"
      data-sweep={sweep}
      style={{"--pressable-feedback-progress-duration": `${duration}ms`, ...style} as CSSProperties}
    >
      {children}
    </div>
  );
};

PressableFeedbackRoot.displayName = "SY INC.PressableFeedback";
PressableFeedbackHighlight.displayName = "SY INC.PressableFeedback.Highlight";
PressableFeedbackScale.displayName = "SY INC.PressableFeedback.Scale";
PressableFeedbackRipple.displayName = "SY INC.PressableFeedback.Ripple";
PressableFeedbackProgress.displayName = "SY INC.PressableFeedback.Progress";

export {
  PressableFeedbackRoot,
  PressableFeedbackHighlight,
  PressableFeedbackScale,
  PressableFeedbackRipple,
  PressableFeedbackProgress,
};

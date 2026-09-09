"use client";

import type {CountdownVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {countdownVariants} from "@sy-inc/styles";
import {createContext, use, useEffect, useRef, useState} from "react";

import {composeSlotClassName} from "../../utils/compose";

const units = ["days", "hours", "minutes", "seconds"] as const;

type CountdownUnit = (typeof units)[number];
type CountdownState = "invalid" | "pending" | "running" | "complete";
type Slots = ReturnType<typeof countdownVariants>;

interface CountdownContextValue {
  labels: Partial<Record<CountdownUnit, string>> | undefined;
  slots: Slots;
  state: CountdownState;
  /** Null before the clock starts on the client, and for an invalid deadline. */
  values: Record<CountdownUnit, number> | null;
}

const CountdownContext = createContext<CountdownContextValue | null>(null);
/* Segment publishes its unit so Value and Label need no prop of their own. */
const CountdownUnitContext = createContext<CountdownUnit | null>(null);

const useCountdown = (part: string) => {
  const context = use(CountdownContext);

  if (!context) throw new Error(`Countdown.${part} must be rendered inside Countdown.Root`);

  return context;
};

const useCountdownUnit = (part: string) => {
  const unit = use(CountdownUnitContext);

  if (!unit) throw new Error(`Countdown.${part} must be rendered inside Countdown.Segment`);

  return unit;
};

/* -------------------------------------------------------------------------------------------------
 * Countdown Digit — internal. The two glyph layers are one animation, not a composition seam.
 * -----------------------------------------------------------------------------------------------*/
function CountdownDigit({slots, value}: {value: string; slots: Slots}) {
  const [digits, setDigits] = useState({current: value, previous: ""});

  if (digits.current !== value) {
    setDigits({current: value, previous: digits.current});
  }

  // Keep at most two glyphs. CSS hides the outgoing one even when animations are disabled.
  // No timer or animationend event is needed to commit the new value.
  return (
    <span className={slots.digit()} data-slot="countdown-digit">
      <span
        key={digits.current}
        className={slots.glyph()}
        data-entering={digits.previous && digits.previous !== "–" ? "true" : undefined}
        data-slot="countdown-glyph"
      >
        {digits.current}
      </span>
      {digits.previous && digits.previous !== "–" ? (
        <span
          key={`previous-${digits.current}`}
          className={slots.glyph()}
          data-exiting="true"
          data-slot="countdown-glyph"
        >
          {digits.previous}
        </span>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Countdown Root
 * -----------------------------------------------------------------------------------------------*/
interface CountdownRootProps
  extends Omit<ComponentPropsWithRef<"span">, "children">, CountdownVariants {
  /** Deadline: Date, ISO date string with timezone, or Unix timestamp in milliseconds. */
  endDate: Date | string | number;
  /** Called once when each deadline completes, including an initially expired deadline. */
  onComplete?: () => void;
  /** Optional content to show instead of zeroes after completion. */
  completionContent?: ReactNode;
  /** Visible and accessible unit labels. Defaults to English. */
  labels?: Partial<Record<CountdownUnit, string>>;
  /**
   * Compose the parts to pick units, reorder them, or add separators. Omit for
   * the accessible summary followed by all four units.
   */
  children?: ReactNode;
}

function CountdownRoot({
  animation,
  children,
  className,
  completionContent,
  endDate,
  labels,
  onComplete,
  size,
  ...props
}: CountdownRootProps) {
  const deadline = new Date(endDate).getTime();
  const valid = Number.isFinite(deadline);
  const [clock, setClock] = useState<{deadline: number; seconds: number} | null>(null);
  const completedDeadline = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const slots = countdownVariants({animation, size});

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!valid) {
      completedDeadline.current = null;

      return;
    }

    if (completedDeadline.current !== deadline) completedDeadline.current = null;

    let timeout: ReturnType<typeof setTimeout>;

    const update = () => {
      clearTimeout(timeout);
      const remaining = deadline - Date.now();
      const seconds = Math.max(0, Math.ceil(remaining / 1000));

      setClock({deadline, seconds});

      if (seconds === 0) {
        if (completedDeadline.current !== deadline) {
          completedDeadline.current = deadline;
          onCompleteRef.current?.();
        }

        return;
      }

      // Wake at the next displayed second; delayed callbacks recalculate from the clock.
      timeout = setTimeout(update, remaining % 1000 || 1000);
    };

    update();
    document.addEventListener("visibilitychange", update);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", update);
    };
  }, [deadline, valid]);

  const seconds = valid && clock?.deadline === deadline ? clock.seconds : null;
  const state: CountdownState = !valid
    ? "invalid"
    : seconds === null
      ? "pending"
      : seconds === 0
        ? "complete"
        : "running";
  const values =
    seconds === null
      ? null
      : {
          days: Math.floor(seconds / 86400),
          hours: Math.floor(seconds / 3600) % 24,
          minutes: Math.floor(seconds / 60) % 60,
          seconds: seconds % 60,
        };

  return (
    <CountdownContext value={{labels, slots, state, values}}>
      <span
        aria-label="Countdown"
        aria-live="off"
        role="timer"
        {...props}
        className={composeSlotClassName(slots.base, className)}
        data-slot="countdown"
        data-state={state}
      >
        {state === "complete" && completionContent != null
          ? completionContent
          : (children ?? (
              <>
                <CountdownAccessibleText />
                {units.map((unit) => (
                  <CountdownSegment key={unit} unit={unit} />
                ))}
              </>
            ))}
      </span>
    </CountdownContext>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Countdown AccessibleText — the only part screen readers announce.
 * -----------------------------------------------------------------------------------------------*/
interface CountdownAccessibleTextProps extends ComponentPropsWithRef<"span"> {}

function CountdownAccessibleText({children, className, ...props}: CountdownAccessibleTextProps) {
  const {labels, slots, values} = useCountdown("AccessibleText");

  return (
    <span
      {...props}
      className={composeSlotClassName(slots.accessibleText, className)}
      data-slot="countdown-accessible-text"
    >
      {children ??
        units.map((unit) => `${values?.[unit] ?? "–"} ${labels?.[unit] ?? unit}`).join(", ")}
    </span>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Countdown Segment — one unit. Hidden from screen readers; AccessibleText speaks for all of them.
 * -----------------------------------------------------------------------------------------------*/
interface CountdownSegmentProps extends ComponentPropsWithRef<"span"> {
  unit: CountdownUnit;
}

function CountdownSegment({children, className, unit, ...props}: CountdownSegmentProps) {
  const {slots} = useCountdown("Segment");

  return (
    <CountdownUnitContext value={unit}>
      <span
        aria-hidden="true"
        {...props}
        className={composeSlotClassName(slots.segment, className)}
        data-slot="countdown-segment"
        data-unit={unit}
      >
        {children ?? (
          <>
            <CountdownValue />
            <CountdownLabel />
          </>
        )}
      </span>
    </CountdownUnitContext>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Countdown Value — the rolling digits for the enclosing segment's unit.
 * -----------------------------------------------------------------------------------------------*/
interface CountdownValueProps extends ComponentPropsWithRef<"span"> {}

function CountdownValue({children, className, ...props}: CountdownValueProps) {
  const {slots, values} = useCountdown("Value");
  const unit = useCountdownUnit("Value");

  return (
    <span
      dir="ltr"
      {...props}
      className={composeSlotClassName(slots.value, className)}
      data-slot="countdown-value"
    >
      {children ??
        String(values?.[unit] ?? "––")
          .padStart(2, "0")
          .split("")
          .map((digit, position, digits) => (
            <CountdownDigit key={digits.length - position} slots={slots} value={digit} />
          ))}
    </span>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Countdown Label — the unit caption. Defaults to the Root `labels` entry, then the unit name.
 * -----------------------------------------------------------------------------------------------*/
interface CountdownLabelProps extends ComponentPropsWithRef<"span"> {}

function CountdownLabel({children, className, ...props}: CountdownLabelProps) {
  const {labels, slots} = useCountdown("Label");
  const unit = useCountdownUnit("Label");

  return (
    <span
      {...props}
      className={composeSlotClassName(slots.label, className)}
      data-slot="countdown-label"
    >
      {children ?? labels?.[unit] ?? unit}
    </span>
  );
}

export {CountdownAccessibleText, CountdownLabel, CountdownRoot, CountdownSegment, CountdownValue};

export type {
  CountdownAccessibleTextProps,
  CountdownLabelProps,
  CountdownRootProps,
  CountdownSegmentProps,
  CountdownState,
  CountdownUnit,
  CountdownValueProps,
};

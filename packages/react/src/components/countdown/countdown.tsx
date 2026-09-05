"use client";

import type {CountdownVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {countdownVariants} from "@sy-inc/styles";
import {useEffect, useRef, useState} from "react";

import {composeSlotClassName} from "../../utils/compose";

const units = ["days", "hours", "minutes", "seconds"] as const;

interface CountdownRootProps
  extends Omit<ComponentPropsWithRef<"span">, "children">, CountdownVariants {
  /** Deadline: Date, ISO date string with timezone, or Unix timestamp in milliseconds. */
  endDate: Date | string | number;
  /** Called once when each deadline completes, including an initially expired deadline. */
  onComplete?: () => void;
  /** Optional content to show instead of zeroes after completion. */
  completionContent?: ReactNode;
  /** Visible and accessible unit labels. Defaults to English. */
  labels?: Partial<Record<(typeof units)[number], string>>;
}

type Slots = ReturnType<typeof countdownVariants>;

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

function CountdownRoot({
  animation,
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
  const state = !valid
    ? "invalid"
    : seconds === null
      ? "pending"
      : seconds === 0
        ? "complete"
        : "running";
  const values =
    seconds === null
      ? null
      : [
          Math.floor(seconds / 86400),
          Math.floor(seconds / 3600) % 24,
          Math.floor(seconds / 60) % 60,
          seconds % 60,
        ];

  return (
    <span
      aria-label="Countdown"
      aria-live="off"
      role="timer"
      {...props}
      className={composeSlotClassName(slots.base, className)}
      data-slot="countdown"
      data-state={state}
    >
      {state === "complete" && completionContent != null ? (
        completionContent
      ) : (
        <>
          <span className={slots.accessibleText()} data-slot="countdown-accessible-text">
            {units
              .map((unit, index) => `${values?.[index] ?? "–"} ${labels?.[unit] ?? unit}`)
              .join(", ")}
          </span>
          {units.map((unit, index) => (
            <span
              key={unit}
              aria-hidden="true"
              className={slots.segment()}
              data-slot="countdown-segment"
              data-unit={unit}
            >
              <span className={slots.value()} data-slot="countdown-value" dir="ltr">
                {String(values?.[index] ?? "––")
                  .padStart(2, "0")
                  .split("")
                  .map((digit, position, digits) => (
                    <CountdownDigit key={digits.length - position} slots={slots} value={digit} />
                  ))}
              </span>
              <span className={slots.label()} data-slot="countdown-label">
                {labels?.[unit] ?? unit}
              </span>
            </span>
          ))}
        </>
      )}
    </span>
  );
}

export {CountdownRoot};
export type {CountdownRootProps};

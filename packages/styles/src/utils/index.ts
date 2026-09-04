/**
 * Utility CSS class strings for common component patterns
 * These are framework-agnostic and can be used with any styling approach
 */

export const focusRingClasses =
  "focus-visible:ring-focus focus-visible:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const disabledClasses =
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)]";

export const ariaDisabledClasses =
  "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--disabled-opacity)]";

/**
 * Viewport width (px) at which the layout switches from mobile to desktop.
 * Mirrors Tailwind's `md` breakpoint.
 *
 * IMPORTANT: components that branch on this in JS (Sidebar, Toast) must stay in sync with the
 * `@media (min-width: 768px)` / `@media (max-width: 767px)` rules in `components/*.css`.
 * A mismatch means the CSS and the React tree disagree about which layout is showing.
 */
export const MOBILE_BREAKPOINT = 768;

/** Media query matching viewports below {@link MOBILE_BREAKPOINT}. */
export const mobileMediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

"use client";

import {useCallback, useSyncExternalStore} from "react";

type UseMediaQueryOptions = {
  /**
   * Value returned on the server and during hydration, before the real match is known.
   * @default false
   */
  defaultValue?: boolean;
};

/**
 * Subscribes to a CSS media query.
 *
 * The server snapshot is `defaultValue`, so the server render and the hydrating client render
 * always agree; React swaps in the real match right after hydration. A client-only mount reads
 * the real match immediately, so there is no flash.
 */
export function useMediaQuery(
  query: string,
  {defaultValue = false}: UseMediaQueryOptions = {},
): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const matchMedia = window.matchMedia(query);

      matchMedia.addEventListener("change", onStoreChange);

      return () => matchMedia.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => defaultValue,
  );
}

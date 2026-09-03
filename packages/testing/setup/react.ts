import {installPointerEvent} from "@react-aria/test-utils";
import "@testing-library/jest-dom/vitest";

// RAC usePress needs PointerEvent in jsdom.
installPointerEvent();

// Common jsdom gaps used by overlays / measured layouts / OTP.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0];

    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) => ({
      addEventListener() {},
      addListener() {},
      dispatchEvent() {
        return false;
      },
      matches: false,
      media: query,
      onchange: null,
      removeEventListener() {},
      removeListener() {},
    }),
    writable: true,
  });
}

// jsdom has no object URL support; file previews create and revoke them.
if (typeof URL.createObjectURL !== "function") {
  let objectUrlCount = 0;

  URL.createObjectURL = () => `blob:jsdom/${objectUrlCount++}`;
  URL.revokeObjectURL = () => {};
}

if (typeof document.elementFromPoint !== "function") {
  document.elementFromPoint = () => null;
}

if (typeof Element.prototype.getAnimations !== "function") {
  Element.prototype.getAnimations = () => [];
}

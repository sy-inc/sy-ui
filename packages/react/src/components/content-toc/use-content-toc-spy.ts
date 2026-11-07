"use client";

import type {RefObject} from "react";

import {useEffect, useState} from "react";

export interface UseContentTocSpyOptions {
  /** Ids of the section headings, in document order. Headings need `tabIndex={-1}` to take focus. */
  ids: string[];
  /** Scroll container holding the headings. Defaults to the window. */
  root?: RefObject<HTMLElement | null>;
  /** Distance from the top of `root` where a heading becomes current, and where navigation lands it. @default 80 */
  offset?: number;
}

export interface UseContentTocSpyResult {
  activeId?: string;
  visibleIds: string[];
  onNavigate: (id: string) => void;
}

/* Sections showing less than this much are not counted as visible. */
const SLIVER = 24;

const getViewport = (root: HTMLElement | null | undefined) => {
  if (root) {
    const {bottom, top} = root.getBoundingClientRect();

    return {
      bottom,
      end: top - root.scrollTop + root.scrollHeight,
      maxScroll: root.scrollHeight - root.clientHeight,
      scroll: root.scrollTop,
      top,
    };
  }
  const {scrollHeight} = document.documentElement;

  return {
    bottom: window.innerHeight,
    end: scrollHeight - window.scrollY,
    maxScroll: scrollHeight - window.innerHeight,
    scroll: window.scrollY,
    top: 0,
  };
};

/**
 * Scroll-spy for `ContentToc`: tracks which sections are current and in view, and scrolls to a
 * section on navigation. Spread the result onto `<ContentToc>`.
 */
export const useContentTocSpy = ({
  ids,
  offset = 80,
  root,
}: UseContentTocSpyOptions): UseContentTocSpyResult => {
  // Depend on content, not the array reference, so inline `ids` don't re-subscribe every render.
  const key = ids.join("\n");
  const [activeId, setActiveId] = useState(ids[0]);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  useEffect(() => {
    const headingIds = key.split("\n");
    const container = root?.current;
    const scroller: HTMLElement | Window = container ?? window;
    const target = container ?? document.documentElement;
    let frame = 0;

    const update = () => {
      const view = getViewport(container);
      const sections = headingIds.flatMap((id) => {
        const heading = document.getElementById(id);

        return heading ? [{id, top: heading.getBoundingClientRect().top}] : [];
      });
      let active = sections[0]?.id;
      const visible: string[] = [];

      sections.forEach(({id, top}, index) => {
        // +1 absorbs sub-pixel landings after navigate().
        if (top <= view.top + offset + 1) active = id;
        // A section runs from its heading to the next one.
        const end = sections[index + 1]?.top ?? view.end;

        if (top < view.bottom - SLIVER && end > view.top + SLIVER) visible.push(id);
      });
      // Short last sections can never reach the offset line: count the scroll end as reaching it.
      if (view.maxScroll > 0 && view.scroll >= view.maxScroll - 2) active = sections.at(-1)?.id;
      setActiveId(active);
      setVisibleIds((prev) =>
        prev.length === visible.length && prev.every((id, i) => id === visible[i]) ? prev : visible,
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    // The container's children grow with the content, the container itself with the viewport.
    const observer = new ResizeObserver(schedule);

    [target, ...Array.from(target.children)].forEach((element) => observer.observe(element));
    scroller.addEventListener("scroll", schedule, {passive: true});
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener("scroll", schedule);
    };
  }, [key, offset, root]);

  const onNavigate = (id: string) => {
    const heading = document.getElementById(id);

    if (!heading) return;
    const container = root?.current;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth";
    const delta = heading.getBoundingClientRect().top - getViewport(container).top - offset;

    (container ?? window).scrollBy({behavior, top: delta});
    heading.focus({preventScroll: true});
  };

  return {activeId, onNavigate, visibleIds};
};

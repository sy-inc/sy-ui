"use client";

import type {ContentTocRailVariant, ContentTocRow} from "./content-toc.geometry";
import type {ComponentPropsWithoutRef, ReactNode, Ref} from "react";

import {mergeRefs, useLayoutEffect} from "@react-aria/utils";
import {contentTocVariants} from "@sy-inc/styles";
import React, {createContext, useContext, useEffect, useId, useRef, useState} from "react";

import {Button} from "../button";
import {IconChevronDown} from "../icons";
import {Popover} from "../popover";

import {buildTocPath} from "./content-toc.geometry";

export type {ContentTocRailVariant};

export interface ContentTocEntry {
  id: string;
  /** Heading level of the section; deeper levels indent and bend the circuit rail. */
  depth: 2 | 3 | 4;
  title: string;
}

interface ContentTocContextValue {
  activeId?: string;
  /** Index of `activeId` in `items`, or -1. */
  activeIndex: number;
  items: ContentTocEntry[];
  label: string;
  navigate: (id: string) => void;
  /** Indices of the first and last highlighted entries. */
  span?: [number, number];
  variant: ContentTocRailVariant;
}

const ContentTocContext = createContext<ContentTocContextValue | null>(null);
const ContentTocEntryContext = createContext<ContentTocEntry | null>(null);

/* Static slots: the rail variant changes the SVG path, not class names. */
const slots = contentTocVariants();

const useContentToc = (part: string) => {
  const context = useContext(ContentTocContext);

  if (!context) throw new Error(`ContentToc.${part} must be used within ContentToc.`);

  return context;
};

export interface ContentTocRootProps extends Omit<ComponentPropsWithoutRef<"nav">, "aria-label"> {
  /** Id of the section currently in view. Computing it (scroll-spy, focused field…) is up to you. */
  activeId?: string;
  items: ContentTocEntry[];
  /** Accessible name of the outline; also the floating trigger's visible label. */
  label: string;
  /** Called with the chosen entry's id. The floating panel closes first. */
  onNavigate?: (id: string) => void;
  /** Inline outline, or a trigger that opens the outline in a popover. @default "sidebar" */
  presentation?: "sidebar" | "floating";
  /** Straight rail, or one that bends with the heading depth. @default "circuit" */
  variant?: ContentTocRailVariant;
  /**
   * Ids of every section currently in view. The rail highlights from the first to the last of
   * them; `activeId` still decides `aria-current`. Falls back to `activeId` when empty.
   */
  visibleIds?: string[];
}

/* First..last index of `visibleIds` in `items`; unknown ids are ignored, gaps are filled. */
const getSpan = (
  items: ContentTocEntry[],
  activeIndex: number,
  visibleIds?: string[],
): [number, number] | undefined => {
  const indices = (visibleIds ?? [])
    .map((id) => items.findIndex((item) => item.id === id))
    .filter((index) => index !== -1);

  if (indices.length > 0) return [Math.min(...indices), Math.max(...indices)];

  return activeIndex === -1 ? undefined : [activeIndex, activeIndex];
};

const ContentTocRoot = React.forwardRef<HTMLElement, ContentTocRootProps>(
  (
    {
      activeId,
      children,
      className,
      items,
      label,
      onNavigate,
      presentation = "sidebar",
      variant = "circuit",
      visibleIds,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setOpen] = useState(false);

    if (items.length === 0) return null;

    const activeIndex = items.findIndex((item) => item.id === activeId);
    const context: ContentTocContextValue = {
      activeId,
      activeIndex,
      items,
      label,
      navigate: (id) => {
        setOpen(false);
        onNavigate?.(id);
      },
      span: getSpan(items, activeIndex, visibleIds),
      variant,
    };
    const rootProps = {
      ...props,
      className: slots.base({className}),
      "data-presentation": presentation,
      "data-slot": "content-toc",
      "data-variant": variant,
    };

    if (presentation === "sidebar") {
      return (
        <ContentTocContext value={context}>
          <nav {...rootProps} ref={ref} aria-label={label}>
            {children}
          </nav>
        </ContentTocContext>
      );
    }

    return (
      <ContentTocContext value={context}>
        <div {...rootProps} ref={ref as Ref<HTMLDivElement>}>
          <Popover isOpen={isOpen} onOpenChange={setOpen}>
            <Button className={slots.trigger()} data-slot="content-toc-trigger" variant="secondary">
              <span aria-hidden className={slots.trail()}>
                {items.map((item) => (
                  <span
                    key={item.id}
                    className={slots.trailBar()}
                    data-active={item.id === activeId}
                    data-depth={item.depth}
                  />
                ))}
              </span>
              <span className={slots.summary()}>
                <span className={slots.summaryLabel()}>
                  {label}
                  <span className={slots.summaryCount()}>
                    {activeIndex + 1} / {items.length}
                  </span>
                </span>
                <span className={slots.summaryTitle()}>{items[activeIndex]?.title}</span>
              </span>
              <IconChevronDown className={slots.indicator()} data-open={isOpen} />
            </Button>
            <Popover.Content isNonModal className={slots.popover()} offset={12} placement="top end">
              <Popover.Dialog aria-label={label} className={slots.dialog()}>
                <nav aria-label={label} data-slot="content-toc-nav">
                  {children}
                </nav>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        </div>
      </ContentTocContext>
    );
  },
);

export interface ContentTocTitleProps extends ComponentPropsWithoutRef<"div"> {}

const ContentTocTitle = React.forwardRef<HTMLDivElement, ContentTocTitleProps>(
  ({children, className, ...props}, ref) => {
    const {label} = useContentToc("Title");

    return (
      <div {...props} ref={ref} className={slots.title({className})} data-slot="content-toc-title">
        {children ?? label}
      </div>
    );
  },
);

export interface ContentTocItemProps extends Omit<ComponentPropsWithoutRef<"a">, "href"> {}

const ContentTocItem = React.forwardRef<HTMLAnchorElement, ContentTocItemProps>(
  ({children, className, onClick, ...props}, ref) => {
    const {activeId, items, navigate, span} = useContentToc("Item");
    const item = useContext(ContentTocEntryContext);

    if (!item) throw new Error("ContentToc.Item must be rendered by ContentToc.List.");

    const isActive = item.id === activeId;
    const index = items.indexOf(item);
    const isVisible = !!span && index >= span[0] && index <= span[1];

    return (
      <a
        {...props}
        ref={ref}
        aria-current={isActive ? "location" : undefined}
        className={slots.item({className})}
        data-active={isActive}
        data-depth={item.depth}
        data-slot="content-toc-item"
        data-visible={isVisible}
        href={`#${item.id}`}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          navigate(item.id);
        }}
      >
        {children ?? item.title}
      </a>
    );
  },
);

export interface ContentTocListProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Renders one ContentToc.Item per entry, e.g. to add a status marker. Defaults to the title. */
  children?: (item: ContentTocEntry) => ReactNode;
}

const renderDefaultItem = () => <ContentTocItem />;

const ContentTocList = React.forwardRef<HTMLDivElement, ContentTocListProps>(
  ({children = renderDefaultItem, className, ...props}, ref) => {
    const {activeIndex, items, span, variant} = useContentToc("List");
    const [rows, setRows] = useState<ContentTocRow[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const clipId = useId();
    const first = span && rows[span[0]];
    const last = span && rows[span[1]];
    const lastRow = rows.at(-1);
    const height = lastRow ? lastRow.top + lastRow.height : 0;
    const path = buildTocPath(rows, variant);
    // Re-measure on structural change only, so inline `items` arrays don't relayout on every render.
    const structureKey = items.map((item) => `${item.id}:${item.depth}`).join();

    useLayoutEffect(() => {
      const track = trackRef.current;

      if (!track) return;

      const measure = () => {
        const links = getLinks(track);
        // offsetTop ignores the popover's opening scale animation.
        const top = links[0]?.offsetTop ?? 0;

        setRows(
          links.map((link) => ({
            depth: Number(link.dataset["depth"]),
            height: link.offsetHeight,
            top: link.offsetTop - top,
          })),
        );
      };
      const observer = new ResizeObserver(measure);

      observer.observe(track);
      measure();

      return () => observer.disconnect();
    }, [structureKey]);

    // Keep the active entry visible inside a capped list.
    useEffect(() => {
      const container = scrollRef.current;
      const link = trackRef.current && getLinks(trackRef.current)[activeIndex];

      if (!container || !link) return;
      const bounds = container.getBoundingClientRect();
      const rect = link.getBoundingClientRect();

      if (rect.top < bounds.top || rect.bottom > bounds.bottom) {
        container.scrollTo({
          top:
            container.scrollTop +
            rect.top -
            bounds.top -
            container.clientHeight / 2 +
            rect.height / 2,
        });
      }
    }, [activeIndex, rows]);

    return (
      <div
        {...props}
        ref={mergeRefs(scrollRef, ref)}
        className={slots.list({className})}
        data-slot="content-toc-list"
      >
        <div ref={trackRef} className={slots.track()}>
          <svg aria-hidden className={slots.rail()} height={height} width="48">
            <defs>
              <clipPath id={clipId}>
                <rect
                  className={slots.railClip()}
                  height={first && last ? last.top + last.height - first.top : 0}
                  style={{transform: `translateY(${first?.top ?? 0}px)`}}
                  width="48"
                />
              </clipPath>
            </defs>
            <path
              className={slots.railBase()}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path
              className={slots.railActive()}
              clipPath={`url(#${clipId})`}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          {items.map((item) => (
            <ContentTocEntryContext key={item.id} value={item}>
              {children(item)}
            </ContentTocEntryContext>
          ))}
        </div>
      </div>
    );
  },
);

const getLinks = (track: HTMLElement) =>
  Array.from(track.querySelectorAll<HTMLAnchorElement>('[data-slot="content-toc-item"]'));

ContentTocRoot.displayName = "SY INC.ContentToc";
ContentTocTitle.displayName = "SY INC.ContentToc.Title";
ContentTocList.displayName = "SY INC.ContentToc.List";
ContentTocItem.displayName = "SY INC.ContentToc.Item";

export {ContentTocRoot, ContentTocTitle, ContentTocList, ContentTocItem};

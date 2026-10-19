"use client";

import type {TocRow} from "./content-toc.geometry";

import {useEffect, useId, useLayoutEffect, useRef, useState} from "react";

import {Button} from "../../components/button";
import {IconChevronDown} from "../../components/icons";
import {Popover} from "../../components/popover";

import {buildTocPath} from "./content-toc.geometry";
import {contentTocStoryVariants} from "./content-toc.styles";

export interface ContentTocItem {
  depth: 2 | 3 | 4;
  id: string;
  title: string;
}

export interface ContentTocProps {
  activeId: string;
  highlightVariant?: "straight" | "circuit";
  items: ContentTocItem[];
  onNavigate: (id: string) => void;
  presentation?: "sidebar" | "floating";
}

const styles = contentTocStoryVariants();

function TocNavigation({
  activeId,
  highlightVariant = "circuit",
  items,
  onNavigate,
  presentation,
}: ContentTocProps) {
  const [rows, setRows] = useState<TocRow[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const clipId = useId();
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const row = rows[activeIndex];
  const lastRow = rows.at(-1);
  const height = lastRow ? lastRow.top + lastRow.height : 0;
  const path = buildTocPath(rows, highlightVariant);

  useLayoutEffect(() => {
    const list = listRef.current;

    if (!list) return;

    const measure = () => {
      const links = Array.from(list.querySelectorAll<HTMLAnchorElement>("a"));
      // Layout measurements exclude the popover's opening scale animation.
      const top = links[0]?.offsetTop ?? 0;

      setRows(
        links.map((link, index) => ({
          depth: items[index]!.depth,
          height: link.offsetHeight,
          top: link.offsetTop - top,
        })),
      );
    };
    const observer = new ResizeObserver(measure);

    observer.observe(list);
    measure();

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const container = scrollRef.current;
    const link = listRef.current?.querySelectorAll("a")[activeIndex];

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
    <nav
      aria-label="本页目录"
      data-highlight-variant={highlightVariant}
      data-presentation={presentation}
    >
      <div className={styles.navHeader()}>
        <h2 className={styles.navTitle()}>本页目录</h2>
        <span className={styles.navBadge()}>{highlightVariant}</span>
      </div>
      <div
        ref={scrollRef}
        className={styles.navScroll({
          className: presentation === "floating" ? styles.floatingScroll() : undefined,
        })}
      >
        <div ref={listRef} className={styles.navList()}>
          <svg aria-hidden className={styles.rail()} height={height} width="48">
            <defs>
              <clipPath id={clipId}>
                <rect
                  className={styles.clip()}
                  height={row?.height ?? 0}
                  style={{transform: `translateY(${row?.top ?? 0}px)`}}
                  width="48"
                />
              </clipPath>
            </defs>
            <path
              className={styles.railBase()}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path
              className={styles.railActive()}
              clipPath={`url(#${clipId})`}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          {items.map((item) => (
            <a
              key={item.id}
              aria-current={activeId === item.id ? "location" : undefined}
              className={contentTocStoryVariants({depth: item.depth}).link()}
              data-active={activeId === item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.id);
              }}
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function ContentToc({presentation = "sidebar", ...props}: ContentTocProps) {
  const [isOpen, setOpen] = useState(false);
  const activeIndex = props.items.findIndex((item) => item.id === props.activeId);
  const activeItem = props.items[activeIndex];

  if (props.items.length === 0) return null;

  if (presentation === "sidebar") {
    return (
      <aside className={styles.aside()}>
        <TocNavigation {...props} presentation="sidebar" />
        <p className={styles.navFooter()}>
          沿着内容的脉络，
          <br />
          找到此刻的位置。
        </p>
      </aside>
    );
  }

  return (
    <div className={styles.floating()}>
      <Popover isOpen={isOpen} onOpenChange={setOpen}>
        <Button aria-label="展开本页目录" className={styles.floatingTrigger()} variant="secondary">
          <span aria-hidden className={styles.miniTrail()}>
            {props.items.map((item) => (
              <span
                key={item.id}
                className={contentTocStoryVariants({depth: item.depth}).miniBar()}
                data-active={item.id === props.activeId}
              />
            ))}
          </span>
          <span className={styles.triggerText()}>
            <span className={styles.triggerLabel()}>
              本页目录{" "}
              <span className={styles.triggerCount()}>
                {Math.max(0, activeIndex + 1)} / {props.items.length}
              </span>
            </span>
            <span className={styles.triggerTitle()}>{activeItem?.title ?? "浏览文章章节"}</span>
          </span>
          <IconChevronDown className={styles.triggerChevron()} data-open={isOpen} />
        </Button>
        <Popover.Content
          isNonModal
          className={styles.floatingPanel()}
          offset={12}
          placement="top end"
        >
          <Popover.Dialog aria-label="本页目录" className={styles.floatingDialog()}>
            <TocNavigation
              {...props}
              presentation="floating"
              onNavigate={(id) => {
                setOpen(false);
                props.onNavigate(id);
              }}
            />
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}

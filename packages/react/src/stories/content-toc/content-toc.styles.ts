import {tv} from "tailwind-variants";

export const contentTocStoryVariants = tv({
  slots: {
    canvas: "min-h-screen bg-background p-4 text-foreground sm:p-8",
    frame:
      "relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface shadow-sm",
    toolbar: "flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4",
    identity: "flex items-center gap-3",
    monogram:
      "flex size-9 items-center justify-center rounded-lg bg-foreground text-xs font-semibold text-background",
    toolbarTitle: "text-sm font-semibold",
    eyebrow: "text-xs tracking-wide text-muted",
    controls: "flex flex-wrap items-center gap-3",
    controlLabel: "mb-1.5 block text-[10px] font-medium tracking-wider text-muted",
    reader:
      "h-[min(760px,82vh)] min-h-96 overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-inset",
    layout: "grid items-start gap-10 p-6 md:gap-12 md:p-10 lg:gap-20 lg:px-14",
    article: "min-w-0",
    articleHeader: "space-y-5 border-b border-border pb-9",
    breadcrumb: "text-xs font-medium tracking-widest text-accent uppercase",
    title: "text-3xl leading-tight font-semibold tracking-tight sm:text-4xl",
    lead: "max-w-xl text-base leading-8 text-muted",
    meta: "flex items-center gap-3 text-xs text-muted",
    dot: "size-1 rounded-full bg-muted/50",
    section: "space-y-5 border-b border-border py-9 last:border-0 last:pb-28",
    heading:
      "scroll-mt-10 text-xl leading-relaxed font-semibold tracking-tight outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-focus",
    paragraph: "text-sm leading-8 text-muted",
    callout:
      "rounded-xl border border-accent/15 bg-accent/5 px-5 py-4 text-sm leading-7 text-foreground",
    calloutLabel: "mb-1 block text-xs font-semibold tracking-wide text-accent",
    example:
      "rounded-xl border border-border bg-background p-5 font-mono text-xs leading-7 text-muted",
    aside:
      "sticky top-6 order-first min-w-0 self-start rounded-xl bg-surface/95 backdrop-blur-sm max-md:static md:top-10 md:order-last",
    navHeader: "mb-5 flex items-center justify-between gap-3",
    navTitle: "text-xs font-semibold tracking-wider text-foreground",
    navBadge: "rounded-md bg-default px-2 py-1 font-mono text-[10px] text-muted",
    navScroll: "max-h-44 overflow-y-auto overscroll-contain md:max-h-[calc(min(760px,82vh)-220px)]",
    navList: "relative isolate",
    rail: "pointer-events-none absolute top-0 left-0 overflow-visible",
    railBase: "text-border",
    railActive: "text-accent",
    clip: "transition-[transform,height] duration-200 ease-out motion-reduce:transition-none",
    link: "relative block min-h-9 rounded-md py-2 pr-2 text-[13px] leading-5 break-words text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[active=true]:font-medium data-[active=true]:text-accent motion-reduce:transition-none",
    navFooter: "mt-6 border-t border-border pt-4 text-xs leading-6 text-muted max-md:hidden",
    floating: "absolute right-4 bottom-16 z-20 max-w-[calc(100%-32px)] sm:right-7",
    floatingTrigger:
      "h-auto min-h-16 w-64 max-w-full justify-start gap-4 rounded-2xl border border-border bg-surface px-4 py-3 text-left shadow-lg hover:bg-surface-secondary",
    miniTrail: "flex w-5 shrink-0 flex-col items-start gap-0.5",
    miniBar:
      "block h-0.5 rounded-full bg-muted/25 transition-colors data-[active=true]:bg-accent motion-reduce:transition-none",
    triggerText: "flex min-w-0 flex-1 flex-col gap-1",
    triggerLabel: "flex items-center justify-between gap-3 text-[11px] text-muted",
    triggerCount: "font-mono text-[10px] tabular-nums",
    triggerTitle: "truncate text-xs font-medium text-foreground",
    triggerChevron:
      "size-3.5 shrink-0 text-muted transition-transform data-[open=true]:rotate-180 motion-reduce:transition-none",
    floatingPanel:
      "w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-border bg-surface shadow-xl",
    floatingDialog: "p-5",
    floatingScroll: "max-h-[min(420px,60vh)] md:max-h-[min(420px,60vh)]",
    footer:
      "flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-3 text-xs text-muted",
    status: "flex items-center gap-2",
    statusDot: "size-1.5 rounded-full bg-accent",
  },
  variants: {
    depth: {
      2: {link: "pl-7", miniBar: "w-5"},
      3: {link: "pl-10", heading: "text-lg", miniBar: "ml-1 w-4"},
      4: {link: "pl-13", heading: "text-base", miniBar: "ml-2 w-3"},
    },
    presentation: {
      sidebar: {layout: "md:grid-cols-[minmax(0,1fr)_228px]"},
      floating: {layout: "mx-auto max-w-3xl grid-cols-1"},
    },
  },
  defaultVariants: {presentation: "sidebar"},
});

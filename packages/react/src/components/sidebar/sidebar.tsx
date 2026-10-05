"use client";

import type {UseOverlayStateReturn} from "../../hooks";
import type {DOMRenderProps} from "../../utils/dom";
import type {TooltipContentProps} from "../tooltip";
import type {SidebarVariants} from "@sy-inc/styles";
import type {CSSProperties, ReactNode} from "react";
import type {ButtonProps, LinkProps} from "react-aria-components";

import {useEffectEvent} from "@react-aria/utils";
import {useControlledState} from "@react-stately/utils";
import {mobileMediaQuery, sidebarCollapseMediaQueries, sidebarVariants} from "@sy-inc/styles";
import React from "react";

import {useMediaQuery, useOverlayState} from "../../hooks";
import {composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {Button} from "../button";
import {Drawer} from "../drawer";
import {Input} from "../input";
import {Link} from "../link";
import {Separator} from "../separator";
import {Skeleton} from "../skeleton";
import {Tooltip} from "../tooltip";

const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

/**
 * Only `base` carries variant classes, so every other slot resolves to a constant string.
 * Resolving them once at module scope keeps the parts out of the context subscription — a toggle
 * no longer re-renders every menu item just to hand it back the same class name.
 */
const slots = sidebarVariants();

type SidebarSlot = keyof typeof slots;

const slotClass = (slot: SidebarSlot, className?: string) =>
  (slots[slot] as (props?: {className?: string}) => string)({className});

type SidebarState = "collapsed" | "expanded";
/** `"auto"`: the visitor has not chosen yet, so `collapseBreakpoint` decides (in CSS). */
type SidebarOpenState = boolean | "auto";
type SidebarSide = NonNullable<SidebarVariants["side"]>;
type SidebarVariant = NonNullable<SidebarVariants["variant"]>;
type SidebarCollapsible = NonNullable<SidebarVariants["collapsible"]>;

interface SidebarContextValue {
  isMobile: boolean;
  isOpen: boolean;
  isOpenMobile: boolean;
  panelId: string;
  setOpen: (isOpen: boolean) => void;
  setOpenMobile: (isOpen: boolean) => void;
  state: SidebarState;
  toggle: () => void;
}

interface SidebarInternalContextValue extends SidebarContextValue {
  collapsible: SidebarCollapsible;
  mobileState: UseOverlayStateReturn;
  mobileWidth: string;
  side: SidebarSide;
}

const SidebarContext = React.createContext<SidebarInternalContextValue | null>(null);

const useSidebarContext = () => {
  const context = React.use(SidebarContext);

  if (!context) throw new Error("Sidebar parts must be used within Sidebar.Root.");

  return context;
};

/** Public state and setters for custom sidebar children. */
const useSidebar = (): SidebarContextValue => useSidebarContext();

type SidebarVariables = CSSProperties & {
  "--sidebar-width"?: string;
  "--sidebar-width-collapsed"?: string;
  "--sidebar-width-mobile"?: string;
};

const toCSSLength = (value: number | string) => (typeof value === "number" ? `${value}px` : value);

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT");

/* -------------------------------------------------------------------------------------------------
 * Sidebar Root
 * -----------------------------------------------------------------------------------------------*/
interface SidebarRootProps
  extends Omit<React.ComponentPropsWithRef<"div">, "onChange">, Omit<SidebarVariants, "state"> {
  /** Width of the expanded desktop panel. @default "16rem" */
  width?: number | string;
  /** Width of the icon-collapsed desktop panel. @default "3rem" */
  collapsedWidth?: number | string;
  /** Width of the mobile drawer. @default "18rem" */
  mobileWidth?: number | string;
  /**
   * Initial desktop state when uncontrolled. `"auto"` means the visitor has not chosen yet: the
   * sidebar is expanded, or collapsed below `collapseBreakpoint`, until the first toggle.
   * @default "auto"
   */
  defaultOpen?: SidebarOpenState;
  /** Controlled desktop state. */
  isOpen?: SidebarOpenState;
  /** Called when the visitor toggles the desktop state. Never called by `collapseBreakpoint`. */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Key that toggles the sidebar when pressed with `⌘`/`Ctrl`. Pass `false` to disable the
   * shortcut — e.g. when the app embeds a rich text editor that owns `⌘B`.
   * @default "b"
   */
  toggleShortcut?: string | false;
}

const SidebarRoot = ({
  children,
  className,
  collapseBreakpoint,
  collapsedWidth = "3rem",
  collapsible = "offcanvas",
  defaultOpen = "auto",
  isOpen: controlledIsOpen,
  mobileWidth = "18rem",
  onOpenChange,
  side = "left",
  style,
  toggleShortcut = SIDEBAR_KEYBOARD_SHORTCUT,
  variant = "sidebar",
  width = "16rem",
  ...props
}: SidebarRootProps) => {
  // The setter only takes booleans: `"auto"` can be passed in, never set by a toggle.
  const [openState, setOpenState] = useControlledState<SidebarOpenState, boolean>(
    controlledIsOpen,
    defaultOpen,
    onOpenChange,
  );
  const mobileState = useOverlayState();
  const isMobile = useMediaQuery(mobileMediaQuery);
  const autoCollapseBreakpoint =
    openState === "auto" && collapsible !== "none" ? collapseBreakpoint : undefined;
  // Read-only: the `sidebar-collapsed` CSS variant paints the auto state (correct before
  // hydration); this only reports it to aria-expanded, tooltips, `useSidebar` and `toggle`.
  // `not all` never matches, so the hook stays mounted while the feature is off.
  const isBelowCollapseBreakpoint = useMediaQuery(
    autoCollapseBreakpoint ? sidebarCollapseMediaQueries[autoCollapseBreakpoint] : "not all",
  );
  const isOpenDesktop = openState === "auto" ? !isBelowCollapseBreakpoint : openState;
  const panelId = React.useId();
  const mobileWidthValue = toCSSLength(mobileWidth);
  const state: SidebarState = isOpenDesktop ? "expanded" : "collapsed";
  const {
    close: closeMobile,
    isOpen: isOpenMobile,
    setOpen: setOpenMobile,
    toggle: toggleMobile,
  } = mobileState;
  const setOpen = React.useCallback(
    (nextIsOpen: boolean) => {
      setOpenState(nextIsOpen);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${nextIsOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenState],
  );
  const toggle = React.useCallback(() => {
    if (isMobile) toggleMobile();
    else setOpen(!isOpenDesktop);
  }, [isMobile, isOpenDesktop, setOpen, toggleMobile]);
  // Always calls the latest `toggle`, so the shortcut listener never has to re-subscribe.
  const toggleFromShortcut = useEffectEvent(toggle);
  // Not memoized: `mobileState` is a fresh object every render, and every consumer is a
  // descendant that re-renders with the Root anyway.
  const context: SidebarInternalContextValue = {
    collapsible,
    isMobile,
    isOpen: isOpenDesktop,
    isOpenMobile,
    mobileState,
    mobileWidth: mobileWidthValue,
    panelId,
    setOpen,
    setOpenMobile,
    side,
    state,
    toggle,
  };
  const rootClassName = sidebarVariants({
    collapseBreakpoint: autoCollapseBreakpoint,
    collapsible,
    side,
    state,
    variant,
  }).base({className});
  const rootStyle: SidebarVariables = {
    "--sidebar-width": toCSSLength(width),
    "--sidebar-width-collapsed": toCSSLength(collapsedWidth),
    "--sidebar-width-mobile": mobileWidthValue,
    ...style,
  };

  React.useEffect(() => {
    if (!isMobile) closeMobile();
  }, [closeMobile, isMobile]);

  React.useEffect(() => {
    if (toggleShortcut === false) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== toggleShortcut) return;
      if (!event.metaKey && !event.ctrlKey) return;
      // Never steal the shortcut from a field the user is typing in (⌘B is bold in most editors).
      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      toggleFromShortcut();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleShortcut]);

  return (
    <SidebarContext value={context}>
      <div
        {...props}
        className={rootClassName}
        data-collapsible={collapsible}
        data-side={side}
        data-slot="sidebar"
        data-state={state}
        data-variant={variant}
        style={rootStyle}
      >
        {children}
      </div>
    </SidebarContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Sidebar Panel
 * -----------------------------------------------------------------------------------------------*/
interface SidebarPanelProps extends Omit<React.ComponentPropsWithRef<"aside">, "children"> {
  children: ReactNode;
  /** Accessible description for the mobile dialog. */
  description?: ReactNode;
}

const SidebarPanel = ({
  "aria-label": ariaLabel = "Sidebar",
  children,
  className,
  description = "Displays the mobile sidebar.",
  ...props
}: SidebarPanelProps) => {
  const {collapsible, isMobile, mobileState, mobileWidth, panelId, side} = useSidebarContext();
  const descriptionId = `${panelId}-description`;

  if (isMobile && collapsible !== "none") {
    return (
      <Drawer.Root state={mobileState}>
        <Drawer.Backdrop className={slotClass("mobileBackdrop")}>
          <Drawer.Content placement={side}>
            <Drawer.Dialog
              {...(props as any)}
              aria-describedby={description ? descriptionId : undefined}
              aria-label={ariaLabel}
              className={slotClass("mobileDialog", className)}
              data-mobile="true"
              data-slot="sidebar-panel"
              id={panelId}
              style={
                {
                  ...props.style,
                  // The drawer is portalled out of the root, so it cannot inherit the variable.
                  "--sidebar-width-mobile": mobileWidth,
                } as SidebarVariables
              }
            >
              {description ? (
                <span
                  className={slotClass("mobileDescription")}
                  data-slot="sidebar-description"
                  id={descriptionId}
                >
                  {description}
                </span>
              ) : null}
              {children}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer.Root>
    );
  }

  const panel = (
    <aside
      {...props}
      aria-label={ariaLabel}
      className={slotClass("panel", className)}
      data-side={side}
      data-slot="sidebar-panel"
      id={panelId}
    >
      {children}
    </aside>
  );

  if (collapsible === "none") return panel;

  return (
    <>
      <div aria-hidden="true" className={slotClass("gap")} data-slot="sidebar-gap" />
      {panel}
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Structural parts
 * -----------------------------------------------------------------------------------------------*/
interface SidebarPartProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const createPart = <E extends keyof React.JSX.IntrinsicElements>(
  element: E,
  slot: SidebarSlot,
  dataSlot: string,
  displayName: string,
) => {
  const Part = ({
    className,
    ...props
  }: SidebarPartProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof SidebarPartProps<E>>) => {
    const Element = dom[element] as typeof dom.div;

    return (
      <Element {...(props as any)} className={slotClass(slot, className)} data-slot={dataSlot} />
    );
  };

  Part.displayName = displayName;

  return Part;
};

const SidebarHeader = createPart("header", "header", "sidebar-header", "SY INC.Sidebar.Header");
const SidebarContent = createPart("div", "content", "sidebar-content", "SY INC.Sidebar.Content");
const SidebarFooter = createPart("footer", "footer", "sidebar-footer", "SY INC.Sidebar.Footer");
const SidebarGroup = createPart("section", "group", "sidebar-group", "SY INC.Sidebar.Group");
const SidebarInset = createPart("main", "inset", "sidebar-inset", "SY INC.Sidebar.Inset");
const SidebarGroupLabel = createPart(
  "div",
  "groupLabel",
  "sidebar-group-label",
  "SY INC.Sidebar.GroupLabel",
);
const SidebarGroupContent = createPart(
  "div",
  "groupContent",
  "sidebar-group-content",
  "SY INC.Sidebar.GroupContent",
);
const SidebarMenu = createPart("ul", "menu", "sidebar-menu", "SY INC.Sidebar.Menu");
const SidebarMenuBadge = createPart(
  "div",
  "menuBadge",
  "sidebar-menu-badge",
  "SY INC.Sidebar.MenuBadge",
);
const SidebarMenuSub = createPart("ul", "menuSub", "sidebar-menu-sub", "SY INC.Sidebar.MenuSub");
const SidebarMenuSubItem = createPart(
  "li",
  "menuSubItem",
  "sidebar-menu-sub-item",
  "SY INC.Sidebar.MenuSubItem",
);

interface SidebarInputProps extends React.ComponentPropsWithRef<typeof Input> {}

const SidebarInput = ({className, ...props}: SidebarInputProps) => (
  <Input
    {...props}
    className={composeTwRenderProps(className, slotClass("input"))}
    data-slot="sidebar-input"
  />
);

interface SidebarSeparatorProps extends React.ComponentPropsWithRef<typeof Separator> {}

const SidebarSeparator = ({className, ...props}: SidebarSeparatorProps) => (
  <Separator
    {...props}
    className={slotClass("separator", className)}
    data-slot="sidebar-separator"
  />
);

type SidebarElementProps<E extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithRef<E>;

interface SidebarGroupActionProps extends ButtonProps {}

const SidebarGroupAction = ({className, ...props}: SidebarGroupActionProps) => (
  <Button.Root
    {...props}
    className={composeTwRenderProps(className, slotClass("groupAction"))}
    data-slot="sidebar-group-action"
    variant="ghost"
  />
);

export interface SidebarMenuItemProps extends SidebarElementProps<"li"> {
  /** Hides this item while the sidebar is collapsed. */
  hideCollapsed?: boolean;
}

const SidebarMenuItem = ({className, hideCollapsed, ...props}: SidebarMenuItemProps) => (
  <li
    {...props}
    className={slotClass("menuItem", className)}
    data-hide-collapsed={hideCollapsed || undefined}
    data-slot="sidebar-menu-item"
  />
);

SidebarMenuItem.displayName = "SY INC.Sidebar.MenuItem";

interface SidebarMenuActionProps extends ButtonProps {
  showOnHover?: boolean;
}

const SidebarMenuAction = ({className, showOnHover = false, ...props}: SidebarMenuActionProps) => (
  <Button.Root
    {...props}
    className={composeTwRenderProps(className, slotClass("menuAction"))}
    data-show-on-hover={showOnHover || undefined}
    data-slot="sidebar-menu-action"
    variant="ghost"
  />
);

type SidebarButtonProps = (LinkProps & {href: string}) | (ButtonProps & {href?: never});

/**
 * Renders a Link when `href` is present and a ghost Button otherwise. The public prop types on
 * MenuButton / MenuSubButton keep the two shapes apart for consumers; internally the branch is
 * one component so a new data attribute only has to be added once.
 */
type SidebarControlProps = Omit<ButtonProps, "className"> & {
  "aria-current"?: React.AriaAttributes["aria-current"];
  className?: ButtonProps["className"] | LinkProps["className"];
  href?: string;
  slotClassName: string;
};

const SidebarControl = ({className, href, slotClassName, ...props}: SidebarControlProps) => {
  const Control = (href !== undefined ? Link.Root : Button.Root) as typeof Button.Root;
  const controlProps = href !== undefined ? {href} : {variant: "ghost" as const};

  return (
    <Control
      {...(props as ButtonProps)}
      {...(controlProps as object)}
      className={composeTwRenderProps(className as ButtonProps["className"], slotClassName)}
    />
  );
};

type SidebarMenuButtonProps = SidebarButtonProps & {
  isActive?: boolean;
  size?: "default" | "lg" | "sm";
  tooltip?: string | TooltipContentProps;
  variant?: "default" | "outline";
};

/**
 * Split out so that only tooltip-bearing buttons subscribe to the sidebar context — plain menu
 * buttons then stay inert when the sidebar opens or closes.
 */
const SidebarMenuButtonTooltip = ({
  children,
  tooltip,
}: {
  children: ReactNode;
  tooltip: string | TooltipContentProps;
}) => {
  const {isMobile, side, state} = useSidebarContext();
  const tooltipProps = typeof tooltip === "string" ? {children: tooltip} : tooltip;

  return (
    <Tooltip isDisabled={isMobile || state !== "collapsed"}>
      {children}
      <Tooltip.Content placement={side === "left" ? "right" : "left"} {...tooltipProps} />
    </Tooltip>
  );
};

const SidebarMenuButton = ({
  className,
  href,
  isActive = false,
  size = "default",
  tooltip,
  variant = "default",
  ...props
}: SidebarMenuButtonProps) => {
  const ariaLabel = props["aria-label"] ?? (typeof tooltip === "string" ? tooltip : undefined);
  const control = (
    <SidebarControl
      {...(props as any)}
      aria-current={href !== undefined && isActive ? "page" : undefined}
      aria-label={ariaLabel}
      className={className}
      data-active={isActive || undefined}
      data-size={size}
      data-slot="sidebar-menu-button"
      data-variant={variant}
      href={href as string}
      slotClassName={slotClass("menuButton")}
    />
  );

  if (!tooltip) return control;

  return <SidebarMenuButtonTooltip tooltip={tooltip}>{control}</SidebarMenuButtonTooltip>;
};

type SidebarMenuSubButtonProps = SidebarButtonProps & {
  isActive?: boolean;
  size?: "md" | "sm";
};

const SidebarMenuSubButton = ({
  className,
  href,
  isActive = false,
  size = "md",
  ...props
}: SidebarMenuSubButtonProps) => (
  <SidebarControl
    {...(props as any)}
    aria-current={href !== undefined && isActive ? "page" : undefined}
    className={className}
    data-active={isActive || undefined}
    data-size={size}
    data-slot="sidebar-menu-sub-button"
    href={href as string}
    slotClassName={slotClass("menuSubButton")}
  />
);

interface SidebarMenuSkeletonProps extends React.ComponentPropsWithRef<"div"> {
  showIcon?: boolean;
}

const SidebarMenuSkeleton = ({className, showIcon = false, ...props}: SidebarMenuSkeletonProps) => (
  <div
    aria-hidden="true"
    {...props}
    className={slotClass("menuSkeleton", className)}
    data-slot="sidebar-menu-skeleton"
  >
    {!!showIcon && (
      <Skeleton className={slotClass("menuSkeletonIcon")} data-slot="sidebar-menu-skeleton-icon" />
    )}
    <Skeleton className={slotClass("menuSkeletonText")} data-slot="sidebar-menu-skeleton-text" />
  </div>
);

/* -------------------------------------------------------------------------------------------------
 * Sidebar Trigger
 * -----------------------------------------------------------------------------------------------*/
interface SidebarTriggerProps extends ButtonProps {}

const SidebarTrigger = ({
  "aria-label": ariaLabel = "Toggle sidebar",
  children,
  className,
  onPress,
  ...props
}: SidebarTriggerProps) => {
  const {isMobile, isOpen, isOpenMobile, panelId, toggle} = useSidebarContext();

  return (
    <Button.Root
      {...props}
      aria-controls={panelId}
      aria-expanded={isMobile ? isOpenMobile : isOpen}
      aria-label={ariaLabel}
      className={composeTwRenderProps(className, slotClass("trigger"))}
      data-slot="sidebar-trigger"
      isIconOnly={children == null}
      variant="ghost"
      onPress={(event) => {
        toggle();
        onPress?.(event);
      }}
    >
      {children ?? <SidebarIcon />}
    </Button.Root>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Sidebar Rail
 * -----------------------------------------------------------------------------------------------*/
interface SidebarRailProps extends Omit<React.ComponentPropsWithRef<"button">, "children"> {}

const SidebarRail = ({
  "aria-label": ariaLabel = "Toggle sidebar",
  className,
  onClick,
  tabIndex = -1,
  title = ariaLabel,
  type = "button",
  ...props
}: SidebarRailProps) => {
  const {toggle} = useSidebarContext();

  return (
    <button
      {...props}
      aria-label={ariaLabel}
      className={slotClass("rail", className)}
      data-slot="sidebar-rail"
      tabIndex={tabIndex}
      title={title}
      type={type}
      onClick={(event) => {
        toggle();
        onClick?.(event);
      }}
    />
  );
};

const SidebarIcon = () => (
  <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
    <rect height="15" rx="2" stroke="currentColor" strokeWidth="1.5" width="16" x="2" y="2.5" />
    <path d="M7 3v14" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

SidebarRoot.displayName = "SY INC.Sidebar";
SidebarPanel.displayName = "SY INC.Sidebar.Panel";
SidebarTrigger.displayName = "SY INC.Sidebar.Trigger";
SidebarRail.displayName = "SY INC.Sidebar.Rail";

export {
  SidebarRoot,
  SidebarPanel,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSkeleton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarInput,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
  // eslint-disable-next-line react-refresh/only-export-components
  useSidebar,
};

export type {
  SidebarState,
  SidebarOpenState,
  SidebarSide,
  SidebarVariant,
  SidebarCollapsible,
  SidebarRootProps,
  SidebarPanelProps,
  SidebarPartProps,
  SidebarGroupActionProps,
  SidebarInputProps,
  SidebarSeparatorProps,
  SidebarTriggerProps,
  SidebarRailProps,
  SidebarMenuButtonProps,
  SidebarMenuActionProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
};

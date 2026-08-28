"use client";

import type {UseOverlayStateReturn} from "../../hooks";
import type {DOMRenderProps} from "../../utils/dom";
import type {TooltipContentProps} from "../tooltip";
import type {SidebarVariants} from "@sy-inc/styles";
import type {CSSProperties, ReactNode, SetStateAction} from "react";
import type {ButtonProps, LinkProps} from "react-aria-components";

import {sidebarVariants} from "@sy-inc/styles";
import React from "react";

import {useMediaQuery, useOverlayState} from "../../hooks";
import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
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

type SidebarState = "collapsed" | "expanded";
type SidebarSide = NonNullable<SidebarVariants["side"]>;
type SidebarVariant = NonNullable<SidebarVariants["variant"]>;
type SidebarCollapsible = NonNullable<SidebarVariants["collapsible"]>;

interface SidebarContextValue {
  isMobile: boolean;
  isOpen: boolean;
  isOpenMobile: boolean;
  panelId: string;
  setOpen: (isOpen: SetStateAction<boolean>) => void;
  setOpenMobile: (isOpen: SetStateAction<boolean>) => void;
  state: SidebarState;
  toggle: () => void;
}

interface SidebarInternalContextValue extends SidebarContextValue {
  collapsible: SidebarCollapsible;
  mobileState: UseOverlayStateReturn;
  mobileWidth: string;
  side: SidebarSide;
  slots: ReturnType<typeof sidebarVariants>;
  variant: SidebarVariant;
}

const SidebarContext = React.createContext<SidebarInternalContextValue | null>(null);

const useSidebarContext = () => {
  const context = React.use(SidebarContext);

  if (!context) throw new Error("Sidebar parts must be used within Sidebar.Root.");

  return context;
};

const useSidebar = (): SidebarContextValue => {
  const {
    collapsible: _collapsible,
    mobileState: _mobileState,
    mobileWidth: _mobileWidth,
    side: _side,
    slots: _slots,
    variant: _variant,
    ...context
  } = useSidebarContext();

  return context;
};

type SidebarVariables = CSSProperties & {
  "--sidebar-width"?: string;
  "--sidebar-width-collapsed"?: string;
  "--sidebar-width-mobile"?: string;
};

const toCSSLength = (value: number | string) => (typeof value === "number" ? `${value}px` : value);

/* -------------------------------------------------------------------------------------------------
 * Sidebar Root
 * -----------------------------------------------------------------------------------------------*/
interface SidebarRootProps
  extends Omit<React.ComponentPropsWithRef<"div">, "onChange">, SidebarVariants {
  /** Width of the expanded desktop panel. @default "16rem" */
  width?: number | string;
  /** Width of the icon-collapsed desktop panel. @default "3rem" */
  collapsedWidth?: number | string;
  /** Width of the mobile drawer. @default "18rem" */
  mobileWidth?: number | string;
  /** Initial desktop state when uncontrolled. @default true */
  defaultOpen?: boolean;
  /** Controlled desktop state. */
  isOpen?: boolean;
  /** Called when the desktop state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Viewport width (px) at or below which the uncontrolled sidebar auto-collapses. */
  collapseBreakpoint?: number;
}

const SidebarRoot = ({
  children,
  className,
  collapsedWidth = "3rem",
  collapseBreakpoint,
  collapsible = "offcanvas",
  defaultOpen = true,
  isOpen: controlledIsOpen,
  mobileWidth = "18rem",
  onOpenChange,
  side = "left",
  style,
  variant = "sidebar",
  width = "16rem",
  ...props
}: SidebarRootProps) => {
  const desktopState = useOverlayState({
    defaultOpen,
    isOpen: controlledIsOpen,
    onOpenChange,
  });
  const mobileState = useOverlayState();
  const isMobile = useMediaQuery("(max-width: 767px)", {initializeWithValue: false});
  const panelId = React.useId();
  const mobileWidthValue = toCSSLength(mobileWidth);
  const {isOpen: isOpenDesktop, setOpen: setDesktopOpen} = desktopState;
  const state: SidebarState = isOpenDesktop ? "expanded" : "collapsed";
  const slots = React.useMemo(
    () => sidebarVariants({collapsible, side, state, variant}),
    [collapsible, side, state, variant],
  );
  const {
    close: closeMobile,
    isOpen: isOpenMobile,
    setOpen: setMobileOpen,
    toggle: toggleMobile,
  } = mobileState;
  const setOpen = React.useCallback(
    (nextOpen: SetStateAction<boolean>) => {
      const nextIsOpen = typeof nextOpen === "function" ? nextOpen(isOpenDesktop) : nextOpen;

      setDesktopOpen(nextIsOpen);
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${nextIsOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [isOpenDesktop, setDesktopOpen],
  );
  const setOpenMobile = React.useCallback(
    (nextOpen: SetStateAction<boolean>) => {
      setMobileOpen(typeof nextOpen === "function" ? nextOpen(isOpenMobile) : nextOpen);
    },
    [isOpenMobile, setMobileOpen],
  );
  const toggle = React.useCallback(() => {
    if (isMobile) toggleMobile();
    else setOpen(!isOpenDesktop);
  }, [isMobile, isOpenDesktop, setOpen, toggleMobile]);
  const context = React.useMemo<SidebarInternalContextValue>(
    () => ({
      collapsible,
      isMobile,
      isOpen: state === "expanded",
      isOpenMobile,
      mobileState,
      mobileWidth: mobileWidthValue,
      panelId,
      setOpen,
      setOpenMobile,
      side,
      slots,
      state,
      toggle,
      variant,
    }),
    [
      collapsible,
      isMobile,
      isOpenMobile,
      mobileState,
      mobileWidthValue,
      panelId,
      setOpen,
      setOpenMobile,
      side,
      slots,
      state,
      toggle,
      variant,
    ],
  );
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
    if (collapseBreakpoint == null || collapsible === "none") return;

    const mediaQuery = window.matchMedia(`(max-width: ${collapseBreakpoint}px)`);
    const handleChange = (event: MediaQueryListEvent) => {
      if (controlledIsOpen === undefined) setOpen(!event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [collapseBreakpoint, collapsible, controlledIsOpen, setOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <SidebarContext value={context}>
      <div
        {...props}
        className={slots.base({className})}
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
  const {collapsible, isMobile, mobileState, mobileWidth, panelId, side, slots} =
    useSidebarContext();
  const descriptionId = `${panelId}-description`;

  if (isMobile && collapsible !== "none") {
    return (
      <Drawer.Root state={mobileState}>
        <Drawer.Trigger aria-hidden isDisabled className={slots.mobileTrigger()} />
        <Drawer.Backdrop className={slots.mobileBackdrop()}>
          <Drawer.Content className={slots.mobileContent()} placement={side}>
            <Drawer.Dialog
              {...(props as any)}
              aria-describedby={description ? descriptionId : undefined}
              aria-label={ariaLabel}
              className={slots.mobileDialog({className})}
              data-mobile="true"
              data-slot="sidebar-panel"
              id={panelId}
              style={
                {
                  ...props.style,
                  "--sidebar-width-mobile": mobileWidth,
                } as SidebarVariables
              }
            >
              {description ? (
                <span
                  className={slots.mobileDescription()}
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
      className={slots.panel({className})}
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
      <div aria-hidden="true" className={slots.gap()} data-slot="sidebar-gap" />
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
  slot: "content" | "footer" | "group" | "header" | "inset",
  displayName: string,
) => {
  const Part = ({
    className,
    ...props
  }: SidebarPartProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof SidebarPartProps<E>>) => {
    const {slots} = useSidebarContext();
    const Element = dom[element] as typeof dom.div;

    return (
      <Element
        {...(props as any)}
        className={composeSlotClassName(slots[slot], className)}
        data-slot={`sidebar-${slot}`}
      />
    );
  };

  Part.displayName = displayName;

  return Part;
};

const SidebarHeader = createPart("header", "header", "SY UI.Sidebar.Header");
const SidebarContent = createPart("div", "content", "SY UI.Sidebar.Content");
const SidebarFooter = createPart("footer", "footer", "SY UI.Sidebar.Footer");
const SidebarGroup = createPart("section", "group", "SY UI.Sidebar.Group");
const SidebarInset = createPart("main", "inset", "SY UI.Sidebar.Inset");

interface SidebarInputProps extends React.ComponentPropsWithRef<typeof Input> {}

const SidebarInput = ({className, ...props}: SidebarInputProps) => {
  const {slots} = useSidebarContext();

  return (
    <Input
      {...props}
      className={composeTwRenderProps(className, slots.input())}
      data-slot="sidebar-input"
    />
  );
};

interface SidebarSeparatorProps extends React.ComponentPropsWithRef<typeof Separator> {}

const SidebarSeparator = ({className, ...props}: SidebarSeparatorProps) => {
  const {slots} = useSidebarContext();

  return (
    <Separator {...props} className={slots.separator({className})} data-slot="sidebar-separator" />
  );
};

type SidebarElementProps<E extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithRef<E>;

const createMenuPart = <E extends keyof React.JSX.IntrinsicElements>(
  element: E,
  slot:
    | "groupContent"
    | "groupLabel"
    | "menu"
    | "menuBadge"
    | "menuItem"
    | "menuSub"
    | "menuSubItem",
  dataSlot: string,
  displayName: string,
) => {
  const Part = ({className, ...props}: SidebarElementProps<E>) => {
    const {slots} = useSidebarContext();
    const Element = dom[element] as typeof dom.div;

    return (
      <Element {...(props as any)} className={slots[slot]({className})} data-slot={dataSlot} />
    );
  };

  Part.displayName = displayName;

  return Part;
};

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLElement> {
  elementType?: React.ElementType;
}

const SidebarGroupLabel = ({
  className,
  elementType: Element = "div",
  ...props
}: SidebarGroupLabelProps) => {
  const {slots} = useSidebarContext();

  return (
    <Element {...props} className={slots.groupLabel({className})} data-slot="sidebar-group-label" />
  );
};
const SidebarGroupContent = createMenuPart(
  "div",
  "groupContent",
  "sidebar-group-content",
  "SY UI.Sidebar.GroupContent",
);

interface SidebarGroupActionProps extends Omit<ButtonProps, "className"> {
  className?: ButtonProps["className"];
}

const SidebarGroupAction = ({className, ...props}: SidebarGroupActionProps) => {
  const {slots} = useSidebarContext();

  return (
    <Button.Root
      {...props}
      className={composeTwRenderProps(className, slots.groupAction())}
      data-slot="sidebar-group-action"
      variant="ghost"
    />
  );
};

const SidebarMenu = createMenuPart("ul", "menu", "sidebar-menu", "SY UI.Sidebar.Menu");

export interface SidebarMenuItemProps extends SidebarElementProps<"li"> {
  /** Hides this item while the sidebar is collapsed. */
  hideCollapsed?: boolean;
}

const SidebarMenuItem = ({className, hideCollapsed, ...props}: SidebarMenuItemProps) => {
  const {slots} = useSidebarContext();

  return (
    <li
      {...props}
      className={slots.menuItem({className})}
      data-hide-collapsed={hideCollapsed || undefined}
      data-slot="sidebar-menu-item"
    />
  );
};
SidebarMenuItem.displayName = "SY UI.Sidebar.MenuItem";

const SidebarMenuBadge = createMenuPart(
  "div",
  "menuBadge",
  "sidebar-menu-badge",
  "SY UI.Sidebar.MenuBadge",
);

interface SidebarMenuActionProps extends Omit<ButtonProps, "className"> {
  className?: ButtonProps["className"];
  showOnHover?: boolean;
}

const SidebarMenuAction = ({className, showOnHover = false, ...props}: SidebarMenuActionProps) => {
  const {slots} = useSidebarContext();

  return (
    <Button.Root
      {...props}
      className={composeTwRenderProps(className, slots.menuAction())}
      data-show-on-hover={showOnHover || undefined}
      data-slot="sidebar-menu-action"
      variant="ghost"
    />
  );
};

const SidebarMenuSub = createMenuPart("ul", "menuSub", "sidebar-menu-sub", "SY UI.Sidebar.MenuSub");
const SidebarMenuSubItem = createMenuPart(
  "li",
  "menuSubItem",
  "sidebar-menu-sub-item",
  "SY UI.Sidebar.MenuSubItem",
);

type SidebarButtonProps =
  | (Omit<LinkProps, "className"> & {className?: LinkProps["className"]; href: string})
  | (Omit<ButtonProps, "className"> & {className?: ButtonProps["className"]; href?: never});

type SidebarMenuButtonProps = SidebarButtonProps & {
  isActive?: boolean;
  size?: "default" | "lg" | "sm";
  tooltip?: string | TooltipContentProps;
  variant?: "default" | "outline";
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
  const {isMobile, side, slots, state} = useSidebarContext();
  const ariaLabel = props["aria-label"] ?? (typeof tooltip === "string" ? tooltip : undefined);
  const menuButtonClassName = slots.menuButton();

  const control =
    href !== undefined ? (
      <Link.Root
        {...(props as LinkProps)}
        aria-current={isActive ? "page" : undefined}
        aria-label={ariaLabel}
        className={composeTwRenderProps(className as LinkProps["className"], menuButtonClassName)}
        data-active={isActive || undefined}
        data-size={size}
        data-slot="sidebar-menu-button"
        data-variant={variant}
        href={href}
      />
    ) : (
      <Button.Root
        {...(props as ButtonProps)}
        aria-label={ariaLabel}
        className={composeTwRenderProps(className as ButtonProps["className"], menuButtonClassName)}
        data-active={isActive || undefined}
        data-size={size}
        data-slot="sidebar-menu-button"
        data-variant={variant}
        variant="ghost"
      />
    );

  if (!tooltip) return control;

  const tooltipProps = typeof tooltip === "string" ? {children: tooltip} : tooltip;

  return (
    <Tooltip isDisabled={isMobile || state !== "collapsed"}>
      {control}
      <Tooltip.Content placement={side === "left" ? "right" : "left"} {...tooltipProps} />
    </Tooltip>
  );
};

interface SidebarMenuSkeletonProps extends React.ComponentPropsWithRef<"div"> {
  showIcon?: boolean;
}

const SidebarMenuSkeleton = ({className, showIcon = false, ...props}: SidebarMenuSkeletonProps) => {
  const {slots} = useSidebarContext();

  return (
    <div
      aria-hidden="true"
      {...props}
      className={slots.menuSkeleton({className})}
      data-slot="sidebar-menu-skeleton"
    >
      {showIcon && (
        <Skeleton className={slots.menuSkeletonIcon()} data-slot="sidebar-menu-skeleton-icon" />
      )}
      <Skeleton className={slots.menuSkeletonText()} data-slot="sidebar-menu-skeleton-text" />
    </div>
  );
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
}: SidebarMenuSubButtonProps) => {
  const {slots} = useSidebarContext();
  const menuSubButtonClassName = slots.menuSubButton();

  return href !== undefined ? (
    <Link.Root
      {...(props as LinkProps)}
      aria-current={isActive ? "page" : undefined}
      className={composeTwRenderProps(className as LinkProps["className"], menuSubButtonClassName)}
      data-active={isActive || undefined}
      data-size={size}
      data-slot="sidebar-menu-sub-button"
      href={href}
    />
  ) : (
    <Button.Root
      {...(props as ButtonProps)}
      className={composeTwRenderProps(
        className as ButtonProps["className"],
        menuSubButtonClassName,
      )}
      data-active={isActive || undefined}
      data-size={size}
      data-slot="sidebar-menu-sub-button"
      variant="ghost"
    />
  );
};

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
  const {isMobile, isOpen, isOpenMobile, panelId, slots, toggle} = useSidebarContext();

  return (
    <Button.Root
      {...props}
      aria-controls={panelId}
      aria-expanded={isMobile ? isOpenMobile : isOpen}
      aria-label={ariaLabel}
      className={composeTwRenderProps(className, slots.trigger())}
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
  const {slots, toggle} = useSidebarContext();

  return (
    <button
      {...props}
      aria-label={ariaLabel}
      className={slots.rail({className})}
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

SidebarRoot.displayName = "SY UI.Sidebar";
SidebarPanel.displayName = "SY UI.Sidebar.Panel";
SidebarTrigger.displayName = "SY UI.Sidebar.Trigger";
SidebarRail.displayName = "SY UI.Sidebar.Rail";

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
  useSidebar,
};

export type {
  SidebarState,
  SidebarSide,
  SidebarVariant,
  SidebarCollapsible,
  SidebarRootProps,
  SidebarPanelProps,
  SidebarPartProps,
  SidebarGroupActionProps,
  SidebarGroupLabelProps,
  SidebarInputProps,
  SidebarSeparatorProps,
  SidebarTriggerProps,
  SidebarRailProps,
  SidebarMenuButtonProps,
  SidebarMenuActionProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
};

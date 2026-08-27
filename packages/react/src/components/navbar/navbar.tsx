"use client";

import type {NavbarVariants} from "@sy-ui/styles";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {ButtonProps} from "react-aria-components";

import {navbarVariants} from "@sy-ui/styles";
import React from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";

import {composeTwRenderProps} from "../../utils";

type NavbarContextValue = {
  isMenuOpen: boolean;
  menuId: string;
  setMenuOpen: (isOpen: boolean) => void;
  slots: ReturnType<typeof navbarVariants>;
};

const NavbarContext = React.createContext<NavbarContextValue | null>(null);

const useNavbarContext = () => {
  const context = React.use(NavbarContext);

  if (!context) throw new Error("Navbar parts must be used within Navbar.");

  return context;
};

interface NavbarRootProps extends ComponentPropsWithRef<"nav">, NavbarVariants {
  defaultIsMenuOpen?: boolean;
  isMenuOpen?: boolean;
  onMenuOpenChange?: (isOpen: boolean) => void;
}

const NavbarRoot = ({
  children,
  className,
  defaultIsMenuOpen = false,
  isBlurred,
  isBordered,
  isMenuOpen: controlledIsMenuOpen,
  onMenuOpenChange,
  ...props
}: NavbarRootProps) => {
  const [uncontrolledIsMenuOpen, setUncontrolledIsMenuOpen] = React.useState(defaultIsMenuOpen);
  const isMenuOpen = controlledIsMenuOpen ?? uncontrolledIsMenuOpen;
  const menuId = React.useId();
  const slots = React.useMemo(
    () => navbarVariants({isBlurred, isBordered}),
    [isBlurred, isBordered],
  );
  const setMenuOpen = React.useCallback(
    (nextIsOpen: boolean) => {
      if (controlledIsMenuOpen === undefined) setUncontrolledIsMenuOpen(nextIsOpen);
      onMenuOpenChange?.(nextIsOpen);
    },
    [controlledIsMenuOpen, onMenuOpenChange],
  );
  const context = React.useMemo(
    () => ({isMenuOpen, menuId, setMenuOpen, slots}),
    [isMenuOpen, menuId, setMenuOpen, slots],
  );

  return (
    <NavbarContext value={context}>
      <nav
        {...props}
        aria-label={props["aria-label"] ?? "Main navigation"}
        className={slots.base({className})}
        data-menu-open={isMenuOpen ? "true" : "false"}
        data-slot="navbar"
      >
        {children}
      </nav>
    </NavbarContext>
  );
};

interface NavbarPartProps extends ComponentPropsWithRef<"div"> {}

const NavbarBrand = ({className, ...props}: NavbarPartProps) => {
  const {slots} = useNavbarContext();

  return <div {...props} className={slots.brand({className})} data-slot="navbar-brand" />;
};

interface NavbarContentProps extends NavbarPartProps {
  justify?: NavbarVariants["justify"];
}

const NavbarContent = ({className, justify = "start", ...props}: NavbarContentProps) => {
  const {slots} = useNavbarContext();

  return (
    <div {...props} className={slots.content({className, justify})} data-slot="navbar-content" />
  );
};

interface NavbarItemProps extends ComponentPropsWithRef<"div"> {}

const NavbarItem = ({className, ...props}: NavbarItemProps) => {
  const {slots} = useNavbarContext();

  return <div {...props} className={slots.item({className})} data-slot="navbar-item" />;
};

interface NavbarMenuToggleProps extends ButtonProps {
  isMenuOpen?: boolean;
}

const NavbarMenuToggle = ({
  "aria-label": ariaLabel = "Toggle navigation menu",
  children,
  className,
  isMenuOpen: localIsMenuOpen,
  onPress,
  ...props
}: NavbarMenuToggleProps) => {
  const context = useNavbarContext();
  const isMenuOpen = localIsMenuOpen ?? context.isMenuOpen;

  return (
    <ButtonPrimitive
      {...props}
      aria-controls={context.menuId}
      aria-expanded={isMenuOpen}
      aria-label={ariaLabel}
      className={composeTwRenderProps(className, context.slots.toggle())}
      data-open={isMenuOpen ? "true" : "false"}
      data-slot="navbar-menu-toggle"
      type="button"
      onPress={(event) => {
        context.setMenuOpen(!isMenuOpen);
        onPress?.(event);
      }}
    >
      {children ?? <span aria-hidden="true" className="navbar__menu-icon" />}
    </ButtonPrimitive>
  );
};

interface NavbarMenuProps extends ComponentPropsWithRef<"ul"> {
  children?: ReactNode;
}

const NavbarMenu = ({className, ...props}: NavbarMenuProps) => {
  const {menuId, slots} = useNavbarContext();

  return <ul {...props} className={slots.menu({className})} data-slot="navbar-menu" id={menuId} />;
};

interface NavbarMenuItemProps extends ComponentPropsWithRef<"li"> {}

const NavbarMenuItem = ({className, ...props}: NavbarMenuItemProps) => {
  const {slots} = useNavbarContext();

  return <li {...props} className={slots.menuItem({className})} data-slot="navbar-menu-item" />;
};

const Navbar = Object.assign(NavbarRoot, {
  Brand: NavbarBrand,
  Content: NavbarContent,
  Item: NavbarItem,
  Menu: NavbarMenu,
  MenuItem: NavbarMenuItem,
  MenuToggle: NavbarMenuToggle,
});

export {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  NavbarRoot,
};

export type {
  NavbarContentProps,
  NavbarItemProps,
  NavbarMenuItemProps,
  NavbarMenuProps,
  NavbarMenuToggleProps,
  NavbarPartProps,
  NavbarRootProps,
};

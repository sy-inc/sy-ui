import type {ComponentProps} from "react";

import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarPanel,
  SidebarRail,
  SidebarRoot,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Sidebar = Object.assign(SidebarRoot, {
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  GroupAction: SidebarGroupAction,
  GroupContent: SidebarGroupContent,
  GroupLabel: SidebarGroupLabel,
  Header: SidebarHeader,
  Input: SidebarInput,
  Inset: SidebarInset,
  Menu: SidebarMenu,
  MenuAction: SidebarMenuAction,
  MenuBadge: SidebarMenuBadge,
  MenuButton: SidebarMenuButton,
  MenuItem: SidebarMenuItem,
  MenuSkeleton: SidebarMenuSkeleton,
  MenuSub: SidebarMenuSub,
  MenuSubButton: SidebarMenuSubButton,
  MenuSubItem: SidebarMenuSubItem,
  Panel: SidebarPanel,
  Rail: SidebarRail,
  Root: SidebarRoot,
  Separator: SidebarSeparator,
  Trigger: SidebarTrigger,
});

export type Sidebar = {
  ContentProps: ComponentProps<typeof SidebarContent>;
  FooterProps: ComponentProps<typeof SidebarFooter>;
  GroupActionProps: ComponentProps<typeof SidebarGroupAction>;
  GroupContentProps: ComponentProps<typeof SidebarGroupContent>;
  GroupLabelProps: ComponentProps<typeof SidebarGroupLabel>;
  GroupProps: ComponentProps<typeof SidebarGroup>;
  HeaderProps: ComponentProps<typeof SidebarHeader>;
  InsetProps: ComponentProps<typeof SidebarInset>;
  InputProps: ComponentProps<typeof SidebarInput>;
  MenuActionProps: ComponentProps<typeof SidebarMenuAction>;
  MenuBadgeProps: ComponentProps<typeof SidebarMenuBadge>;
  MenuButtonProps: ComponentProps<typeof SidebarMenuButton>;
  MenuItemProps: ComponentProps<typeof SidebarMenuItem>;
  MenuProps: ComponentProps<typeof SidebarMenu>;
  MenuSkeletonProps: ComponentProps<typeof SidebarMenuSkeleton>;
  MenuSubButtonProps: ComponentProps<typeof SidebarMenuSubButton>;
  MenuSubItemProps: ComponentProps<typeof SidebarMenuSubItem>;
  MenuSubProps: ComponentProps<typeof SidebarMenuSub>;
  PanelProps: ComponentProps<typeof SidebarPanel>;
  Props: ComponentProps<typeof SidebarRoot>;
  RailProps: ComponentProps<typeof SidebarRail>;
  RootProps: ComponentProps<typeof SidebarRoot>;
  SeparatorProps: ComponentProps<typeof SidebarSeparator>;
  TriggerProps: ComponentProps<typeof SidebarTrigger>;
};

export {
  SidebarRoot,
  SidebarSeparator,
  SidebarPanel,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarInput,
  SidebarTrigger,
  SidebarRail,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "./sidebar";

export type {
  SidebarRootProps,
  SidebarSeparatorProps,
  SidebarRootProps as SidebarProps,
  SidebarPanelProps,
  SidebarPartProps,
  SidebarGroupActionProps,
  SidebarGroupLabelProps,
  SidebarInputProps,
  SidebarTriggerProps,
  SidebarRailProps,
  SidebarMenuButtonProps,
  SidebarMenuActionProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
  SidebarState,
  SidebarSide,
  SidebarVariant,
  SidebarCollapsible,
} from "./sidebar";

export {sidebarVariants} from "@sy-inc/styles";
export type {SidebarVariants} from "@sy-inc/styles";

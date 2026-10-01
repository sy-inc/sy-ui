import type {ComponentProps} from "react";

import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerDialog,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerHeading,
  DrawerRoot,
  DrawerTrigger,
} from "./drawer";

export const Drawer = Object.assign(DrawerRoot, {
  Backdrop: DrawerBackdrop,
  Body: DrawerBody,
  CloseTrigger: DrawerCloseTrigger,
  Content: DrawerContent,
  Dialog: DrawerDialog,
  Footer: DrawerFooter,
  Handle: DrawerHandle,
  Header: DrawerHeader,
  Heading: DrawerHeading,
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
});
export type Drawer = {
  Props: ComponentProps<typeof DrawerRoot>;
  RootProps: ComponentProps<typeof DrawerRoot>;
  TriggerProps: ComponentProps<typeof DrawerTrigger>;
  BackdropProps: ComponentProps<typeof DrawerBackdrop>;
  ContentProps: ComponentProps<typeof DrawerContent>;
  DialogProps: ComponentProps<typeof DrawerDialog>;
  HandleProps: ComponentProps<typeof DrawerHandle>;
  HeaderProps: ComponentProps<typeof DrawerHeader>;
  HeadingProps: ComponentProps<typeof DrawerHeading>;
  BodyProps: ComponentProps<typeof DrawerBody>;
  FooterProps: ComponentProps<typeof DrawerFooter>;
  CloseTriggerProps: ComponentProps<typeof DrawerCloseTrigger>;
};
export {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerDialog,
  DrawerFooter,
  DrawerHandle,
  DrawerHeader,
  DrawerHeading,
  DrawerRoot,
  DrawerTrigger,
};
export type {
  DrawerBackdropProps,
  DrawerBodyProps,
  DrawerCloseTriggerProps,
  DrawerContentProps,
  DrawerDialogProps,
  DrawerFooterProps,
  DrawerHandleProps,
  DrawerHeaderProps,
  DrawerHeadingProps,
  DrawerPlacement,
  DrawerRootProps,
  DrawerRootProps as DrawerProps,
  DrawerSnapPoint,
  DrawerTriggerProps,
} from "./drawer";
export {drawerVariants} from "@sy-inc/styles";
export type {DrawerVariants} from "@sy-inc/styles";

import type {ComponentProps} from "react";

import {
  SheetBackdrop,
  SheetBody,
  SheetCloseTrigger,
  SheetContent,
  SheetDialog,
  SheetFooter,
  SheetHandle,
  SheetHeader,
  SheetHeading,
  SheetNestedRoot,
  SheetRoot,
  SheetTrigger,
} from "./sheet";

export const Sheet = Object.assign(SheetRoot, {
  Backdrop: SheetBackdrop,
  Body: SheetBody,
  CloseTrigger: SheetCloseTrigger,
  Content: SheetContent,
  Dialog: SheetDialog,
  Footer: SheetFooter,
  Handle: SheetHandle,
  Header: SheetHeader,
  Heading: SheetHeading,
  NestedRoot: SheetNestedRoot,
  Root: SheetRoot,
  Trigger: SheetTrigger,
});
export type Sheet = {
  Props: ComponentProps<typeof SheetRoot>;
  RootProps: ComponentProps<typeof SheetRoot>;
  NestedRootProps: ComponentProps<typeof SheetNestedRoot>;
  TriggerProps: ComponentProps<typeof SheetTrigger>;
  BackdropProps: ComponentProps<typeof SheetBackdrop>;
  ContentProps: ComponentProps<typeof SheetContent>;
  DialogProps: ComponentProps<typeof SheetDialog>;
  HandleProps: ComponentProps<typeof SheetHandle>;
  HeaderProps: ComponentProps<typeof SheetHeader>;
  HeadingProps: ComponentProps<typeof SheetHeading>;
  BodyProps: ComponentProps<typeof SheetBody>;
  FooterProps: ComponentProps<typeof SheetFooter>;
  CloseTriggerProps: ComponentProps<typeof SheetCloseTrigger>;
};
export {
  SheetBackdrop,
  SheetBody,
  SheetCloseTrigger,
  SheetContent,
  SheetDialog,
  SheetFooter,
  SheetHandle,
  SheetHeader,
  SheetHeading,
  SheetNestedRoot,
  SheetRoot,
  SheetTrigger,
};
export type {
  SheetBackdropProps,
  SheetBodyProps,
  SheetCloseTriggerProps,
  SheetContentProps,
  SheetDialogProps,
  SheetFooterProps,
  SheetHandleProps,
  SheetHeaderProps,
  SheetHeadingProps,
  SheetPlacement,
  SheetRootProps,
  SheetRootProps as SheetProps,
  SheetSnapPoint,
  SheetTriggerProps,
} from "./sheet";
export {sheetVariants} from "@sy-inc/styles";
export type {SheetVariants} from "@sy-inc/styles";

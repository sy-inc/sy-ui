import type {ComponentProps} from "react";

import {
  ListViewContent,
  ListViewDescription,
  ListViewDragHandle,
  ListViewHeader,
  ListViewItem,
  ListViewRoot,
  ListViewSection,
  ListViewSelection,
  ListViewTitle,
} from "./list-view";

export const ListView = Object.assign(ListViewRoot, {
  Content: ListViewContent,
  Description: ListViewDescription,
  DragHandle: ListViewDragHandle,
  Header: ListViewHeader,
  Item: ListViewItem,
  Root: ListViewRoot,
  Section: ListViewSection,
  Selection: ListViewSelection,
  Title: ListViewTitle,
});

export type ListView = {
  ItemProps: ComponentProps<typeof ListViewItem>;
  Props: ComponentProps<typeof ListViewRoot>;
  RootProps: ComponentProps<typeof ListViewRoot>;
  SectionProps: ComponentProps<typeof ListViewSection>;
  HeaderProps: ComponentProps<typeof ListViewHeader>;
  SelectionProps: ComponentProps<typeof ListViewSelection>;
  DragHandleProps: ComponentProps<typeof ListViewDragHandle>;
  ContentProps: ComponentProps<typeof ListViewContent>;
  TitleProps: ComponentProps<typeof ListViewTitle>;
  DescriptionProps: ComponentProps<typeof ListViewDescription>;
};

export {
  ListViewItem,
  ListViewRoot,
  ListViewSection,
  ListViewHeader,
  ListViewSelection,
  ListViewDragHandle,
  ListViewContent,
  ListViewTitle,
  ListViewDescription,
};
export type {
  ListViewContentProps,
  ListViewDescriptionProps,
  ListViewDragHandleProps,
  ListViewHeaderProps,
  ListViewItemProps,
  ListViewRootProps,
  ListViewRootProps as ListViewProps,
  ListViewSectionProps,
  ListViewSelectionProps,
  ListViewTitleProps,
} from "./list-view";
export {listViewVariants} from "@sy-inc/styles";
export type {ListViewVariants} from "@sy-inc/styles";

import type {ComponentProps} from "react";

import {
  ListViewContent,
  ListViewDescription,
  ListViewItem,
  ListViewRoot,
  ListViewSection,
  ListViewSelection,
  ListViewTitle,
} from "./list-view";

export const ListView = Object.assign(ListViewRoot, {
  Content: ListViewContent,
  Description: ListViewDescription,
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
  SelectionProps: ComponentProps<typeof ListViewSelection>;
  ContentProps: ComponentProps<typeof ListViewContent>;
  TitleProps: ComponentProps<typeof ListViewTitle>;
  DescriptionProps: ComponentProps<typeof ListViewDescription>;
};

export {
  ListViewItem,
  ListViewRoot,
  ListViewSection,
  ListViewSelection,
  ListViewContent,
  ListViewTitle,
  ListViewDescription,
};
export type {
  ListViewContentProps,
  ListViewDescriptionProps,
  ListViewItemProps,
  ListViewRootProps,
  ListViewRootProps as ListViewProps,
  ListViewSectionProps,
  ListViewSelectionProps,
  ListViewTitleProps,
} from "./list-view";
export {listViewVariants} from "@sy-inc/styles";
export type {ListViewVariants} from "@sy-inc/styles";

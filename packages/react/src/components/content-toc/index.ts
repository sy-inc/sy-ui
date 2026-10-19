import type {ComponentProps} from "react";

import {ContentTocItem, ContentTocList, ContentTocRoot, ContentTocTitle} from "./content-toc";

export const ContentToc = Object.assign(ContentTocRoot, {
  Root: ContentTocRoot,
  Title: ContentTocTitle,
  List: ContentTocList,
  Item: ContentTocItem,
});

export type ContentToc = {
  Props: ComponentProps<typeof ContentTocRoot>;
  RootProps: ComponentProps<typeof ContentTocRoot>;
  TitleProps: ComponentProps<typeof ContentTocTitle>;
  ListProps: ComponentProps<typeof ContentTocList>;
  ItemProps: ComponentProps<typeof ContentTocItem>;
};

export {ContentTocRoot, ContentTocTitle, ContentTocList, ContentTocItem};
export type {
  ContentTocRootProps,
  ContentTocRootProps as ContentTocProps,
  ContentTocTitleProps,
  ContentTocListProps,
  ContentTocItemProps,
  ContentTocEntry,
  ContentTocRailVariant,
} from "./content-toc";

export {contentTocVariants} from "@sy-inc/styles";
export type {ContentTocVariants} from "@sy-inc/styles";

import type {ComponentProps} from "react";

import {
  FileTreeHeader,
  FileTreeIndicator,
  FileTreeItem,
  FileTreeRoot,
  FileTreeSection,
} from "./file-tree";

export const FileTree = Object.assign(FileTreeRoot, {
  Header: FileTreeHeader,
  Indicator: FileTreeIndicator,
  Item: FileTreeItem,
  Root: FileTreeRoot,
  Section: FileTreeSection,
});

export default FileTree;

export type FileTree = {
  HeaderProps: ComponentProps<typeof FileTreeHeader>;
  IndicatorProps: ComponentProps<typeof FileTreeIndicator>;
  ItemProps: ComponentProps<typeof FileTreeItem>;
  Props: ComponentProps<typeof FileTreeRoot>;
  RootProps: ComponentProps<typeof FileTreeRoot>;
  SectionProps: ComponentProps<typeof FileTreeSection>;
};

export {FileTreeRoot, FileTreeSection, FileTreeHeader, FileTreeItem, FileTreeIndicator};

export type {
  FileTreeRootProps,
  FileTreeRootProps as FileTreeProps,
  FileTreeSectionProps,
  FileTreeHeaderProps,
  FileTreeItemProps,
  FileTreeIndicatorProps,
} from "./file-tree";

export {fileTreeVariants} from "@sy-inc/styles";
export type {FileTreeVariants} from "@sy-inc/styles";

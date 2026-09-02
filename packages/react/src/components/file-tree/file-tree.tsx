"use client";

import type {FileTreeVariants} from "@sy-inc/styles";
import type {ReactNode} from "react";
import type {
  TreeHeaderProps,
  TreeItemContentRenderProps,
  TreeItemProps,
  TreeProps,
  TreeSectionProps,
} from "react-aria-components/Tree";

import {fileTreeVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {
  Button,
  TreeHeader as TreeHeaderPrimitive,
  TreeItemContent,
  TreeItem as TreeItemPrimitive,
  Tree as TreePrimitive,
  TreeSection as TreeSectionPrimitive,
} from "react-aria-components/Tree";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {IconChevronRight, IconGripVertical} from "../icons";

type FileTreeContextValue = {
  slots?: ReturnType<typeof fileTreeVariants>;
};

const FileTreeContext = createContext<FileTreeContextValue>({});

export interface FileTreeRootProps<T extends object = object>
  extends TreeProps<T>, FileTreeVariants {}

export interface FileTreeItemProps<T extends object = object> extends Omit<
  TreeItemProps<T>,
  "children" | "textValue"
> {
  children?: ReactNode;
  icon?: ReactNode | ((props: TreeItemContentRenderProps) => ReactNode);
  /** Replaces the default chevron. Wrap custom content in `FileTree.Indicator` to keep the rotation styling. */
  indicator?: ReactNode;
  selection?: ReactNode;
  textValue?: string;
  title: ReactNode;
}

export interface FileTreeIndicatorProps {
  children?: ReactNode;
  className?: string;
}

export type FileTreeSectionProps<T extends object = object> = TreeSectionProps<T>;
export type FileTreeHeaderProps = TreeHeaderProps;

function FileTreeRoot<T extends object>({
  children,
  className,
  showGuideLines,
  size,
  ...props
}: FileTreeRootProps<T>) {
  const slots = React.useMemo(
    () => fileTreeVariants({showGuideLines, size}),
    [showGuideLines, size],
  );

  return (
    <FileTreeContext value={{slots}}>
      <TreePrimitive
        {...props}
        className={composeTwRenderProps(className, slots.base())}
        data-slot="file-tree"
      >
        {children}
      </TreePrimitive>
    </FileTreeContext>
  );
}

function FileTreeSection<T extends object>({className, ...props}: FileTreeSectionProps<T>) {
  const {slots} = use(FileTreeContext);

  return (
    <TreeSectionPrimitive
      {...props}
      className={composeSlotClassName(slots?.section, className)}
      data-slot="file-tree-section"
    />
  );
}

function FileTreeHeader({className, ...props}: FileTreeHeaderProps) {
  const {slots} = use(FileTreeContext);

  return (
    <TreeHeaderPrimitive
      {...props}
      className={composeSlotClassName(slots?.header, className)}
      data-slot="file-tree-header"
    />
  );
}

function FileTreeItem<T extends object>({
  children,
  className,
  icon,
  indicator,
  selection,
  textValue,
  title,
  ...props
}: FileTreeItemProps<T>) {
  const {slots} = use(FileTreeContext);

  return (
    <TreeItemPrimitive
      {...props}
      className={composeTwRenderProps(className, slots?.item())}
      data-slot="file-tree-item"
      textValue={textValue ?? (typeof title === "string" ? title : "")}
    >
      <TreeItemContent>
        {(state) => (
          <div className={slots?.itemContent()} data-slot="file-tree-item-content">
            {selection}
            {state.hasChildItems ? (
              <Button
                aria-label={state.isExpanded ? "Collapse item" : "Expand item"}
                className={slots?.chevron()}
                data-slot="file-tree-chevron"
                slot="chevron"
              >
                {indicator ?? <FileTreeIndicator />}
              </Button>
            ) : (
              <span aria-hidden="true" className={slots?.chevron()} data-slot="file-tree-chevron" />
            )}
            {icon ? (
              <span className={slots?.icon()} data-slot="file-tree-icon">
                {typeof icon === "function" ? icon(state) : icon}
              </span>
            ) : null}
            <span className={slots?.label()} data-slot="file-tree-label">
              {title}
            </span>
            {state.allowsDragging ? <FileTreeDragHandle /> : null}
          </div>
        )}
      </TreeItemContent>
      {children}
    </TreeItemPrimitive>
  );
}

function FileTreeIndicator({children, className}: FileTreeIndicatorProps) {
  const {slots} = use(FileTreeContext);

  return (
    <span
      aria-hidden="true"
      className={composeSlotClassName(slots?.indicator, className)}
      data-slot="file-tree-indicator"
    >
      {children ?? <IconChevronRight />}
    </span>
  );
}

function FileTreeDragHandle() {
  const {slots} = use(FileTreeContext);

  return (
    <Button
      aria-label="Drag item"
      className={slots?.dragHandle()}
      data-slot="file-tree-drag-handle"
      slot="drag"
    >
      <IconGripVertical />
    </Button>
  );
}

FileTreeRoot.displayName = "SY INC.FileTree";
FileTreeSection.displayName = "SY INC.FileTree.Section";
FileTreeHeader.displayName = "SY INC.FileTree.Header";
FileTreeItem.displayName = "SY INC.FileTree.Item";
FileTreeIndicator.displayName = "SY INC.FileTree.Indicator";
FileTreeDragHandle.displayName = "SY INC.FileTree.DragHandle";

export {FileTreeRoot, FileTreeSection, FileTreeHeader, FileTreeItem, FileTreeIndicator};

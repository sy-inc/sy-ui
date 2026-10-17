"use client";

import type {ButtonProps} from "../button";
import type {ListViewVariants} from "@sy-inc/styles";
import type {ComponentProps, ComponentPropsWithRef} from "react";

import {listViewVariants} from "@sy-inc/styles";
import {createContext, use, useMemo} from "react";
import {
  GridListHeader as GridListHeaderPrimitive,
  GridListItem as GridListItemPrimitive,
  GridList as GridListPrimitive,
  GridListSection as GridListSectionPrimitive,
} from "react-aria-components/GridList";

import {composeTwRenderProps} from "../../utils";
import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {IconGripVertical} from "../icons";

type ListViewContextValue = {
  slots?: ReturnType<typeof listViewVariants>;
};

const ListViewContext = createContext<ListViewContextValue>({});

/* -------------------------------------------------------------------------------------------------
 * ListView Root
 * -----------------------------------------------------------------------------------------------*/
interface ListViewRootProps<T extends object>
  extends ComponentPropsWithRef<typeof GridListPrimitive<T>>, ListViewVariants {
  className?: string;
}

function ListViewRoot<T extends object>({className, variant, ...props}: ListViewRootProps<T>) {
  const slots = useMemo(() => listViewVariants({variant}), [variant]);

  return (
    <ListViewContext value={{slots}}>
      <GridListPrimitive
        className={composeTwRenderProps(className, slots.base())}
        data-slot="list-view"
        {...props}
      />
    </ListViewContext>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ListView Item
 * -----------------------------------------------------------------------------------------------*/
interface ListViewItemProps extends ComponentPropsWithRef<typeof GridListItemPrimitive> {
  className?: string;
}

function ListViewItem({className, ...props}: ListViewItemProps) {
  const {slots} = use(ListViewContext);

  return (
    <GridListItemPrimitive
      className={composeTwRenderProps(className, slots?.item())}
      data-slot="list-view-item"
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * ListView Section
 * -----------------------------------------------------------------------------------------------*/
interface ListViewSectionProps extends ComponentPropsWithRef<typeof GridListSectionPrimitive> {
  className?: string;
}

function ListViewSection({className, ...props}: ListViewSectionProps) {
  const {slots} = use(ListViewContext);

  return (
    <GridListSectionPrimitive
      className={slots?.section({class: className})}
      data-slot="list-view-section"
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * ListView Header — a section's visible label. GridListHeader renders it as a row header, which
 * names the section's row group; a generic `Header` would not.
 * -----------------------------------------------------------------------------------------------*/
interface ListViewHeaderProps extends ComponentPropsWithRef<"div"> {}

function ListViewHeader({className, ...props}: ListViewHeaderProps) {
  const {slots} = use(ListViewContext);
  // RAC types GridListHeader without className/children but forwards every prop to its div.
  const headerProps = {...props, className: slots?.header({class: className})};

  return <GridListHeaderPrimitive data-slot="list-view-header" {...headerProps} />;
}

/* -------------------------------------------------------------------------------------------------
 * ListView Selection
 * -----------------------------------------------------------------------------------------------*/
interface ListViewSelectionProps extends ComponentProps<typeof Checkbox.Selection> {}

function ListViewSelection({className, ...props}: ListViewSelectionProps) {
  const {slots} = use(ListViewContext);

  return (
    <Checkbox.Selection
      className={composeTwRenderProps(className, slots?.selection())}
      data-slot="list-view-selection"
      variant="secondary"
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * ListView DragHandle — the row's `slot="drag"` button. React Aria wires it for keyboard and
 * screen-reader dragging and names it from the row's text; pointer drags start anywhere on the row.
 * -----------------------------------------------------------------------------------------------*/
interface ListViewDragHandleProps extends ButtonProps {}

function ListViewDragHandle({children, className, ...props}: ListViewDragHandleProps) {
  const {slots} = use(ListViewContext);

  return (
    <Button
      {...props}
      isIconOnly
      className={composeTwRenderProps(className, slots?.dragHandle())}
      data-slot="list-view-drag-handle"
      size="sm"
      slot="drag"
      variant="ghost"
    >
      {children ?? <IconGripVertical />}
    </Button>
  );
}

/* -------------------------------------------------------------------------------------------------
 * ListView Content — the stacked title/description column of a row.
 * -----------------------------------------------------------------------------------------------*/
interface ListViewContentProps extends ComponentPropsWithRef<"div"> {}

function ListViewContent({className, ...props}: ListViewContentProps) {
  const {slots} = use(ListViewContext);

  return (
    <div className={slots?.content({class: className})} data-slot="list-view-content" {...props} />
  );
}

/* -------------------------------------------------------------------------------------------------
 * ListView Title / Description
 * -----------------------------------------------------------------------------------------------*/
interface ListViewTitleProps extends ComponentPropsWithRef<"span"> {}

function ListViewTitle({className, ...props}: ListViewTitleProps) {
  const {slots} = use(ListViewContext);

  return (
    <span className={slots?.title({class: className})} data-slot="list-view-title" {...props} />
  );
}

interface ListViewDescriptionProps extends ComponentPropsWithRef<"span"> {}

function ListViewDescription({className, ...props}: ListViewDescriptionProps) {
  const {slots} = use(ListViewContext);

  return (
    <span
      className={slots?.description({class: className})}
      data-slot="list-view-description"
      {...props}
    />
  );
}

ListViewRoot.displayName = "SY INC.ListView";
ListViewItem.displayName = "SY INC.ListView.Item";
ListViewSection.displayName = "SY INC.ListView.Section";
ListViewHeader.displayName = "SY INC.ListView.Header";
ListViewSelection.displayName = "SY INC.ListView.Selection";
ListViewDragHandle.displayName = "SY INC.ListView.DragHandle";
ListViewContent.displayName = "SY INC.ListView.Content";
ListViewTitle.displayName = "SY INC.ListView.Title";
ListViewDescription.displayName = "SY INC.ListView.Description";

export {
  ListViewRoot,
  ListViewItem,
  ListViewSection,
  ListViewHeader,
  ListViewSelection,
  ListViewDragHandle,
  ListViewContent,
  ListViewTitle,
  ListViewDescription,
};
export type {
  ListViewRootProps,
  ListViewItemProps,
  ListViewSectionProps,
  ListViewHeaderProps,
  ListViewSelectionProps,
  ListViewDragHandleProps,
  ListViewContentProps,
  ListViewTitleProps,
  ListViewDescriptionProps,
};

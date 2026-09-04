"use client";

import type {ItemCardGroupVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef, CSSProperties} from "react";

import {itemCardGroupVariants} from "@sy-inc/styles";

// Header, title and description slots never vary, so the class map is a module constant.
const {description, header, title} = itemCardGroupVariants();

export interface ItemCardGroupRootProps
  extends ComponentPropsWithRef<"div">, ItemCardGroupVariants {
  /** Number of grid columns when `layout="grid"`. @default 2 */
  columns?: number;
}

export type ItemCardGroupHeaderProps = ComponentPropsWithRef<"div">;

export type ItemCardGroupTitleProps = ComponentPropsWithRef<"h3">;

export type ItemCardGroupDescriptionProps = ComponentPropsWithRef<"p">;

const ItemCardGroupRoot = ({
  className,
  columns = 2,
  layout = "list",
  style,
  variant = "default",
  ...props
}: ItemCardGroupRootProps) => (
  <div
    data-slot="item-card-group"
    role="group"
    {...props}
    className={itemCardGroupVariants({layout, variant}).base({className})}
    style={
      layout === "grid"
        ? ({...style, "--item-card-group-columns": columns} as CSSProperties)
        : style
    }
  />
);

const ItemCardGroupHeader = ({className, ...props}: ItemCardGroupHeaderProps) => (
  <div data-slot="item-card-group-header" {...props} className={header({className})} />
);

const ItemCardGroupTitle = ({className, ...props}: ItemCardGroupTitleProps) => (
  <h3 data-slot="item-card-group-title" {...props} className={title({className})} />
);

const ItemCardGroupDescription = ({className, ...props}: ItemCardGroupDescriptionProps) => (
  <p data-slot="item-card-group-description" {...props} className={description({className})} />
);

ItemCardGroupRoot.displayName = "SY INC.ItemCardGroup";
ItemCardGroupHeader.displayName = "SY INC.ItemCardGroup.Header";
ItemCardGroupTitle.displayName = "SY INC.ItemCardGroup.Title";
ItemCardGroupDescription.displayName = "SY INC.ItemCardGroup.Description";

export {ItemCardGroupRoot, ItemCardGroupHeader, ItemCardGroupTitle, ItemCardGroupDescription};

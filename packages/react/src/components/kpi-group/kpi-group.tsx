"use client";

import type {KPIGroupVariants} from "@sy-inc/styles";
import type {ComponentPropsWithRef} from "react";

import {kpiGroupVariants} from "@sy-inc/styles";
import {SeparatorContext} from "react-aria-components/Separator";

// Orientation is the only input and it has two values, so both class maps are resolved once.
const slots = {
  horizontal: kpiGroupVariants({orientation: "horizontal"}),
  vertical: kpiGroupVariants({orientation: "vertical"}),
};

export interface KPIGroupRootProps extends ComponentPropsWithRef<"div">, KPIGroupVariants {}

const KPIGroupRoot = ({
  className,
  orientation = "horizontal",
  role = "group",
  ...props
}: KPIGroupRootProps) => (
  // Separators run across the group's flow direction, same pattern as Toolbar.
  <SeparatorContext.Provider
    value={{orientation: orientation === "horizontal" ? "vertical" : "horizontal"}}
  >
    <div
      {...props}
      className={slots[orientation].base({className})}
      data-slot="kpi-group"
      role={role}
    />
  </SeparatorContext.Provider>
);

KPIGroupRoot.displayName = "SY INC.KPIGroup";

export {KPIGroupRoot};

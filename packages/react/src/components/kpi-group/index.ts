import type {ComponentProps} from "react";

import {KPIGroupRoot} from "./kpi-group";

export const KPIGroup = Object.assign(KPIGroupRoot, {
  Root: KPIGroupRoot,
});

export type KPIGroup = {
  Props: ComponentProps<typeof KPIGroupRoot>;
  RootProps: ComponentProps<typeof KPIGroupRoot>;
};

export {KPIGroupRoot};
export type {KPIGroupRootProps, KPIGroupRootProps as KPIGroupProps} from "./kpi-group";
export {kpiGroupVariants} from "@sy-inc/styles";
export type {KPIGroupVariants} from "@sy-inc/styles";

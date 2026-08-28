import type {TableColumnDefinition, TableColumnGeometry} from "./table-column-geometry";
import type {Key} from "@react-types/shared";

import {createContext} from "react";

export interface TableManagedColumnsContextValue {
  definitions: ReadonlyMap<Key, TableColumnDefinition>;
  geometry: TableColumnGeometry;
  setColumnWidths: (widths: ReadonlyMap<Key, number>) => void;
}

export const TableManagedColumnsContext = createContext<TableManagedColumnsContextValue | null>(
  null,
);
export const TableGeometryModeContext = createContext<"native" | "virtualized">("native");

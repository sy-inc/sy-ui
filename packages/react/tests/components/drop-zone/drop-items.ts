import type {DropEvent, DropItem, FileDropItem} from "@react-types/shared";

/** Builds the RAC file item shape `addFiles` accepts. */
export const createFileDropItem = (file: File): FileDropItem => ({
  getFile: async () => file,
  getText: async () => file.text(),
  kind: "file",
  name: file.name,
  type: file.type,
});

/** Builds a RAC directory item whose entries are walked recursively. */
export const createDirectoryDropItem = (name: string, entries: DropItem[]): DropItem => ({
  getEntries: async function* () {
    for (const entry of entries) yield entry as FileDropItem;
  },
  kind: "directory",
  name,
});

/** Builds the RAC drop event shape `addFiles` accepts. */
export const createDropEvent = (items: DropItem[]): DropEvent => ({
  dropOperation: "copy",
  items,
  type: "drop",
  x: 0,
  y: 0,
});

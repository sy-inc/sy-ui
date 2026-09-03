const SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** Human readable file size, e.g. `2.4 MB`. */
export const formatFileSize = (size: number) => {
  if (!Number.isFinite(size) || size <= 0) return "0 B";

  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), SIZE_UNITS.length - 1);
  const value = size / 1024 ** unitIndex;

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${SIZE_UNITS[unitIndex]}`;
};

/** Short uppercase format label for `DropZone.FileFormatIcon`, e.g. `PNG`. */
export const formatFileType = (type?: string, name?: string) => {
  const extension = name?.includes(".") ? name.split(".").at(-1)?.trim() : undefined;

  if (extension) return extension.toUpperCase();

  const subtype = type?.split("/").at(-1)?.split("+").at(0)?.trim();

  return subtype ? subtype.toUpperCase() : "FILE";
};

export type DropZoneFileFormatColor = "accent" | "danger" | "default" | "success" | "warning";

const FILE_FORMAT_COLORS: Record<string, DropZoneFileFormatColor> = {
  CSV: "success",
  DOC: "accent",
  DOCX: "accent",
  KEY: "warning",
  NUMBERS: "success",
  ODP: "warning",
  ODS: "success",
  ODT: "accent",
  PDF: "danger",
  PPT: "warning",
  PPTX: "warning",
  RTF: "accent",
  XLS: "success",
  XLSX: "success",
};

/** Fixed color per format label, e.g. `PDF` is always `"danger"` (red). Falls back to `"default"`
 * for formats without a dedicated color. */
export const getFileFormatColor = (format: string): DropZoneFileFormatColor =>
  FILE_FORMAT_COLORS[format.toUpperCase()] ?? "default";

const IMAGE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "ico",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "tif",
  "tiff",
  "webp",
]);

/** Files a browser can render in an `<img>`. Falls back to the extension when the type is empty. */
export const isImageFile = (file: {name: string; type: string}) => {
  if (file.type.startsWith("image/")) return true;

  const extension = file.name.split(".").at(-1)?.toLowerCase().trim();

  return extension ? IMAGE_EXTENSIONS.has(extension) : false;
};

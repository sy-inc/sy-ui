export const STRICT_MODE_ADDON_ID = "sy-inc-strict-mode-addon";
export const STRICT_MODE_GLOBAL_TYPE_ID = "sy-inc-strict-mode";
export const STRICT_MODE_PARAM_KEY = "sy-inc-strict-mode";

export const STRICT_MODE_VALUES = ["true", "false"] as const;
export type StrictModeKey = (typeof STRICT_MODE_VALUES)[number];

export const DEFAULT_STRICT_MODE: StrictModeKey = "true";

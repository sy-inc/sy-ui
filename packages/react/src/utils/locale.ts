// Server-safe copy of react-aria's `isRTL` (react-aria/src/i18n/utils.ts, Apache-2.0).
// react-aria only exposes it through client-only entry points, so Server Components
// (e.g. a root layout setting `<html dir>`) could not call it.
const RTL_SCRIPTS = new Set([
  "Arab",
  "Syrc",
  "Samr",
  "Mand",
  "Thaa",
  "Mend",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Hebr",
]);
const RTL_LANGS = new Set([
  "ae",
  "ar",
  "arc",
  "bcc",
  "bqi",
  "ckb",
  "dv",
  "fa",
  "glk",
  "he",
  "ku",
  "mzn",
  "nqo",
  "pnb",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

/** Whether the locale is written right-to-left. */
export function isRTL(localeString: string): boolean {
  if (Intl.Locale) {
    const locale = new Intl.Locale(localeString).maximize() as Intl.Locale & {
      getTextInfo?: () => {direction: string};
      textInfo?: {direction: string};
    };
    const textInfo =
      typeof locale.getTextInfo === "function" ? locale.getTextInfo() : locale.textInfo;

    if (textInfo) return textInfo.direction === "rtl";
    if (locale.script) return RTL_SCRIPTS.has(locale.script);
  }

  return RTL_LANGS.has(localeString.split("-")[0]!);
}

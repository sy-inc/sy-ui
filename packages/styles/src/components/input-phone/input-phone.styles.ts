import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const inputPhoneVariants = tv({
  slots: {
    base: "input-phone",
    countryCode: "input-phone__country-code",
    countryDialCode: "input-phone__country-dial-code",
    countryDisplay: "input-phone__country-display",
    countryFlag: "input-phone__country-flag",
    countryList:
      "input-phone__country-list scroll-shadow scroll-shadow--vertical scroll-shadow--fade",
    countryName: "input-phone__country-name",
    countryPopover: "input-phone__country-popover",
    countryPrefix: "input-phone__country-prefix",
    countryTrigger: "input-phone__country-trigger",
    // The phone input is an input-group input, so it reuses the shared field styles.
    input: "input-group__input input-phone__input",
  },
});

export type InputPhoneVariants = VariantProps<typeof inputPhoneVariants>;

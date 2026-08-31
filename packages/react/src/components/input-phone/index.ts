import type {ComponentProps} from "react";

import {
  InputPhoneCountryList,
  InputPhoneCountrySearch,
  InputPhoneCountrySelect,
  InputPhoneInput,
  InputPhoneRoot,
} from "./input-phone";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const InputPhone = Object.assign(InputPhoneRoot, {
  Root: InputPhoneRoot,
  CountrySelect: InputPhoneCountrySelect,
  CountrySearch: InputPhoneCountrySearch,
  CountryList: InputPhoneCountryList,
  Input: InputPhoneInput,
});

export type InputPhone = {
  Props: ComponentProps<typeof InputPhoneRoot>;
  RootProps: ComponentProps<typeof InputPhoneRoot>;
  CountrySelectProps: ComponentProps<typeof InputPhoneCountrySelect>;
  CountrySearchProps: ComponentProps<typeof InputPhoneCountrySearch>;
  CountryListProps: ComponentProps<typeof InputPhoneCountryList>;
  InputProps: ComponentProps<typeof InputPhoneInput>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {
  InputPhoneCountryList,
  InputPhoneCountrySearch,
  InputPhoneCountrySelect,
  InputPhoneInput,
  InputPhoneRoot,
};

export type {
  InputPhoneRootProps,
  InputPhoneRootProps as InputPhoneProps,
  InputPhoneCountrySelectProps,
  InputPhoneCountrySearchProps,
  InputPhoneCountryListProps,
  InputPhoneInputProps,
} from "./input-phone";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {inputPhoneVariants} from "@sy-inc/styles";

export type {InputPhoneVariants} from "@sy-inc/styles";

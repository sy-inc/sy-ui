import type {ComponentProps} from "react";

import React from "react";

import {InputPhone} from "@/components/input-phone";

type PhoneFieldProps = Omit<ComponentProps<typeof InputPhone>, "children"> & {
  inputProps?: ComponentProps<typeof InputPhone.Input>;
};

/** The default composition: country select in the prefix, phone input beside it. */
export const PhoneField = ({inputProps, ...props}: PhoneFieldProps) => (
  <InputPhone defaultCountry="US" {...props}>
    <InputPhone.CountrySelect />
    <InputPhone.Input aria-label="Phone number" {...inputProps} />
  </InputPhone>
);

/** A controlled field that mirrors both the value and the country back into state. */
export const ControlledPhoneField = ({onChange, onCountryChange, ...props}: PhoneFieldProps) => {
  const [value, setValue] = React.useState<string | undefined>(props.defaultValue);
  const [country, setCountry] = React.useState(props.defaultCountry);

  return (
    <PhoneField
      {...props}
      country={country}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      onCountryChange={(next) => {
        setCountry(next);
        onCountryChange?.(next);
      }}
    />
  );
};

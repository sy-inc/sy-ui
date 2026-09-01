import {InputPhone} from "@sy-inc/react/input-phone";

export function Basic() {
  return (
    <div className="flex w-full max-w-80 flex-col gap-4">
      <InputPhone defaultCountry="US">
        <InputPhone.CountrySelect />
        <InputPhone.Input aria-label="Phone number" placeholder="Enter phone number" />
      </InputPhone>
      <InputPhone isDisabled defaultValue="+442071838750">
        <InputPhone.CountrySelect />
        <InputPhone.Input aria-label="Disabled phone number" />
      </InputPhone>
      <InputPhone isInvalid defaultCountry="US" defaultValue="+1202">
        <InputPhone.CountrySelect />
        <InputPhone.Input aria-label="Invalid phone number" />
      </InputPhone>
    </div>
  );
}

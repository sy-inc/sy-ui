import {InputPhone} from "@sy-inc/react/input-phone";

export function Basic() {
  return (
    <div className="flex w-full max-w-80 flex-col gap-4">
      <InputPhone defaultCountry="CN">
        <InputPhone.CountrySelect />
        <InputPhone.Input aria-label="电话号码" placeholder="输入电话号码" />
      </InputPhone>
      <InputPhone isDisabled defaultValue="+442071838750">
        <InputPhone.CountrySelect />
        <InputPhone.Input aria-label="禁用的电话号码" />
      </InputPhone>
      <InputPhone isInvalid defaultCountry="CN" defaultValue="+86138">
        <InputPhone.CountrySelect />
        <InputPhone.Input aria-label="无效的电话号码" />
      </InputPhone>
    </div>
  );
}

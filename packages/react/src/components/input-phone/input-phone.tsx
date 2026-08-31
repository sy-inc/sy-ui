"use client";

import type {ComponentPropsWithRef, ReactNode, Ref} from "react";
import type {Country} from "react-phone-number-input";

import {inputPhoneVariants} from "@sy-inc/styles";
import React, {createContext, use} from "react";
import {Autocomplete as AutocompletePrimitive, useFilter} from "react-aria-components/Autocomplete";
import {OverlayTriggerStateContext} from "react-aria-components/Dialog";
import {useLocale} from "react-aria-components/I18nProvider";
import PhoneInput, {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
} from "react-phone-number-input/input";

import {composeTwRenderProps} from "../../utils/compose";
import {Button} from "../button";
import {EmptyState} from "../empty-state";
import {InputGroup} from "../input-group";
import {ListBox} from "../list-box";
import {Popover} from "../popover";
import {SearchField} from "../search-field";

/* -------------------------------------------------------------------------------------------------
 * Country data
 * -----------------------------------------------------------------------------------------------*/
type CountryOption = {
  callingCode: string;
  code: Country;
  name: string;
};

const COUNTRY_CODES = getCountries();

/** 🇦 (U+1F1E6) minus "A", so an ISO code maps onto the regional indicator block. */
const REGIONAL_INDICATOR_OFFSET = 127397;

const countryFlag = (code: string) =>
  String.fromCodePoint(
    ...[...code.toUpperCase()].map((letter) => REGIONAL_INDICATOR_OFFSET + letter.charCodeAt(0)),
  );

const countryOptionCache = new Map<string, CountryOption[]>();

/**
 * `Intl.DisplayNames` resolves every code `getCountries()` returns, so the list follows
 * the app locale without bundling a name table. Naming and sorting 245 entries is not
 * free, so each locale is built once.
 */
const countryOptions = (locale: string) => {
  let options = countryOptionCache.get(locale);

  if (!options) {
    const displayNames = new Intl.DisplayNames([locale], {type: "region"});

    // `getCountries()` is ordered by ISO code, which is not the order the names read in.
    options = COUNTRY_CODES.map((code) => ({
      callingCode: getCountryCallingCode(code),
      code,
      name: displayNames.of(code) ?? code,
    })).sort((a, b) => a.name.localeCompare(b.name, locale));

    countryOptionCache.set(locale, options);
  }

  return options;
};

const countryOption = (locale: string, code: Country | undefined) =>
  code ? countryOptions(locale).find((option) => option.code === code) : undefined;

/* -------------------------------------------------------------------------------------------------
 * InputPhone Context
 * -----------------------------------------------------------------------------------------------*/
type InputPhoneContextValue = {
  country?: Country;
  form?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  locale: string;
  name?: string;
  onCountrySelect: (country: Country) => void;
  onValueChange: (value: string | undefined) => void;
  slots: ReturnType<typeof inputPhoneVariants>;
  value?: string;
};

const InputPhoneContext = createContext<InputPhoneContextValue>({
  locale: "en-US",
  onCountrySelect: () => {},
  onValueChange: () => {},
  slots: inputPhoneVariants(),
});

/* -------------------------------------------------------------------------------------------------
 * InputPhone Root
 * -----------------------------------------------------------------------------------------------*/
interface InputPhoneRootProps extends Omit<
  ComponentPropsWithRef<typeof InputGroup>,
  "children" | "defaultValue" | "onChange" | "value"
> {
  children: ReactNode;
  /** The controlled ISO 3166-1 alpha-2 country used for national formatting. */
  country?: Country;
  /** The initial country, used until the value or the user selects another one. */
  defaultCountry?: Country;
  /** The uncontrolled E.164 phone number. */
  defaultValue?: string;
  /** Associates the submitted value with a form elsewhere in the document. */
  form?: string;
  /** Whether the field is required. */
  isRequired?: boolean;
  /** Name used when the E.164 value is submitted with a form. */
  name?: string;
  /** Called with the E.164 phone number, or `undefined` when cleared. */
  onChange?: (value: string | undefined) => void;
  /** Called when the country changes, by selection or by the value's calling code. */
  onCountryChange?: (country: Country) => void;
  /** The controlled E.164 phone number. */
  value?: string;
}

const InputPhoneRoot = ({
  children,
  className,
  country: countryProp,
  defaultCountry,
  defaultValue,
  form,
  fullWidth = true,
  isDisabled,
  isInvalid,
  isReadOnly,
  isRequired,
  name,
  onChange,
  onCountryChange,
  value,
  ...props
}: InputPhoneRootProps) => {
  const slots = React.useMemo(() => inputPhoneVariants(), []);
  const {locale} = useLocale();
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const [selectedCountry, setSelectedCountry] = React.useState(defaultCountry);
  const phoneValue = value === undefined ? uncontrolledValue : value;

  /**
   * An E.164 value carries its own country, so a stored `+44…` has to show the UK
   * instead of whatever `defaultCountry` happened to be. Selection only decides the
   * country while the value has not claimed one.
   */
  const parsedCountry = React.useMemo(
    () => (phoneValue ? parsePhoneNumber(phoneValue)?.country : undefined),
    [phoneValue],
  );
  const country = countryProp ?? parsedCountry ?? selectedCountry ?? defaultCountry;

  const handleValueChange = (nextValue: string | undefined) => {
    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue);
  };

  const handleCountrySelect = (nextCountry: Country) => {
    setSelectedCountry(nextCountry);
    onCountryChange?.(nextCountry);

    // Re-anchor digits already typed to the new calling code, otherwise the value
    // would keep claiming the previous country and immediately override the choice.
    if (phoneValue) {
      const national = parsePhoneNumber(phoneValue)?.nationalNumber;

      handleValueChange(national ? `+${getCountryCallingCode(nextCountry)}${national}` : undefined);
    }
  };

  return (
    <InputPhoneContext
      value={{
        country,
        form,
        isDisabled,
        isInvalid,
        isReadOnly,
        isRequired,
        locale,
        name,
        onCountrySelect: handleCountrySelect,
        onValueChange: handleValueChange,
        slots,
        value: phoneValue,
      }}
    >
      {/* The field chrome — border, hover, focus, invalid, autofill — is InputGroup's,
          and RAC's Group turns these into the `data-*` hooks input-group.css targets. */}
      <InputGroup
        {...props}
        className={composeTwRenderProps(className, slots.base())}
        fullWidth={fullWidth}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        isReadOnly={isReadOnly}
      >
        {children}
      </InputGroup>
    </InputPhoneContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputPhone Input
 * -----------------------------------------------------------------------------------------------*/
interface InputPhoneInputProps extends Omit<
  ComponentPropsWithRef<"input">,
  | "autoComplete"
  | "defaultValue"
  | "disabled"
  | "form"
  | "name"
  | "onChange"
  | "readOnly"
  | "required"
  | "type"
  | "value"
> {}

const InputPhoneInput = ({className, ref, ...props}: InputPhoneInputProps) => {
  const {
    country,
    form,
    isDisabled,
    isInvalid,
    isReadOnly,
    isRequired,
    name,
    onValueChange,
    slots,
    value,
  } = use(InputPhoneContext);

  return (
    <>
      {/* `type="tel"` and `autoComplete="tel"` are PhoneInput's own defaults. The
          `input-group-input` slot activates InputGroup's focus and autofill rules. */}
      <PhoneInput
        aria-invalid={isInvalid || undefined}
        {...props}
        ref={ref as Ref<unknown>}
        className={slots.input({className})}
        country={country}
        data-slot="input-group-input"
        disabled={isDisabled}
        readOnly={isReadOnly}
        required={isRequired}
        value={value}
        onChange={onValueChange}
      />
      {name ? (
        // The visible input shows national formatting, so forms submit the E.164 value
        // through a synchronized hidden control instead.
        <input disabled={isDisabled} form={form} name={name} type="hidden" value={value ?? ""} />
      ) : null}
    </>
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputPhone CountrySelect
 * -----------------------------------------------------------------------------------------------*/
interface InputPhoneCountrySelectProps extends Omit<
  ComponentPropsWithRef<typeof Button>,
  "children"
> {
  /** Popover contents. Defaults to `CountrySearch` followed by `CountryList`. */
  children?: ReactNode;
}

const InputPhoneCountrySelect = ({children, className, ...props}: InputPhoneCountrySelectProps) => {
  const {country, isDisabled, isReadOnly, locale, slots} = use(InputPhoneContext);
  const {contains} = useFilter({sensitivity: "base"});
  const option = countryOption(locale, country);

  return (
    <InputGroup.Prefix className={slots.countryPrefix()}>
      {/* Popover is a DialogTrigger: it wires aria-expanded/controls onto the Button. */}
      <Popover>
        <Button
          // Popover supplies aria-expanded/controls; RAC leaves haspopup to the author.
          aria-haspopup="dialog"
          aria-label={option ? `Change country, ${option.name}` : "Select country"}
          isDisabled={isDisabled || isReadOnly}
          variant="ghost"
          {...props}
          className={composeTwRenderProps(className, slots.countryTrigger())}
          data-slot="input-phone-country-trigger"
        >
          <span aria-hidden="true" className={slots.countryFlag()}>
            {option ? countryFlag(option.code) : "🌐"}
          </span>
          {option ? <span className={slots.countryCode()}>+{option.callingCode}</span> : null}
        </Button>
        <Popover.Content className={slots.countryPopover()} data-slot="input-phone-country-popover">
          <Popover.Dialog>
            {/* Owns the search value, filtering, virtual focus and aria-activedescendant. */}
            <AutocompletePrimitive filter={contains}>
              {children ?? (
                <>
                  <InputPhoneCountrySearch />
                  <InputPhoneCountryList />
                </>
              )}
            </AutocompletePrimitive>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </InputGroup.Prefix>
  );
};

/* -------------------------------------------------------------------------------------------------
 * InputPhone CountrySearch
 * -----------------------------------------------------------------------------------------------*/
interface InputPhoneCountrySearchProps extends ComponentPropsWithRef<typeof SearchField.Input> {
  /** Accessible name of the search box. */
  "aria-label"?: string;
}

const InputPhoneCountrySearch = ({
  "aria-label": ariaLabel = "Search countries",
  ...props
}: InputPhoneCountrySearchProps) => (
  <SearchField autoFocus aria-label={ariaLabel} variant="secondary">
    <SearchField.Group>
      <SearchField.SearchIcon />
      <SearchField.Input data-slot="input-phone-country-search" {...props} />
      <SearchField.ClearButton />
    </SearchField.Group>
  </SearchField>
);

/* -------------------------------------------------------------------------------------------------
 * InputPhone CountryList
 * -----------------------------------------------------------------------------------------------*/
interface InputPhoneCountryListProps extends Omit<
  ComponentPropsWithRef<typeof ListBox<CountryOption>>,
  "children" | "items" | "selectedKeys" | "selectionMode" | "onSelectionChange"
> {}

const InputPhoneCountryList = ({
  className,
  renderEmptyState = () => <EmptyState>No countries found</EmptyState>,
  ...props
}: InputPhoneCountryListProps) => {
  const {country, locale, onCountrySelect, slots} = use(InputPhoneContext);
  const overlay = use(OverlayTriggerStateContext);

  return (
    // `disallowEmptySelection` keeps re-picking the current country from clearing it,
    // and leaves Escape to the popover instead of the list's clear-selection default.
    <ListBox
      disallowEmptySelection
      aria-label="Countries"
      renderEmptyState={renderEmptyState}
      {...props}
      className={slots.countryList({className})}
      data-slot="input-phone-country-list"
      items={countryOptions(locale)}
      selectedKeys={country ? [country] : []}
      selectionMode="single"
      onSelectionChange={(keys) => {
        const selected = keys === "all" ? undefined : (keys.values().next().value as Country);

        if (selected) {
          onCountrySelect(selected);
          overlay?.close();
        }
      }}
    >
      {(option) => (
        // The text value matches both the name and the `+` code, and drives typeahead.
        <ListBox.Item id={option.code} textValue={`${option.name} +${option.callingCode}`}>
          <span aria-hidden="true" className={slots.countryFlag()}>
            {countryFlag(option.code)}
          </span>
          <span className={slots.countryName()}>{option.name}</span>
          <span className={slots.countryDialCode()}>+{option.callingCode}</span>
        </ListBox.Item>
      )}
    </ListBox>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  InputPhoneRoot,
  InputPhoneInput,
  InputPhoneCountrySelect,
  InputPhoneCountrySearch,
  InputPhoneCountryList,
};

export type {
  InputPhoneRootProps,
  InputPhoneInputProps,
  InputPhoneCountrySelectProps,
  InputPhoneCountrySearchProps,
  InputPhoneCountryListProps,
};

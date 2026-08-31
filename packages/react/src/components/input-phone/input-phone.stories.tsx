import type {Meta, StoryObj} from "@storybook/react";
import type {Country} from "react-phone-number-input";

import React from "react";
import {ListLayout, Virtualizer} from "react-aria-components/Virtualizer";

import {Description} from "../description";
import {EmptyState} from "../empty-state";
import {Label} from "../label";

import {InputPhone} from "./index";

const meta: Meta<typeof InputPhone> = {
  title: "Components/InputPhone",
  component: InputPhone,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof InputPhone>;

export const Default: Story = {
  render: () => (
    <InputPhone className="w-80" defaultCountry="US">
      <InputPhone.CountrySelect />
      <InputPhone.Input aria-label="Phone number" placeholder="Enter phone number" />
    </InputPhone>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-1.5">
      <Label htmlFor="story-phone">Phone number</Label>
      <InputPhone defaultCountry="US" name="phone">
        <InputPhone.CountrySelect />
        <InputPhone.Input id="story-phone" placeholder="Enter phone number" />
      </InputPhone>
      <Description>Include the country code when you enter a number.</Description>
    </div>
  ),
};

/** The value carries its own country, so a stored `+44…` opens on the UK. */
export const CountryFromValue: Story = {
  render: () => (
    <InputPhone className="w-80" defaultCountry="US" defaultValue="+442071838750">
      <InputPhone.CountrySelect />
      <InputPhone.Input aria-label="Phone number from value" />
    </InputPhone>
  ),
};

export const Disabled: Story = {
  render: () => (
    <InputPhone isDisabled className="w-80" defaultValue="+12025550123">
      <InputPhone.CountrySelect />
      <InputPhone.Input aria-label="Disabled phone number" />
    </InputPhone>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <InputPhone isReadOnly className="w-80" defaultValue="+442071838750">
      <InputPhone.CountrySelect />
      <InputPhone.Input aria-label="Read-only phone number" />
    </InputPhone>
  ),
};

export const Invalid: Story = {
  render: () => (
    <InputPhone isInvalid className="w-80" defaultCountry="US" defaultValue="+1202">
      <InputPhone.CountrySelect />
      <InputPhone.Input aria-label="Invalid phone number" />
    </InputPhone>
  ),
};

const ControlledExample = () => {
  const [value, setValue] = React.useState<string | undefined>("+12025550123");
  const [country, setCountry] = React.useState<Country | undefined>("US");

  return (
    <div className="flex w-80 flex-col gap-2">
      <InputPhone country={country} value={value} onChange={setValue} onCountryChange={setCountry}>
        <InputPhone.CountrySelect />
        <InputPhone.Input aria-label="Controlled phone number" />
      </InputPhone>
      <Description>
        {country} — {value ?? "(empty)"}
      </Description>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

/** Every part is composable, so the popover's copy is ordinary props. */
export const CustomCountryPopover: Story = {
  render: () => (
    <InputPhone className="w-80" defaultCountry="DE">
      <InputPhone.CountrySelect aria-label="Choose a dialling code">
        <InputPhone.CountrySearch aria-label="Filter countries" placeholder="Country or +code" />
        <InputPhone.CountryList
          aria-label="Dialling codes"
          renderEmptyState={() => <EmptyState>Nothing matches that search</EmptyState>}
        />
      </InputPhone.CountrySelect>
      <InputPhone.Input aria-label="Phone number with a custom popover" />
    </InputPhone>
  ),
};

/**
 * Sizing is plain classNames on the parts, so there is no `size` prop to learn.
 * The input takes no `px`: the prefix owns the start padding and input-group already
 * sets the end padding.
 */
export const CustomSize: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* `min-h-8` too: `.input-group` floors every field at `min-h-9`. */}
      <InputPhone className="h-8 min-h-8 w-80 text-xs" defaultCountry="US">
        <InputPhone.CountrySelect className="px-2 text-xs" />
        <InputPhone.Input aria-label="Small phone number" className="py-1 text-sm" />
      </InputPhone>
      <InputPhone className="w-80" defaultCountry="US">
        <InputPhone.CountrySelect />
        <InputPhone.Input aria-label="Default phone number" />
      </InputPhone>
      <InputPhone className="h-12 w-80 text-base" defaultCountry="US">
        <InputPhone.CountrySelect className="px-4 text-base" />
        <InputPhone.Input aria-label="Large phone number" className="py-3 text-lg" />
      </InputPhone>
    </div>
  ),
};

/** The list is a plain ListBox, so callers can virtualize it without a new prop. */
export const VirtualizedCountryList: Story = {
  render: () => (
    <InputPhone className="w-80" defaultCountry="US">
      <InputPhone.CountrySelect>
        <InputPhone.CountrySearch />
        <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 36}}>
          <InputPhone.CountryList />
        </Virtualizer>
      </InputPhone.CountrySelect>
      <InputPhone.Input aria-label="Phone number with a virtualized list" />
    </InputPhone>
  ),
};

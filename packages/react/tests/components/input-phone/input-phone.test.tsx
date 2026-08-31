import type {ComponentProps} from "react";

import {cleanup, fireEvent, render, runAllTimers, screen, setupUser} from "@sy-inc/testing/helpers";
import React from "react";

import {InputPhone} from "@/components/input-phone";

import {ControlledPhoneField, PhoneField} from "./fixtures";

const renderPhone = (props: ComponentProps<typeof PhoneField> = {}) =>
  render(<PhoneField {...props} />);

const openCountries = async (user: ReturnType<typeof setupUser>, name: string) => {
  await user.click(screen.getByRole("button", {name}));
  runAllTimers();
};

describe("InputPhone", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    user = setupUser({advanceTimers: vi.advanceTimersByTime});
  });

  afterEach(() => {
    cleanup();
    runAllTimers();
    vi.useRealTimers();
  });

  it("renders a labelled tel input inside a shared input group", () => {
    renderPhone({name: "phone", inputProps: {placeholder: "Enter phone number"}});

    const input = screen.getByRole("textbox", {name: "Phone number"});

    expect(input).toHaveAttribute("type", "tel");
    expect(input).toHaveAttribute("autocomplete", "tel");
    expect(input).not.toHaveAttribute("name");
    expect(input).toHaveAttribute("placeholder", "Enter phone number");
    expect(input).toHaveAttribute("data-slot", "input-group-input");

    // The root is the input group itself; there is no extra wrapper element.
    const group = document.querySelector('[data-slot="input-group"]');

    expect(group).toHaveClass("input-phone");
    expect(group).toBe(input.closest('[data-slot="input-group"]'));
    expect(document.querySelectorAll('[data-slot="input-group"]')).toHaveLength(1);

    expect(screen.getByRole("button", {name: "Change country, United States"})).toHaveAttribute(
      "data-slot",
      "input-phone-country-trigger",
    );
  });

  it("supports E.164 default and uncontrolled onChange values", async () => {
    const onChange = vi.fn();

    renderPhone({defaultValue: "+12025550123", onChange});

    const input = screen.getByRole("textbox", {name: "Phone number"});

    expect(input).not.toHaveValue("");

    await user.clear(input);
    expect(onChange).toHaveBeenLastCalledWith(undefined);

    await user.type(input, "2025550123");
    expect(onChange).toHaveBeenLastCalledWith("+12025550123");
  });

  it("supports a controlled E.164 value and onChange", async () => {
    const onChange = vi.fn();

    render(<ControlledPhoneField defaultValue="+12025550123" onChange={onChange} />);

    const input = screen.getByRole("textbox", {name: "Phone number"});

    expect(input).not.toHaveValue("");

    await user.clear(input);
    expect(onChange).toHaveBeenLastCalledWith(undefined);

    await user.type(input, "2025550123");
    expect(onChange).toHaveBeenLastCalledWith("+12025550123");
  });

  it("derives the country from the value instead of trusting defaultCountry", () => {
    renderPhone({defaultCountry: "US", defaultValue: "+442071838750"});

    expect(
      screen.getByRole("button", {name: "Change country, United Kingdom"}),
    ).toBeInTheDocument();
  });

  it("exposes country as a controlled prop that outranks the value", () => {
    renderPhone({country: "DE", defaultCountry: "US", defaultValue: "+442071838750"});

    expect(screen.getByRole("button", {name: "Change country, Germany"})).toBeInTheDocument();
  });

  it("searches countries by name and calling code and selects one", async () => {
    const onCountryChange = vi.fn();

    renderPhone({onCountryChange});

    const trigger = screen.getByRole("button", {name: "Change country, United States"});

    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await openCountries(user, "Change country, United States");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector('[data-slot="input-phone-country-popover"]')).not.toBeNull();
    const dialog = screen.getByRole("dialog");
    const listbox = screen.getByRole("listbox", {name: "Countries"});

    expect(listbox).toHaveAttribute("data-slot", "input-phone-country-list");
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
    expect(listbox.id).not.toBe(dialog.id);

    const search = screen.getByRole("searchbox", {name: "Search countries"});

    expect(search).toHaveAttribute("aria-controls", listbox.id);
    fireEvent.change(search, {target: {value: "Germany"}});

    expect(screen.getByRole("option", {name: /Germany/})).toBeInTheDocument();
    expect(screen.queryByRole("option", {name: /United States/})).toBeNull();

    fireEvent.change(search, {target: {value: "49"}});

    const germany = screen.getByRole("option", {name: /Germany/});

    expect(germany).toBeInTheDocument();
    await user.click(germany);
    runAllTimers();

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onCountryChange).toHaveBeenCalledWith("DE");
    const selectedTrigger = screen.getByRole("button", {name: "Change country, Germany"});

    expect(selectedTrigger).toHaveAttribute("aria-expanded", "false");
  });

  it("re-anchors an existing number to the newly selected calling code", async () => {
    const onChange = vi.fn();

    renderPhone({defaultValue: "+12025550123", onChange});

    await openCountries(user, "Change country, United States");

    fireEvent.change(screen.getByRole("searchbox", {name: "Search countries"}), {
      target: {value: "Germany"},
    });
    await user.click(screen.getByRole("option", {name: /Germany/}));
    runAllTimers();

    expect(onChange).toHaveBeenLastCalledWith("+492025550123");
    expect(screen.getByRole("button", {name: "Change country, Germany"})).toBeInTheDocument();
  });

  it("renders countries in display-name order", async () => {
    renderPhone();

    await openCountries(user, "Change country, United States");

    const names = screen.getAllByRole("option").map((option) => option.textContent ?? "");

    // The source order is by ISO code, which would start Ascension Island / Andorra /
    // United Arab Emirates / Afghanistan instead.
    expect(names[0]).toContain("Afghanistan");
    expect(names[1]).toContain("Åland Islands");
    expect(names[2]).toContain("Albania");
    expect(names.at(-1)).toContain("Zimbabwe");
  });

  it("supports composing the popover with relabelled parts", async () => {
    render(
      <InputPhone defaultCountry="US">
        <InputPhone.CountrySelect aria-label="Pick a dialling code">
          <InputPhone.CountrySearch aria-label="Filter dialling codes" placeholder="Type a name" />
          <InputPhone.CountryList aria-label="Dialling codes" />
        </InputPhone.CountrySelect>
        <InputPhone.Input aria-label="Phone number" />
      </InputPhone>,
    );

    await openCountries(user, "Pick a dialling code");

    expect(screen.getByRole("listbox", {name: "Dialling codes"})).toBeInTheDocument();
    const search = screen.getByRole("searchbox", {name: "Filter dialling codes"});

    expect(search).toHaveAttribute("placeholder", "Type a name");
  });

  it("supports an empty state when no country matches", async () => {
    renderPhone();

    await openCountries(user, "Change country, United States");

    fireEvent.change(screen.getByRole("searchbox", {name: "Search countries"}), {
      target: {value: "zzzz"},
    });

    expect(screen.getByText("No countries found")).toBeInTheDocument();
  });

  it("supports isDisabled", () => {
    renderPhone({isDisabled: true});

    expect(screen.getByRole("textbox", {name: "Phone number"})).toBeDisabled();
    expect(screen.getByRole("button", {name: "Change country, United States"})).toBeDisabled();
    expect(document.querySelector('[data-slot="input-group"]')).toHaveAttribute(
      "data-disabled",
      "true",
    );
  });

  it("supports isReadOnly, isRequired, isInvalid, and ref", () => {
    const ref = React.createRef<HTMLInputElement>();

    render(
      <PhoneField
        isInvalid
        isReadOnly
        isRequired
        inputProps={{ref, "aria-label": "Phone number"}}
      />,
    );

    const input = screen.getByRole("textbox", {name: "Phone number"});
    const group = document.querySelector('[data-slot="input-group"]');

    expect(input).toHaveAttribute("readonly");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", {name: "Change country, United States"})).toBeDisabled();
    expect(group).toHaveAttribute("data-readonly", "true");
    expect(group).toHaveAttribute("data-invalid", "true");
    expect(ref.current).toBe(input);
  });

  it("submits E.164 values through named and externally associated forms", () => {
    render(
      <>
        <form data-testid="filled-form">
          <PhoneField
            defaultValue="+12025550123"
            inputProps={{"aria-label": "Filled phone number"}}
            name="phone"
          />
        </form>
        <form data-testid="empty-form">
          <PhoneField inputProps={{"aria-label": "Empty phone number"}} name="phone" />
        </form>
        <form data-testid="disabled-form">
          <PhoneField
            isDisabled
            inputProps={{"aria-label": "Disabled phone number"}}
            name="phone"
          />
        </form>
        <form data-testid="external-form" id="external-form" />
        <PhoneField
          defaultValue="+442071838750"
          form="external-form"
          inputProps={{"aria-label": "External phone number"}}
          name="external-phone"
        />
      </>,
    );

    expect(new FormData(screen.getByTestId("filled-form") as HTMLFormElement).get("phone")).toBe(
      "+12025550123",
    );
    expect(new FormData(screen.getByTestId("empty-form") as HTMLFormElement).get("phone")).toBe("");
    expect(new FormData(screen.getByTestId("disabled-form") as HTMLFormElement).has("phone")).toBe(
      false,
    );
    expect(
      new FormData(screen.getByTestId("external-form") as HTMLFormElement).get("external-phone"),
    ).toBe("+442071838750");
  });
});

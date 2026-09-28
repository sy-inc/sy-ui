import type {ReactNode} from "react";

import {parseDate} from "@internationalized/date";
import {render} from "@sy-inc/testing/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {
  Autocomplete,
  Calendar,
  CellColorPicker,
  CellSelect,
  CellSwitch,
  Checkbox,
  CheckboxButtonGroup,
  CheckboxGroup,
  ColorArea,
  ColorField,
  ComboBox,
  DateField,
  DatePicker,
  DateRangePicker,
  FieldError,
  Input,
  InputOTP,
  Label,
  ListBox,
  NumberField,
  Radio,
  RadioButtonGroup,
  RadioGroup,
  RangeCalendar,
  Rating,
  SearchField,
  Select,
  Switch,
  TextField,
  TimeField,
} from "@/components";
import {DropZone, useDropZoneState} from "@/components/drop-zone";
import {ImageField} from "@/components/image-field";
import {InputPhone} from "@/components/input-phone";

/**
 * Cross-component contract for the invalid state: every form control must turn red when invalid
 * (jsdom can't see CSS, so this runs in Chromium against the built stylesheet), link its
 * `FieldError`, and render no error while valid.
 */
const ERR = "Invalid value";

const options = (
  <ListBox>
    <ListBox.Item id="a" textValue="A">
      A
    </ListBox.Item>
  </ListBox>
);

const segments = (slot?: "start" | "end") => (
  <DateField.Input slot={slot}>{(s) => <DateField.Segment segment={s} />}</DateField.Input>
);

const UploadField = ({isInvalid}: {isInvalid: boolean}) => {
  const state = useDropZoneState({maxFiles: 1});

  return (
    <DropZone>
      <Label>Files</Label>
      <DropZone.Area
        {...state.getAreaProps()}
        aria-describedby={isInvalid ? "upload-error" : undefined}
        aria-label="Upload"
      >
        <DropZone.Slots state={state} />
      </DropZone.Area>
      <FieldError id="upload-error">{isInvalid && ERR}</FieldError>
    </DropZone>
  );
};

type Fixture = {
  render: (isInvalid: boolean) => ReactNode;
  /** The control has no invalid styling of its own (only the linked message). */
  noVisual?: boolean;
  /** The error is rendered by the component itself, not a linked `FieldError`. */
  noLink?: boolean;
};

const fixtures: Record<string, Fixture> = {
  Autocomplete: {
    render: (i) => (
      <Autocomplete isInvalid={i} selectionMode="single">
        <Label>L</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <FieldError>{ERR}</FieldError>
        <Autocomplete.Popover>{options}</Autocomplete.Popover>
      </Autocomplete>
    ),
  },
  Calendar: {
    render: (i) => (
      <Calendar aria-label="L" defaultValue={parseDate("2025-01-15")} isInvalid={i}>
        <Calendar.Grid>
          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
        </Calendar.Grid>
        <FieldError>{i && ERR}</FieldError>
      </Calendar>
    ),
  },
  CellColorPicker: {
    render: (i) => (
      <>
        <CellColorPicker defaultValue="#3B82F6" isInvalid={i}>
          <CellColorPicker.Trigger aria-describedby={i ? "color-error" : undefined}>
            <CellColorPicker.Label>L</CellColorPicker.Label>
          </CellColorPicker.Trigger>
          <CellColorPicker.Popover>
            <ColorArea
              aria-label="a"
              colorSpace="hsb"
              xChannel="saturation"
              yChannel="brightness"
            />
          </CellColorPicker.Popover>
        </CellColorPicker>
        <FieldError id="color-error">{i && ERR}</FieldError>
      </>
    ),
  },
  CellSelect: {
    render: (i) => (
      <CellSelect aria-label="L" isInvalid={i}>
        <CellSelect.Trigger>
          <CellSelect.Label>L</CellSelect.Label>
          <CellSelect.Value />
        </CellSelect.Trigger>
        <FieldError>{ERR}</FieldError>
        <CellSelect.Popover>{options}</CellSelect.Popover>
      </CellSelect>
    ),
  },
  CellSwitch: {noLink: true, render: (i) => <CellSwitch isInvalid={i}>S</CellSwitch>},
  Checkbox: {
    render: (i) => (
      <Checkbox isInvalid={i}>
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          C
        </Checkbox.Content>
        <FieldError>{ERR}</FieldError>
      </Checkbox>
    ),
  },
  CheckboxButtonGroup: {
    render: (i) => (
      <CheckboxButtonGroup isInvalid={i}>
        <CheckboxButtonGroup.Item value="a">A</CheckboxButtonGroup.Item>
        <FieldError>{ERR}</FieldError>
      </CheckboxButtonGroup>
    ),
  },
  CheckboxGroup: {
    render: (i) => (
      <CheckboxGroup isInvalid={i}>
        <Label>L</Label>
        <Checkbox value="a">
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            A
          </Checkbox.Content>
        </Checkbox>
        <FieldError>{ERR}</FieldError>
      </CheckboxGroup>
    ),
  },
  ColorField: {
    render: (i) => (
      <ColorField isInvalid={i}>
        <Label>L</Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
        <FieldError>{ERR}</FieldError>
      </ColorField>
    ),
  },
  ComboBox: {
    render: (i) => (
      <ComboBox isInvalid={i}>
        <Label>L</Label>
        <ComboBox.InputGroup>
          <Input />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <FieldError>{ERR}</FieldError>
        <ComboBox.Popover>{options}</ComboBox.Popover>
      </ComboBox>
    ),
  },
  DateField: {
    render: (i) => (
      <DateField isInvalid={i}>
        <Label>L</Label>
        <DateField.Group>{segments()}</DateField.Group>
        <FieldError>{ERR}</FieldError>
      </DateField>
    ),
  },
  DatePicker: {
    render: (i) => (
      <DatePicker isInvalid={i}>
        <Label>L</Label>
        <DateField.Group>{segments()}</DateField.Group>
        <FieldError>{ERR}</FieldError>
      </DatePicker>
    ),
  },
  DateRangePicker: {
    render: (i) => (
      <DateRangePicker isInvalid={i}>
        <Label>L</Label>
        <DateField.Group>
          {segments("start")}
          {segments("end")}
        </DateField.Group>
        <FieldError>{ERR}</FieldError>
      </DateRangePicker>
    ),
  },
  DropZone: {noVisual: true, render: (i) => <UploadField isInvalid={i} />},
  ImageField: {
    noLink: true,
    render: (i) => (
      <ImageField
        aspectRatio={1}
        errorMessage={i ? ERR : undefined}
        label="L"
        value=""
        onChange={() => {}}
        onUpload={async () => "x"}
      />
    ),
  },
  InputOTP: {
    render: (i) => (
      <>
        <InputOTP aria-describedby={i ? "otp-error" : undefined} isInvalid={i} maxLength={2}>
          <InputOTP.Group>
            <InputOTP.Slot index={0} />
            <InputOTP.Slot index={1} />
          </InputOTP.Group>
        </InputOTP>
        <FieldError id="otp-error">{i && ERR}</FieldError>
      </>
    ),
  },
  InputPhone: {
    render: (i) => (
      <>
        <InputPhone defaultCountry="US" isInvalid={i}>
          <InputPhone.CountrySelect />
          <InputPhone.Input aria-describedby={i ? "phone-error" : undefined} aria-label="Phone" />
        </InputPhone>
        <FieldError id="phone-error">{i && ERR}</FieldError>
      </>
    ),
  },
  ListBox: {
    render: (i) => (
      <>
        <ListBox
          aria-describedby={i ? "listbox-error" : undefined}
          aria-label="L"
          isInvalid={i}
          selectionMode="multiple"
        >
          <ListBox.Item id="a" textValue="A">
            A
          </ListBox.Item>
        </ListBox>
        <FieldError id="listbox-error">{i && ERR}</FieldError>
      </>
    ),
  },
  NumberField: {
    render: (i) => (
      <NumberField isInvalid={i}>
        <Label>L</Label>
        <NumberField.Group>
          <NumberField.Input />
        </NumberField.Group>
        <FieldError>{ERR}</FieldError>
      </NumberField>
    ),
  },
  RadioButtonGroup: {
    render: (i) => (
      <RadioButtonGroup aria-label="L" isInvalid={i}>
        <RadioButtonGroup.Item value="a">A</RadioButtonGroup.Item>
        <FieldError>{ERR}</FieldError>
      </RadioButtonGroup>
    ),
  },
  RadioGroup: {
    render: (i) => (
      <RadioGroup isInvalid={i}>
        <Label>L</Label>
        <Radio value="a">
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            A
          </Radio.Content>
        </Radio>
        <FieldError>{ERR}</FieldError>
      </RadioGroup>
    ),
  },
  RangeCalendar: {
    render: (i) => (
      <RangeCalendar
        aria-label="L"
        defaultValue={{end: parseDate("2025-01-16"), start: parseDate("2025-01-13")}}
        isInvalid={i}
      >
        <RangeCalendar.Grid>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
        <FieldError>{i && ERR}</FieldError>
      </RangeCalendar>
    ),
  },
  Rating: {
    render: (i) => (
      <Rating aria-label="L" isInvalid={i}>
        <Rating.Item value={1} />
        <FieldError>{ERR}</FieldError>
      </Rating>
    ),
  },
  SearchField: {
    render: (i) => (
      <SearchField isInvalid={i}>
        <Label>L</Label>
        <SearchField.Group>
          <SearchField.Input />
        </SearchField.Group>
        <FieldError>{ERR}</FieldError>
      </SearchField>
    ),
  },
  Select: {
    render: (i) => (
      <Select isInvalid={i} selectionMode="multiple">
        <Label>L</Label>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <FieldError>{ERR}</FieldError>
        <Select.Popover>{options}</Select.Popover>
      </Select>
    ),
  },
  Switch: {
    render: (i) => (
      <Switch isInvalid={i}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          S
        </Switch.Content>
        <FieldError>{ERR}</FieldError>
      </Switch>
    ),
  },
  TextField: {
    render: (i) => (
      <TextField isInvalid={i}>
        <Label>L</Label>
        <Input />
        <FieldError>{ERR}</FieldError>
      </TextField>
    ),
  },
  TimeField: {
    render: (i) => (
      <TimeField isInvalid={i}>
        <Label>L</Label>
        <TimeField.Group>
          <TimeField.Input>{(s) => <TimeField.Segment segment={s} />}</TimeField.Input>
        </TimeField.Group>
        <FieldError>{ERR}</FieldError>
      </TimeField>
    ),
  },
};

const COLOR_PROPS = [
  "outlineColor",
  "borderTopColor",
  "boxShadow",
  "color",
  "backgroundColor",
] as const;

const resolveColor = (token: string) => {
  const probe = document.createElement("span");

  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;

  probe.remove();

  return value;
};

/** Any non-label, non-message element painted with a danger color. */
const dangerPainted = (root: Element, danger: string[]) =>
  [...root.querySelectorAll("*")].some((el) => {
    // The message and a red `Label` don't count: the control itself must change.
    if (el.closest('[data-slot="field-error"], [data-slot="label"]')) return false;
    const style = getComputedStyle(el);

    return COLOR_PROPS.some((prop) => {
      const value = style[prop];

      // An outline only paints when it has a style.
      if (prop === "outlineColor" && style.outlineStyle === "none") return false;

      return danger.some((color) => value.includes(color));
    });
  });

describe("Form controls invalid state (browser)", () => {
  let danger: string[] = [];

  beforeAll(() => {
    const style = document.createElement("style");

    style.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
    document.head.appendChild(style);
    danger = [resolveColor("--danger"), resolveColor("--danger-soft")];
    expect(danger.every((color) => color && color !== getComputedStyle(document.body).color)).toBe(
      true,
    );
  });

  for (const [name, fixture] of Object.entries(fixtures)) {
    it(`${name} paints, links and hides its error consistently`, async () => {
      await render(
        <>
          <div data-state="valid">{fixture.render(false)}</div>
          <div data-state="invalid">{fixture.render(true)}</div>
        </>,
      );

      const valid = document.querySelector('[data-state="valid"]')!;
      const invalid = document.querySelector('[data-state="invalid"]')!;

      expect(valid).not.toHaveTextContent(ERR);

      if (!fixture.noVisual) {
        expect(dangerPainted(invalid, danger), "invalid control is painted red").toBe(true);
        expect(dangerPainted(valid, danger), "valid control stays neutral").toBe(false);
      }

      if (fixture.noLink) return;

      const error = [...invalid.querySelectorAll('[data-slot="field-error"]')].find(
        (el) => el.textContent === ERR,
      );

      expect(error, "FieldError is rendered").toBeDefined();
      expect(error).toBeVisible();

      const linked = [...invalid.querySelectorAll("[aria-describedby]")].some((el) =>
        el.getAttribute("aria-describedby")!.split(" ").includes(error!.id),
      );

      expect(linked, "FieldError is linked through aria-describedby").toBe(true);
    });
  }
});

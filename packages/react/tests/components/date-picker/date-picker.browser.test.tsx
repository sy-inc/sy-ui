import type {ComponentType, PropsWithChildren} from "react";

import {CalendarDate} from "@internationalized/date";
import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Calendar} from "@/components/calendar";
import {DateField} from "@/components/date-field";
import {DatePicker} from "@/components/date-picker";
import {DateRangePicker} from "@/components/date-range-picker";
import {Label} from "@/components/label";
import {RangeCalendar} from "@/components/range-calendar";

import "../../../../styles/dist/sy-inc.min.css";

describe("DatePicker dialogs (browser)", () => {
  it.each([
    ["DatePicker", DatePicker, Calendar, false],
    ["DateRangePicker", DateRangePicker, RangeCalendar, true],
  ] as const)(
    "supports named custom dialogs, Escape and focus restoration in %s",
    async (_name, Picker, CalendarComponent, range) => {
      const CalendarRoot: ComponentType<
        PropsWithChildren<{
          "aria-label": string;
          defaultFocusedValue: CalendarDate;
        }>
      > = CalendarComponent;

      await render(
        <div style={{margin: 32, width: 300}}>
          <Picker>
            <Label>Travel dates</Label>
            <DateField.Group>
              <DateField.Input slot={range ? "start" : undefined}>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              {range ? (
                <DateField.Input slot="end">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
              ) : null}
              <Picker.Trigger aria-label="Open calendar">
                <Picker.TriggerIndicator />
              </Picker.Trigger>
            </DateField.Group>
            <Picker.Popover render={(props) => <div {...props} data-custom-dialog="true" />}>
              <CalendarRoot
                aria-label="Available dates"
                defaultFocusedValue={new CalendarDate(2026, 10, 1)}
              >
                <CalendarComponent.Header>
                  <CalendarComponent.Heading />
                </CalendarComponent.Header>
                <CalendarComponent.Grid>
                  <CalendarComponent.GridHeader>
                    {(day) => <CalendarComponent.HeaderCell>{day}</CalendarComponent.HeaderCell>}
                  </CalendarComponent.GridHeader>
                  <CalendarComponent.GridBody>
                    {(date) => <CalendarComponent.Cell date={date} />}
                  </CalendarComponent.GridBody>
                </CalendarComponent.Grid>
              </CalendarRoot>
            </Picker.Popover>
          </Picker>
        </div>,
      );
      const trigger = page.getByRole("button", {name: "Open calendar"});

      await trigger.click();
      const dialog = page.getByRole("dialog");

      await expect.element(dialog).toHaveAccessibleName(/Travel dates/);
      expect(dialog.element()).toHaveAttribute("data-custom-dialog", "true");
      expect(document.querySelector("header, [role=banner]")).toBeNull();
      await userEvent.keyboard("{Escape}");
      await expect.element(dialog).not.toBeInTheDocument();
      await expect.element(trigger).toHaveFocus();
    },
  );
});

import type {ComponentType, PropsWithChildren} from "react";

import {CalendarDate} from "@internationalized/date";
import {render} from "@sy-inc/testing/browser";

import {Calendar} from "@/components/calendar";
import {I18nProvider} from "@/components/rac";
import {RangeCalendar} from "@/components/range-calendar";

import "../../../../styles/dist/sy-inc.min.css";

describe("Calendar (browser)", () => {
  it.each([
    ["Calendar", Calendar, "calendar"],
    ["RangeCalendar", RangeCalendar, "range-calendar"],
  ] as const)(
    "renders equal weekday columns and a neutral header in %s",
    async (_name, Component, slot) => {
      const Root: ComponentType<
        PropsWithChildren<{
          "aria-label": string;
          defaultFocusedValue: CalendarDate;
        }>
      > = Component;

      await render(
        <I18nProvider locale="pt-PT">
          <Root aria-label="Dates" defaultFocusedValue={new CalendarDate(2026, 10, 1)}>
            <Component.Header>
              <Component.Heading />
            </Component.Header>
            <Component.Grid weekdayStyle="long">
              <Component.GridHeader>
                {(day) => <Component.HeaderCell>{day}</Component.HeaderCell>}
              </Component.GridHeader>
              <Component.GridBody>{(date) => <Component.Cell date={date} />}</Component.GridBody>
            </Component.Grid>
          </Root>
        </I18nProvider>,
      );
      const grid = document.querySelector(`[data-slot="${slot}-grid"]`)!.getBoundingClientRect();
      const headers = document.querySelectorAll<HTMLElement>(`[data-slot="${slot}-header-cell"]`);

      expect(headers).toHaveLength(7);
      for (const cell of headers) {
        const rect = cell.getBoundingClientRect();

        expect(Math.abs(rect.width - grid.width / 7)).toBeLessThanOrEqual(1);
        expect(rect.right).toBeLessThanOrEqual(grid.right + 1);
        expect(getComputedStyle(cell).textOverflow).toBe("ellipsis");
      }
      expect(document.querySelector(`[data-slot="${slot}-header"]`)!.tagName).toBe("DIV");
      expect(document.querySelector('[role="banner"], header')).toBeNull();
    },
  );
});

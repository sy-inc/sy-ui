import type {ReactNode} from "react";

import {render} from "@sy-inc/testing/browser";
import {createRef} from "react";
import {PopoverContext} from "react-aria-components/Popover";

import {Autocomplete} from "@/components/autocomplete";
import {ComboBox} from "@/components/combo-box";
import {DatePicker} from "@/components/date-picker";
import {DateRangePicker} from "@/components/date-range-picker";
import {Dropdown} from "@/components/dropdown";
import {Select} from "@/components/select";

import "../../../../styles/dist/sy-inc.min.css";

const wrappers = [
  ["Select", Select.Popover, "select__popover"],
  ["ComboBox", ComboBox.Popover, "combo-box__popover"],
  ["Autocomplete", Autocomplete.Popover, "autocomplete__popover popover"],
  ["Dropdown", Dropdown.Popover, "dropdown__popover"],
  ["DatePicker", DatePicker.Popover, "date-picker__popover"],
  ["DateRangePicker", DateRangePicker.Popover, "date-range-picker__popover"],
] as const;

describe("Picker popovers (browser)", () => {
  it.each(wrappers)(
    "supports retained opacity restoration in %s",
    async (_name, Component, className) => {
      const wrap = (children: ReactNode) =>
        Component === Autocomplete.Popover ? (
          <Autocomplete aria-label="Options">
            <Autocomplete.Trigger>
              <Autocomplete.Value />
            </Autocomplete.Trigger>
            {children}
          </Autocomplete>
        ) : (
          children
        );
      const triggerRef = createRef<HTMLButtonElement>();
      const tree = (isOpen: boolean, opacity: number) =>
        wrap(
          <>
            <button ref={triggerRef}>Trigger</button>
            <Component
              isExiting
              aria-label="Popup"
              className={className}
              data-testid="popup"
              isOpen={isOpen}
              style={{opacity, width: 240}}
              triggerRef={triggerRef}
            >
              <button>Inside</button>
            </Component>
          </>,
        );
      const result = await render(tree(true, 0.45));
      const popup = document.querySelector<HTMLElement>('[data-testid="popup"]')!;

      await expect.poll(() => popup.getAnimations().length).toBe(0);
      await result.rerender(tree(false, 0.45));
      await expect.poll(() => popup.style.opacity).toBe("0");
      await result.rerender(tree(true, 0.45));
      expect(popup.style.opacity).toBe("0.45");
      await result.rerender(tree(false, 0.45));
      await expect.poll(() => popup.style.opacity).toBe("0");
      await result.rerender(tree(true, 0.75));
      expect(popup.style.opacity).toBe("0.75");
    },
  );

  it.each(wrappers)(
    "supports slotted skip options and ref cleanup in %s",
    async (_name, Component, className) => {
      const wrap = (children: ReactNode) =>
        Component === Autocomplete.Popover ? (
          <Autocomplete aria-label="Options">
            <Autocomplete.Trigger>
              <Autocomplete.Value />
            </Autocomplete.Trigger>
            {children}
          </Autocomplete>
        ) : (
          children
        );
      const triggerRef = createRef<HTMLButtonElement>();
      const cleanup = vi.fn();
      const forwardedRef = () => cleanup;
      const tree = (isOpen: boolean) =>
        wrap(
          <>
            <button ref={triggerRef}>Trigger</button>
            <PopoverContext value={{shouldSkipAnimation: true}}>
              <Component
                ref={forwardedRef}
                aria-label="Popup"
                className={className}
                data-testid="popup"
                isOpen={isOpen}
                style={{width: 240}}
                triggerRef={triggerRef}
              >
                <button>Inside</button>
              </Component>
            </PopoverContext>
          </>,
        );
      const result = await render(tree(true));

      expect(document.querySelector('[data-testid="popup"]')).not.toBeNull();
      await result.rerender(tree(false));
      await expect.poll(() => document.querySelector('[data-testid="popup"]')).toBeNull();
      expect(cleanup).toHaveBeenCalled();
    },
  );
});

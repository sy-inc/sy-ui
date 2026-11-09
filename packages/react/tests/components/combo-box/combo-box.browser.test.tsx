import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {ComboBox} from "@/components/combo-box";
import {Input} from "@/components/input";
import {Label} from "@/components/label";
import {ListBox} from "@/components/list-box";

import "../../../../styles/dist/sy-inc.min.css";

import {ComboBoxFixture} from "./fixtures";

describe("ComboBox (browser)", () => {
  it("scrolls every option into view with virtual focus and preserves Tab handoff", async () => {
    await page.viewport(390, 420);
    onTestFinished(() => page.viewport(1280, 720));
    const onChange = vi.fn();
    const items = Array.from({length: 40}, (_, index) => ({
      id: `animal-${index}`,
      name: `Animal ${index}`,
    }));

    await render(
      <div style={{margin: 32, width: 256}}>
        <ComboBox items={items} onChange={onChange}>
          <Label>Animal</Label>
          <ComboBox.InputGroup>
            <Input />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover style={{maxHeight: 180}}>
            <ListBox items={items}>
              {(item) => (
                <ListBox.Item id={item.id} textValue={item.name}>
                  {item.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              )}
            </ListBox>
          </ComboBox.Popover>
        </ComboBox>
        <Button>Continue</Button>
      </div>,
    );
    const input = page.getByRole("combobox");

    await page.getByRole("button", {name: "Show suggestions"}).click();
    const listbox = page.getByRole("listbox");

    await expect.element(listbox).toBeVisible();
    expect(input.element().getAttribute("aria-controls")).toBe(listbox.element().id);
    await expect.poll(() => listbox.element().scrollHeight).toBeGreaterThan(180);
    await expect
      .poll(() => document.querySelector('[data-slot="combo-box-popover"]')?.getAnimations().length)
      .toBe(0);
    await expect.element(input).toHaveFocus();
    for (let index = 0; index < 40; index++) {
      const previousId = input.element().getAttribute("aria-activedescendant");

      await userEvent.keyboard("{ArrowDown}");

      await expect
        .poll(() => input.element().getAttribute("aria-activedescendant"))
        .not.toBe(previousId);
      const option = document.getElementById(
        input.element().getAttribute("aria-activedescendant")!,
      );

      if (option?.textContent?.trim() === "Animal 39") break;
    }
    await expect.element(input).toHaveFocus();
    await expect.poll(() => listbox.element().scrollTop).toBeGreaterThan(0);
    const activeId = input.element().getAttribute("aria-activedescendant");
    const activeOption = document.getElementById(activeId!);

    expect(activeOption).toHaveTextContent("Animal 39");
    await expect
      .poll(() => activeOption!.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(listbox.element().getBoundingClientRect().bottom + 1);
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("animal-39");
    await userEvent.tab();
    await expect.element(page.getByRole("button", {name: "Continue"})).toHaveFocus();
  });

  it("reserves label space for a selected checkmark", async () => {
    await page.viewport(390, 420);
    onTestFinished(() => page.viewport(1280, 720));
    await render(
      <div style={{margin: 32, width: 256}}>
        <ComboBoxFixture defaultValue="dog" />
      </div>,
    );
    await page.getByRole("button", {name: "Show suggestions"}).click();
    const popup = document.querySelector<HTMLElement>('[data-slot="combo-box-popover"]')!;
    const input = page.getByRole("combobox");

    await expect.poll(() => popup.getAnimations().length).toBe(0);
    await userEvent.keyboard("{ArrowDown}");
    await expect.poll(() => input.element().getAttribute("aria-activedescendant")).toBeTruthy();
    const option = page.getByRole("option", {name: "Dog"});

    option.element().scrollIntoView({block: "nearest", inline: "nearest"});
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    expect(popup.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    expect(window.scrollX).toBe(0);
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    await expect.element(option).toBeVisible();
    const element = option.element();
    const indicator = element.querySelector('[data-slot="list-box-item-indicator"]')!;
    const labelEnd =
      element.getBoundingClientRect().right -
      parseFloat(getComputedStyle(element).paddingInlineEnd);

    expect(labelEnd).toBeLessThanOrEqual(indicator.getBoundingClientRect().left);
    await userEvent.keyboard("{Escape}");
    await expect.element(input).toHaveFocus();
  });
});

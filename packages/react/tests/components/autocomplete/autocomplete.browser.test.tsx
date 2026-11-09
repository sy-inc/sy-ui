import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Autocomplete} from "@/components/autocomplete";
import {Label} from "@/components/label";
import {ListBox} from "@/components/list-box";

import "../../../../styles/dist/sy-inc.min.css";

describe("Autocomplete (browser)", () => {
  it("keeps shared list layout while reserving space for its selected checkmark", async () => {
    await render(
      <div style={{margin: 32, width: 240}}>
        <Autocomplete defaultValue="dog">
          <Label>Animal</Label>
          <Autocomplete.Trigger data-testid="animal-trigger">
            <Autocomplete.Value />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Autocomplete.Popover>
            <ListBox>
              <ListBox.Item id="dog" textValue="Dog">
                Dog
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="cat" textValue="Cat">
                Cat
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </Autocomplete.Popover>
        </Autocomplete>
      </div>,
    );
    await page.getByTestId("animal-trigger").click();
    const option = page.getByRole("option", {name: "Dog"});

    await expect.element(option).toBeVisible();
    const item = option.element();
    const indicator = item.querySelector('[data-slot="list-box-item-indicator"]')!;
    const contentEnd =
      item.getBoundingClientRect().right - parseFloat(getComputedStyle(item).paddingInlineEnd);

    expect(contentEnd).toBeLessThanOrEqual(indicator.getBoundingClientRect().left);
    expect(document.querySelector('[data-slot="autocomplete-popover"]')).toHaveClass(
      "popover--list",
    );
    await userEvent.keyboard("{Escape}");
  });
});

import {render} from "@sy-inc/testing/browser";

import {CheckboxButtonGroup} from "@/components/checkbox-button-group";
import {Description} from "@/components/description";
import {Label} from "@/components/label";

import "../../../../styles/dist/sy-inc.min.css";

describe("CheckboxButtonGroup (browser)", () => {
  it("renders group-level label and description on their own grid row", async () => {
    await render(
      <CheckboxButtonGroup layout="grid" style={{gridTemplateColumns: "1fr 1fr"}}>
        <Label>Plan</Label>
        <Description>Pick one</Description>
        {["a", "b"].map((value) => (
          <CheckboxButtonGroup.Item key={value} value={value}>
            <CheckboxButtonGroup.ItemContent>
              <Label>{value}</Label>
            </CheckboxButtonGroup.ItemContent>
          </CheckboxButtonGroup.Item>
        ))}
      </CheckboxButtonGroup>,
    );

    const group = document.querySelector<HTMLElement>(".checkbox-button-group")!;
    const label = group.querySelector<HTMLElement>(':scope > [data-slot="label"]')!;
    const description = group.querySelector<HTMLElement>(':scope > [data-slot="description"]')!;
    const [first, second] = group.querySelectorAll<HTMLElement>(".checkbox-button-group__item");

    expect(label.getBoundingClientRect().width).toBe(group.getBoundingClientRect().width);
    expect(description.getBoundingClientRect().width).toBe(group.getBoundingClientRect().width);
    expect(first!.getBoundingClientRect().top).toBe(second!.getBoundingClientRect().top);
    expect(first!.getBoundingClientRect().top).toBeGreaterThan(
      description.getBoundingClientRect().bottom,
    );
  });
});

import {render} from "@sy-inc/testing/browser";

import {Description} from "@/components/description";
import {Label} from "@/components/label";
import {RadioButtonGroup} from "@/components/radio-button-group";

import "../../../../styles/dist/sy-inc.min.css";

describe("RadioButtonGroup (browser)", () => {
  it("renders group-level label and description on their own grid row", async () => {
    await render(
      <RadioButtonGroup layout="grid" style={{gridTemplateColumns: "1fr 1fr"}}>
        <Label>Plan</Label>
        <Description>Pick one</Description>
        {["a", "b"].map((value) => (
          <RadioButtonGroup.Item key={value} value={value}>
            <RadioButtonGroup.ItemContent>
              <Label>{value}</Label>
            </RadioButtonGroup.ItemContent>
          </RadioButtonGroup.Item>
        ))}
      </RadioButtonGroup>,
    );

    const group = document.querySelector<HTMLElement>(".radio-button-group")!;
    const label = group.querySelector<HTMLElement>(':scope > [data-slot="label"]')!;
    const description = group.querySelector<HTMLElement>(':scope > [data-slot="description"]')!;
    const [first, second] = group.querySelectorAll<HTMLElement>(".radio-button-group__item");

    expect(label.getBoundingClientRect().width).toBe(group.getBoundingClientRect().width);
    expect(description.getBoundingClientRect().width).toBe(group.getBoundingClientRect().width);
    expect(first!.getBoundingClientRect().top).toBe(second!.getBoundingClientRect().top);
    expect(first!.getBoundingClientRect().top).toBeGreaterThan(
      description.getBoundingClientRect().bottom,
    );
  });
});

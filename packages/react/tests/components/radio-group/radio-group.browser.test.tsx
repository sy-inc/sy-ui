import {render} from "@sy-inc/testing/browser";

import {Label} from "@/components/label";
import {Radio} from "@/components/radio";
import {RadioGroup} from "@/components/radio-group";

import "../../../../styles/dist/sy-inc.min.css";

describe("RadioGroup (browser)", () => {
  it("renders the group label on its own line when horizontal", async () => {
    await render(
      <RadioGroup orientation="horizontal">
        <Label>Plan</Label>
        {["a", "b"].map((value) => (
          <Radio key={value} value={value}>
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              {value}
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>,
    );

    const group = document.querySelector<HTMLElement>(".radio-group")!;
    const label = group.querySelector<HTMLElement>(':scope > [data-slot="label"]')!;
    const [first, second] = group.querySelectorAll<HTMLElement>('[data-slot="radio"]');

    expect(first!.getBoundingClientRect().top).toBe(second!.getBoundingClientRect().top);
    expect(first!.getBoundingClientRect().top).toBeGreaterThan(
      label.getBoundingClientRect().bottom,
    );
  });
});

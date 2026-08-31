import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Stepper} from "@/components/stepper";

describe("Stepper SSR", () => {
  it("renders the compound structure without a hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <Stepper aria-label="Account setup" currentKey="account">
        <Stepper.Item id="account">
          <Stepper.Indicator />
          <Stepper.Content>
            <Stepper.Title>Account</Stepper.Title>
          </Stepper.Content>
        </Stepper.Item>
      </Stepper>,
    );

    expect(html).toContain('data-slot="stepper"');
    expect(html).toContain('data-slot="stepper-item"');
    expect(html).toContain('aria-current="step"');
  });
});

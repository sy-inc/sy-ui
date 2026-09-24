import {ssrSmoke} from "@sy-inc/testing/helpers";

import {PhoneField} from "./fixtures";

describe("InputPhone SSR", () => {
  it("renders the only allowed country as a static prefix without hydration mismatch", async () => {
    const {html} = await ssrSmoke(<PhoneField countries={["MY"]} />);

    expect(html).toContain('data-slot="input-phone-country-display"');
    expect(html).toContain("Malaysia, +60");
    expect(html).not.toContain('data-slot="input-phone-country-trigger"');
  });

  it("renders without hydration mismatch when closed with a default value", async () => {
    const {html} = await ssrSmoke(<PhoneField defaultCountry="US" defaultValue="+12025550123" />);

    expect(html).toContain("input-phone");
    expect(html).toContain('data-slot="input-group"');
    expect(html).toContain('data-slot="input-group-input"');
    expect(html).toContain('type="tel"');
    expect(html).not.toContain('data-slot="input-phone-country-popover"');
  });

  it("resolves the country from the value on the server", async () => {
    const {html} = await ssrSmoke(<PhoneField defaultCountry="US" defaultValue="+442071838750" />);

    expect(html).toContain("Change country, United Kingdom");
  });
});

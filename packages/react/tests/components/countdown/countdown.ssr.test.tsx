import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Countdown} from "@/components/countdown";

describe("Countdown SSR", () => {
  it("renders stable placeholders before hydration starts the clock", async () => {
    const {html} = await ssrSmoke(<Countdown endDate="2099-01-01T00:00:00Z" />);

    expect(html).toContain('data-state="pending"');
    expect(html).toContain('role="timer"');
    expect(html).toContain("––"[0]);
  });

  it("renders invalid deadlines without hydration mismatches", async () => {
    const {html} = await ssrSmoke(<Countdown endDate="invalid" />);

    expect(html).toContain('data-state="invalid"');
  });
});

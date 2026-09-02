import {ssrSmoke} from "@sy-inc/testing/helpers";

import {PressableFeedback} from "@/components/pressable-feedback";

describe("PressableFeedback SSR", () => {
  it("renders every feedback layer in its idle state without hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <PressableFeedback>
        <PressableFeedback.Highlight />
        <PressableFeedback.Ripple />
        <PressableFeedback.Progress />
        <PressableFeedback.Scale>Press me</PressableFeedback.Scale>
      </PressableFeedback>,
    );

    expect(html).toContain('data-slot="pressable-feedback"');
    expect(html).toContain('data-slot="pressable-feedback-highlight"');
    expect(html).toContain('data-slot="pressable-feedback-ripple"');
    expect(html).toContain('data-slot="pressable-feedback-progress"');
    expect(html).toContain('data-slot="pressable-feedback-scale"');
    expect(html).not.toContain('data-slot="pressable-feedback-ripple-wave"');
  });
});

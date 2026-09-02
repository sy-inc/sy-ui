import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import {Timeline} from "@/components/timeline";

import "../../../../styles/dist/sy-inc.min.css";

describe("Timeline (browser)", () => {
  it("keeps alternate content aligned with markers and connectors continuous", async () => {
    await render(
      <Timeline
        aria-label="Alternate timeline"
        axis="center"
        placement="alternate"
        style={{maxWidth: 420}}
      >
        {["First", "Second", "Third"].map((label, index) => (
          <Timeline.Item key={label} align="center">
            <Timeline.Rail />
            <Timeline.Content>
              {index === 1
                ? "Second milestone has enough detail to wrap onto multiple lines."
                : label}
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>,
    );

    const timeline = page.getByRole("list", {name: "Alternate timeline"}).element();
    const items = [...timeline.querySelectorAll<HTMLElement>('[data-slot="timeline-item"]')];
    const markers = items.map(
      (item) => item.querySelector<HTMLElement>('[data-slot="timeline-marker"]')!,
    );
    const connectors = items.map(
      (item) => item.querySelector<HTMLElement>('[data-slot="timeline-connector"]')!,
    );

    items.forEach((item, index) => {
      const content = item.querySelector<HTMLElement>('[data-slot="timeline-content"]')!;

      expect(content.getBoundingClientRect().top).toBeCloseTo(
        markers[index]!.getBoundingClientRect().top,
        0,
      );
    });

    expect(connectors[0]!.getBoundingClientRect().bottom).toBeCloseTo(
      markers[1]!.getBoundingClientRect().top,
      0,
    );
    expect(connectors[1]!.getBoundingClientRect().bottom).toBeCloseTo(
      markers[2]!.getBoundingClientRect().top,
      0,
    );
  });
});

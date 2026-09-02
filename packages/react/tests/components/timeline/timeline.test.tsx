import {render, screen} from "@sy-inc/testing/helpers";
import React from "react";

import {Timeline} from "@/components/timeline";

describe("Timeline", () => {
  it("renders an ordered chronology with semantic slots", () => {
    render(
      <Timeline aria-label="Release timeline">
        <Timeline.Item status="current">
          <Timeline.Rail />
          <Timeline.Content>Private beta</Timeline.Content>
        </Timeline.Item>
        <Timeline.Item>
          <Timeline.Rail />
          <Timeline.Content>Launch</Timeline.Content>
        </Timeline.Item>
      </Timeline>,
    );

    expect(screen.getByRole("list", {name: "Release timeline"})).toHaveAttribute(
      "data-slot",
      "timeline",
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Private beta").closest("li")).toHaveAttribute("aria-current", "true");

    const markers = document.querySelectorAll('[data-slot="timeline-marker"]');

    expect(markers).toHaveLength(2);
    expect(markers[0]).toHaveAttribute("aria-hidden", "true");
    expect(markers[0]).toHaveAttribute("data-status", "current");
    expect(document.querySelectorAll('[data-slot="timeline-connector"]')).toHaveLength(2);
  });

  it("supports variants, class names, refs, and custom markers", () => {
    const rootRef = React.createRef<HTMLOListElement>();
    const markerRef = React.createRef<HTMLSpanElement>();

    render(
      <Timeline
        ref={rootRef}
        aria-label="Variants"
        axis="center"
        className="custom-timeline"
        density="compact"
        placement="alternate"
        size="sm"
      >
        <Timeline.Item align="center" status="danger">
          <Timeline.Rail>
            <Timeline.Marker ref={markerRef}>!</Timeline.Marker>
          </Timeline.Rail>
          <Timeline.Content className="custom-content">Review</Timeline.Content>
        </Timeline.Item>
      </Timeline>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLOListElement);
    expect(markerRef.current).toBeInstanceOf(HTMLSpanElement);
    expect(rootRef.current?.className).toContain("timeline--axis-center");
    expect(rootRef.current?.className).toContain("timeline--alternate");
    expect(rootRef.current?.className).toContain("custom-timeline");
    expect(screen.getByText("Review")).toHaveClass("custom-content");
    expect(screen.getByText("!")).toHaveAttribute("data-status", "danger");
    expect(screen.getByText("!")).not.toHaveAttribute("aria-hidden");
    expect(screen.getByRole("listitem")).toHaveAttribute("data-align", "center");
  });
});

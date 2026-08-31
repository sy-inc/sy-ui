import {createRef} from "react";

import {render, screen} from "@sy-inc/testing/helpers";

import {TextShimmer} from "@/components/text-shimmer";

describe("TextShimmer", () => {
  it("renders its accessible text and stable data slot", () => {
    render(<TextShimmer>Thinking...</TextShimmer>);

    expect(screen.getByText("Thinking...")).toHaveAttribute("data-slot", "text-shimmer");
  });

  it("supports span, data, and aria props", () => {
    render(
      <TextShimmer aria-label="Generating" data-state="pending" title="In progress">
        Generating response...
      </TextShimmer>,
    );

    expect(screen.getByLabelText("Generating")).toHaveAttribute("data-state", "pending");
    expect(screen.getByLabelText("Generating")).toHaveAttribute("title", "In progress");
  });

  it("merges className and forwards its ref to a span", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <TextShimmer ref={ref} className="text-accent">
        Thinking...
      </TextShimmer>,
    );

    expect(screen.getByText("Thinking...")).toHaveClass("text-shimmer", "text-accent");
    expect(ref.current?.tagName).toBe("SPAN");
  });
});

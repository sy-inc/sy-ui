import {fireEvent, render, screen, waitFor} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {Marquee} from "@/components/marquee";

describe("Marquee", () => {
  it("renders one accessible copy and one hidden visual copy", () => {
    render(<Marquee>Scrolling content</Marquee>);
    const root = screen.getAllByText("Scrolling content")[0]!.closest('[data-slot="marquee"]')!;
    const tracks = root.querySelectorAll('[data-slot="marquee-track"]');

    expect(screen.getAllByText("Scrolling content")).toHaveLength(2);
    expect(tracks[0]).not.toHaveAttribute("aria-hidden");
    expect(tracks[1]).toHaveAttribute("aria-hidden", "true");
    expect(tracks[1]).toHaveAttribute("inert");
  });

  it("exposes default direction, BEM classes, and data slots", () => {
    render(<Marquee data-testid="marquee">Content</Marquee>);
    const marquee = screen.getByTestId("marquee");

    expect(marquee).toHaveAttribute("data-direction", "left");
    expect(marquee).toHaveAttribute("data-slot", "marquee");
    expect(marquee).toHaveClass("marquee");
    expect(marquee.querySelector('[data-slot="marquee-track"]')).toHaveClass("marquee__track");
    expect(marquee.querySelector('[data-slot="marquee-sequence"]')).toHaveClass(
      "marquee__sequence",
    );
    expect(marquee.querySelector('[data-slot="marquee-item"]')).toHaveClass("marquee__item");
  });

  it("supports direction and pause controls", () => {
    render(
      <Marquee pauseOnInteraction data-testid="marquee" direction="up" play={false}>
        Content
      </Marquee>,
    );
    const marquee = screen.getByTestId("marquee");

    expect(marquee).toHaveAttribute("data-direction", "up");
    expect(marquee).toHaveAttribute("data-paused", "true");
    expect(marquee).toHaveClass("marquee--pause-on-interaction");
  });

  it("pauses when play is false", () => {
    render(
      <Marquee data-testid="marquee" play={false}>
        Content
      </Marquee>,
    );

    expect(screen.getByTestId("marquee")).toHaveAttribute("data-paused", "true");
  });

  it("sets animation variables while preserving custom styles", () => {
    render(
      <Marquee gradient data-testid="marquee" delay={2} gap={24} style={{color: "blue"}}>
        Content
      </Marquee>,
    );
    const marquee = screen.getByTestId("marquee");

    expect(marquee).toHaveAttribute("data-gradient", "true");
    expect(marquee.style.getPropertyValue("--marquee-delay")).toBe("2s");
    expect(marquee.style.getPropertyValue("--marquee-gap")).toBe("24px");
    expect(marquee).toHaveStyle({color: "rgb(0, 0, 255)"});
  });

  it("lets custom properties override the derived animation variables", () => {
    render(
      <Marquee
        data-testid="marquee"
        style={{"--marquee-duration": "12s", "--marquee-iterations": "3"}}
      >
        Content
      </Marquee>,
    );
    const marquee = screen.getByTestId("marquee");

    expect(marquee.style.getPropertyValue("--marquee-duration")).toBe("12s");
    expect(marquee.style.getPropertyValue("--marquee-iterations")).toBe("3");
  });

  it("derives duration from content distance and speed and auto-fills blank space", async () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const width = this.dataset["slot"] === "marquee-sequence" ? 100 : 300;

        return {
          bottom: 20,
          height: 20,
          left: 0,
          right: width,
          top: 0,
          width,
          x: 0,
          y: 0,
          toJSON() {},
        };
      });

    render(
      <Marquee autoFill data-testid="marquee" speed={50}>
        Content
      </Marquee>,
    );
    const marquee = screen.getByTestId("marquee");

    await waitFor(() => {
      expect(marquee.querySelectorAll('[data-slot="marquee-sequence"]')).toHaveLength(6);
    });
    expect(marquee).toHaveAttribute("data-auto-fill", "true");
    expect(marquee.style.getPropertyValue("--marquee-duration")).toBe("6s");

    rect.mockRestore();
  });

  it("bubbles animation events from the track to native handlers", () => {
    const onAnimationEnd = vi.fn();

    render(<Marquee onAnimationEnd={onAnimationEnd}>Content</Marquee>);
    fireEvent(
      document.querySelector('[data-slot="marquee-track"]')!,
      new Event("webkitAnimationEnd", {bubbles: true}),
    );

    expect(onAnimationEnd).toHaveBeenCalledOnce();
  });

  it("forwards refs and DOM props", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Marquee ref={ref} aria-label="Announcements" data-foo="bar">
        Content
      </Marquee>,
    );

    expect(ref.current).toHaveAttribute("aria-label", "Announcements");
    expect(ref.current).toHaveAttribute("data-foo", "bar");
  });
});

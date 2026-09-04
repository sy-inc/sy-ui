import {fireEvent, render, screen, waitFor} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {Marquee} from "@/components/marquee";

describe("Marquee", () => {
  it("renders one accessible copy and one hidden visual copy", () => {
    render(
      <Marquee>
        <Marquee.Content>Scrolling content</Marquee.Content>
      </Marquee>,
    );
    const content = screen
      .getAllByText("Scrolling content")[0]!
      .closest('[data-slot="marquee-content"]')!;
    const tracks = content.querySelectorAll('[data-slot="marquee-track"]');

    expect(screen.getAllByText("Scrolling content")).toHaveLength(2);
    expect(tracks[0]).not.toHaveAttribute("aria-hidden");
    expect(tracks[1]).toHaveAttribute("aria-hidden", "true");
    expect(tracks[1]).toHaveAttribute("inert");
  });

  it("exposes default direction, BEM classes, and data slots", () => {
    render(
      <Marquee data-testid="marquee">
        <Marquee.Content data-testid="content">Content</Marquee.Content>
      </Marquee>,
    );
    const marquee = screen.getByTestId("marquee");
    const content = screen.getByTestId("content");

    expect(marquee).toHaveAttribute("data-slot", "marquee");
    expect(marquee).toHaveClass("marquee");
    expect(content).toHaveAttribute("data-direction", "left");
    expect(content).toHaveAttribute("data-slot", "marquee-content");
    expect(content).toHaveClass("marquee__content");
    expect(content.querySelector('[data-slot="marquee-track"]')).toHaveClass("marquee__track");
    expect(content.querySelector('[data-slot="marquee-sequence"]')).toHaveClass(
      "marquee__sequence",
    );
    expect(content.querySelector('[data-slot="marquee-item"]')).toHaveClass("marquee__item");
  });

  describe("adornments", () => {
    it("renders the prefix and suffix outside the scrolling content", () => {
      render(
        <Marquee data-testid="marquee">
          <Marquee.Prefix>Notice</Marquee.Prefix>
          <Marquee.Content data-testid="content">Scrolling content</Marquee.Content>
          <Marquee.Suffix>
            <a href="#details">Details</a>
          </Marquee.Suffix>
        </Marquee>,
      );
      const marquee = screen.getByTestId("marquee");
      const prefix = screen.getByText("Notice");
      const suffix = screen.getByRole("link", {name: "Details"}).parentElement!;

      expect(prefix).toHaveAttribute("data-slot", "marquee-prefix");
      expect(prefix).toHaveClass("marquee__prefix");
      expect(suffix).toHaveAttribute("data-slot", "marquee-suffix");
      expect(suffix).toHaveClass("marquee__suffix");
      expect([...marquee.children]).toEqual([prefix, screen.getByTestId("content"), suffix]);
    });

    it("keeps adornments out of the repeated sequences", () => {
      render(
        <Marquee>
          <Marquee.Prefix>Notice</Marquee.Prefix>
          <Marquee.Content>Scrolling content</Marquee.Content>
        </Marquee>,
      );

      expect(screen.getAllByText("Notice")).toHaveLength(1);
      expect(screen.getAllByText("Scrolling content")).toHaveLength(2);
    });

    it("forwards refs and DOM props on every adornment", () => {
      const prefixRef = createRef<HTMLDivElement>();
      const suffixRef = createRef<HTMLDivElement>();

      render(
        <Marquee>
          <Marquee.Prefix ref={prefixRef} aria-hidden="true" className="px-2" />
          <Marquee.Content>Content</Marquee.Content>
          <Marquee.Suffix ref={suffixRef} data-foo="bar" />
        </Marquee>,
      );

      expect(prefixRef.current).toHaveAttribute("aria-hidden", "true");
      expect(prefixRef.current).toHaveClass("marquee__prefix", "px-2");
      expect(suffixRef.current).toHaveAttribute("data-foo", "bar");
    });
  });

  it("supports direction and pause controls", () => {
    render(
      <Marquee>
        <Marquee.Content pauseOnInteraction data-testid="content" direction="up" play={false}>
          Content
        </Marquee.Content>
      </Marquee>,
    );
    const content = screen.getByTestId("content");

    expect(content).toHaveAttribute("data-direction", "up");
    expect(content).toHaveAttribute("data-paused", "true");
    expect(content).toHaveAttribute("data-pause-on-interaction", "true");
  });

  it("pauses when play is false", () => {
    render(
      <Marquee>
        <Marquee.Content data-testid="content" play={false}>
          Content
        </Marquee.Content>
      </Marquee>,
    );

    expect(screen.getByTestId("content")).toHaveAttribute("data-paused", "true");
  });

  it("sets animation variables while preserving custom styles", () => {
    render(
      <Marquee>
        <Marquee.Content gradient data-testid="content" delay={2} gap={24} style={{color: "blue"}}>
          Content
        </Marquee.Content>
      </Marquee>,
    );
    const content = screen.getByTestId("content");

    expect(content).toHaveAttribute("data-gradient", "true");
    expect(content.style.getPropertyValue("--marquee-delay")).toBe("2s");
    expect(content.style.getPropertyValue("--marquee-gap")).toBe("24px");
    expect(content).toHaveStyle({color: "rgb(0, 0, 255)"});
  });

  it("lets custom properties override the derived animation variables", () => {
    render(
      <Marquee>
        <Marquee.Content
          data-testid="content"
          style={{"--marquee-duration": "12s", "--marquee-iterations": "3"}}
        >
          Content
        </Marquee.Content>
      </Marquee>,
    );
    const content = screen.getByTestId("content");

    expect(content.style.getPropertyValue("--marquee-duration")).toBe("12s");
    expect(content.style.getPropertyValue("--marquee-iterations")).toBe("3");
  });

  it("derives duration from content distance and speed and auto-fills blank space", async () => {
    const offsetWidth = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        return this.dataset["slot"] === "marquee-sequence" ? 100 : 300;
      });

    render(
      <Marquee>
        <Marquee.Content autoFill data-testid="content" speed={50}>
          Content
        </Marquee.Content>
      </Marquee>,
    );
    const content = screen.getByTestId("content");

    await waitFor(() => {
      expect(content.querySelectorAll('[data-slot="marquee-sequence"]')).toHaveLength(6);
    });
    expect(content).toHaveAttribute("data-auto-fill", "true");
    expect(content.style.getPropertyValue("--marquee-duration")).toBe("6s");

    offsetWidth.mockRestore();
  });

  it("bubbles animation events from the track to native handlers", () => {
    const onAnimationEnd = vi.fn();

    render(
      <Marquee>
        <Marquee.Content onAnimationEnd={onAnimationEnd}>Content</Marquee.Content>
      </Marquee>,
    );
    fireEvent(
      document.querySelector('[data-slot="marquee-track"]')!,
      new Event("webkitAnimationEnd", {bubbles: true}),
    );

    expect(onAnimationEnd).toHaveBeenCalledOnce();
  });

  it("forwards refs and DOM props", () => {
    const rootRef = createRef<HTMLDivElement>();
    const contentRef = createRef<HTMLDivElement>();

    render(
      <Marquee ref={rootRef} data-foo="bar">
        <Marquee.Content ref={contentRef} aria-label="Announcements">
          Content
        </Marquee.Content>
      </Marquee>,
    );

    expect(rootRef.current).toHaveAttribute("data-foo", "bar");
    expect(contentRef.current).toHaveAttribute("aria-label", "Announcements");
  });
});

import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {Carousel} from "@/components/carousel";

import {CarouselFixture} from "./fixtures";

describe("Carousel (browser)", () => {
  it("updates responsive card count and gap when the viewport changes", async () => {
    await page.viewport(400, 600);
    await render(
      <Carousel
        aria-label="Responsive items"
        gap={{base: 8, md: 16, lg: 24}}
        itemsPerView={{base: 1, md: 2, lg: 3}}
        style={{width: "100vw"}}
      >
        <Carousel.Content>
          {[1, 2, 3, 4, 5].map((value) => (
            <Carousel.Item key={value}>{value}</Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Pagination aria-label="Choose slide" />
      </Carousel>,
    );

    const root = page.getByRole("region").element();
    const viewport = root.querySelector('[data-slot="carousel-viewport"]')!;
    const measure = () =>
      [...viewport.querySelectorAll('[data-slot="carousel-item"]')].filter((item) => {
        const box = item.getBoundingClientRect();
        const view = viewport.getBoundingClientRect();

        return box.left >= view.left - 1 && box.right <= view.right + 1;
      });

    await expect.poll(() => measure().length).toBe(1);
    await expect
      .poll(
        () => viewport.querySelector('[data-slot="carousel-item"]')!.getBoundingClientRect().width,
      )
      .toBeCloseTo(400, -1);

    await page.viewport(800, 600);
    await expect.poll(() => measure().length).toBe(2);
    await expect
      .poll(
        () => viewport.querySelector('[data-slot="carousel-item"]')!.getBoundingClientRect().width,
      )
      .toBeCloseTo(392, -1);

    await page.viewport(1200, 600);
    await expect.poll(() => measure().length).toBe(3);
    await expect
      .poll(
        () => viewport.querySelector('[data-slot="carousel-item"]')!.getBoundingClientRect().width,
      )
      .toBeCloseTo(384, -1);
    await expect.element(page.getByRole("button", {name: "Next slide"})).not.toBeDisabled();
  });
  it("shows the configured peek on both sides and aligns the edge slides", async () => {
    await render(
      <Carousel aria-label="Peek carousel" options={{startSnap: 1}} peek="10%" style={{width: 400}}>
        <Carousel.Content>
          {[1, 2, 3].map((value) => (
            <Carousel.Item key={value}>{value}</Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Pagination aria-label="Choose slide" />
      </Carousel>,
    );

    const items = page.getByRole("group");
    const viewport = page
      .getByRole("region")
      .element()
      .querySelector('[data-slot="carousel-viewport"]')!
      .getBoundingClientRect();
    const previous = items.nth(0).element().getBoundingClientRect();
    const current = items.nth(1).element().getBoundingClientRect();
    const next = items.nth(2).element().getBoundingClientRect();

    expect(current.width).toBeCloseTo(320, -1);
    expect(current.left - previous.right).toBeCloseTo(0, 0);
    expect(next.left - current.right).toBeCloseTo(0, 0);
    expect(current.left - viewport.left).toBeCloseTo(40, -1);
    expect(viewport.right - current.right).toBeCloseTo(40, -1);

    await page.getByRole("button", {name: "Go to slide 3"}).click();
    await expect
      .element(page.getByRole("button", {name: "Go to slide 3"}))
      .toHaveAttribute("aria-current", "true");
    await new Promise<void>((resolve) => window.setTimeout(resolve, 500));
    expect(page.getByRole("button", {name: "Go to slide 3"})).toBeTruthy();
  });

  it("shows two complete slides while keeping the previous and next slide visible", async () => {
    await render(
      <Carousel
        aria-label="Two-card peek carousel"
        itemsPerView={2}
        options={{startSnap: 1}}
        peek="5%"
        slidesToScroll={1}
        style={{width: 400}}
      >
        <Carousel.Content>
          {[1, 2, 3, 4].map((value) => (
            <Carousel.Item key={value}>{value}</Carousel.Item>
          ))}
        </Carousel.Content>
      </Carousel>,
    );

    const items = page.getByRole("group");
    const viewport = page
      .getByRole("region")
      .element()
      .querySelector('[data-slot="carousel-viewport"]')!
      .getBoundingClientRect();
    const previous = items.nth(0).element().getBoundingClientRect();
    const first = items.nth(1).element().getBoundingClientRect();
    const second = items.nth(2).element().getBoundingClientRect();
    const next = items.nth(3).element().getBoundingClientRect();

    // peek="5%" of the 400px viewport is 20px per side; the two full cards split what remains.
    expect(first.width).toBeCloseTo(180, -1);
    expect(second.width).toBeCloseTo(180, -1);
    expect(second.left - first.right).toBeCloseTo(0, 0);
    expect(first.left - viewport.left).toBeCloseTo(20, -1);
    expect(viewport.right - second.right).toBeCloseTo(20, -1);
    expect(previous.right - viewport.left).toBeCloseTo(20, -1);
    expect(next.left - viewport.right).toBeLessThan(0);
  });

  it("derives card width from itemsPerView and peek", async () => {
    await render(
      <Carousel aria-label="Formula carousel" itemsPerView={2} peek="5%" style={{width: 400}}>
        <Carousel.Content>
          {[1, 2, 3, 4].map((value) => (
            <Carousel.Item key={value}>{value}</Carousel.Item>
          ))}
        </Carousel.Content>
      </Carousel>,
    );

    const viewport = page
      .getByRole("region")
      .element()
      .querySelector('[data-slot="carousel-viewport"]')!;
    const items = [...viewport.querySelectorAll('[data-slot="carousel-item"]')];
    const width = viewport.getBoundingClientRect().width;

    expect(items[0]!.getBoundingClientRect().width).toBeCloseTo((width * 0.9) / 2, -1);
    expect(items[1]!.getBoundingClientRect().width).toBeCloseTo((width * 0.9) / 2, -1);
    expect(items[2]!.getBoundingClientRect().left).toBeLessThan(
      viewport.getBoundingClientRect().right,
    );
    expect(items[2]!.getBoundingClientRect().right).toBeGreaterThan(
      viewport.getBoundingClientRect().right,
    );
  });

  it("loops infinitely and keeps the wrap-around seam gap consistent", async () => {
    await render(
      <Carousel
        aria-label="Looping peek carousel"
        gap={8}
        itemsPerView={3}
        options={{loop: true}}
        peek="8%"
        style={{width: 600}}
      >
        <Carousel.Content>
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <Carousel.Item key={value}>{value}</Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
      </Carousel>,
    );

    const root = page.getByRole("region").element();

    // Embla measures the wrap seam from the last slide's trailing margin, so loop is only gap-safe
    // once that margin matches the configured gap.
    const items = [...root.querySelectorAll('[data-slot="carousel-item"]')];
    const lastMargin = parseFloat(getComputedStyle(items[items.length - 1]!).marginInlineEnd);

    expect(root).toHaveAttribute("data-loop", "true");
    expect(lastMargin).toBeCloseTo(8, 0);

    // Starting at the first slide, Previous should wrap immediately instead of being disabled.
    const previous = page.getByRole("button", {name: "Previous slide"});

    await expect.element(previous).not.toBeDisabled();
  });

  it("fills the viewport with a single slide and hides the scroll chrome", async () => {
    await render(
      <Carousel aria-label="Single slide" peek="10%" style={{width: 400}}>
        <Carousel.Content>
          <Carousel.Item>Only slide</Carousel.Item>
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Pagination aria-label="Choose slide" />
      </Carousel>,
    );

    const root = page.getByRole("region").element();

    await expect.poll(() => root.getAttribute("data-scrollable")).toBe("false");
    // The peek insets are dropped: the only slide takes the full 400px instead of 320px.
    const item = root.querySelector('[data-slot="carousel-item"]')!;

    expect(item.getBoundingClientRect().width).toBeCloseTo(400, -1);
    // display: none removes the disabled-only controls from the accessibility tree.
    expect(page.getByRole("button", {name: "Previous slide"}).query()).toBeNull();
    expect(page.getByRole("button", {name: "Next slide"}).query()).toBeNull();
    expect(page.getByRole("button", {name: "Go to slide 1"}).query()).toBeNull();
  });

  it("drops the peek gutters when the slides do not overflow one view", async () => {
    await render(
      <Carousel aria-label="Short set" gap={8} itemsPerView={2} peek="10%" style={{width: 400}}>
        <Carousel.Content>
          {[1, 2].map((value) => (
            <Carousel.Item key={value}>{value}</Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
      </Carousel>,
    );

    const root = page.getByRole("region").element();

    await expect.poll(() => root.getAttribute("data-scrollable")).toBe("false");
    const items = [...root.querySelectorAll('[data-slot="carousel-item"]')];

    // Both cards split the full width minus the gap: (400 - 8) / 2, not (400 - 80 - 8) / 2.
    expect(items[0]!.getBoundingClientRect().width).toBeCloseTo(196, -1);
    expect(items[1]!.getBoundingClientRect().width).toBeCloseTo(196, -1);
    expect(page.getByRole("button", {name: "Next slide"}).query()).toBeNull();
  });

  it("drops data-loop and the seam margin when the slides cannot loop", async () => {
    await render(
      <Carousel
        aria-label="Loop fallback"
        gap={8}
        options={{loop: true}}
        peek="10%"
        style={{width: 400}}
      >
        <Carousel.Content>
          {[1, 2].map((value) => (
            <Carousel.Item key={value}>{value}</Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
      </Carousel>,
    );

    const root = page.getByRole("region").element();

    // Two 320px slides cannot cover a looped 400px view: Embla rebuilds without loop, and the
    // attribute must follow the engine so the seam margin does not dangle after the last slide.
    await expect.poll(() => root.getAttribute("data-loop")).toBeNull();
    expect(root).toHaveAttribute("data-scrollable", "true");
    const items = [...root.querySelectorAll('[data-slot="carousel-item"]')];

    expect(parseFloat(getComputedStyle(items[1]!).marginInlineEnd)).toBe(0);
    // Bounded semantics take over: edges disable instead of wrapping.
    await expect.element(page.getByRole("button", {name: "Previous slide"})).toBeDisabled();
    await expect.element(page.getByRole("button", {name: "Next slide"})).not.toBeDisabled();
  });

  it("notifies once with the configured start index", async () => {
    const selections: number[] = [];

    await render(
      <Carousel
        aria-label="Selection carousel"
        options={{startSnap: 1}}
        onSelectionChange={(index) => selections.push(index)}
      >
        <Carousel.Content>
          {(["first", "second", "third"] as const).map((value, index) => (
            <Carousel.Item key={value} aria-label={`${index + 1} of 3`}>
              {value}
            </Carousel.Item>
          ))}
        </Carousel.Content>
      </Carousel>,
    );

    await expect.poll(() => selections).toEqual([1]);
  });

  it("moves between slides with accessible controls", async () => {
    await render(<CarouselFixture />);

    const previous = page.getByRole("button", {name: "Previous slide"});
    const next = page.getByRole("button", {name: "Next slide"});

    await expect.element(previous).toBeDisabled();
    await expect.element(next).not.toBeDisabled();

    await next.click();
    await new Promise<void>((resolve) => window.setTimeout(resolve, 100));

    await expect
      .element(page.getByRole("button", {name: "Go to slide 2"}))
      .toHaveAttribute("aria-current", "true");
    await expect.element(previous).not.toBeDisabled();
  });

  it("navigates from a focused viewport and optionally consumes wheel input", async () => {
    await render(<CarouselFixture wheelNavigation />);
    const viewport = page
      .getByRole("region")
      .element()
      .querySelector('[data-slot="carousel-viewport"]') as HTMLElement;

    viewport.focus();

    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", {name: "Go to slide 2"}))
      .toHaveAttribute("aria-current", "true");

    await userEvent.keyboard("{Home}");
    await expect
      .element(page.getByRole("button", {name: "Go to slide 1"}))
      .toHaveAttribute("aria-current", "true");

    viewport.dispatchEvent(new WheelEvent("wheel", {bubbles: true, cancelable: true, deltaY: 100}));
    await expect
      .element(page.getByRole("button", {name: "Go to slide 2"}))
      .toHaveAttribute("aria-current", "true");
  });

  it("provides at least 44px pointer targets for controls and indicators", async () => {
    await render(<CarouselFixture />);

    const next = page.getByRole("button", {name: "Next slide"}).element();
    const indicator = page.getByRole("button", {name: "Go to slide 1"}).element();

    expect(next.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    // The visible dot stays small (a tight, dense pagination row); the actual hit area is
    // expanded invisibly through ::before instead of inflating the indicator's own box.
    const hitArea = getComputedStyle(indicator, "::before");

    expect(parseFloat(hitArea.width)).toBeGreaterThanOrEqual(44);
    expect(parseFloat(hitArea.height)).toBeGreaterThanOrEqual(44);
  });

  it("reports the real autoplay state through its accessible control", async () => {
    const outside = document.createElement("div");

    outside.setAttribute("data-testid", "carousel-outside");
    outside.style.cssText = "position: fixed; left: 1000px; top: 700px; width: 10px; height: 10px";
    document.body.append(outside);
    await page.getByTestId("carousel-outside").hover();
    await render(<CarouselFixture autoplay={{delay: 150}} showAutoplayControl />);
    const toggle = page.getByRole("button", {name: /autoplay/});

    await expect.element(toggle).toHaveAttribute("aria-label", "Pause autoplay");

    // Reaching the control hovers the carousel, which pauses autoplay on its own.
    await toggle.hover();
    await expect.element(toggle).toHaveAttribute("aria-label", "Play autoplay");

    await toggle.click();
    await expect.element(toggle).toHaveAttribute("aria-label", "Pause autoplay");
  });

  it("pauses and resumes autoplay progress with pointer interaction", async () => {
    const outside = document.createElement("div");

    outside.setAttribute("data-testid", "autoplay-progress-outside");
    outside.style.cssText = "position: fixed; left: 1000px; top: 700px; width: 10px; height: 10px";
    document.body.append(outside);
    await render(<CarouselFixture autoplay={{delay: 1000}} showAutoplayProgress />);

    const root = page.getByRole("region");
    const rootRect = root.element().getBoundingClientRect();
    const progress = root
      .element()
      .querySelector<HTMLElement>('[data-slot="carousel-autoplay-progress"]')!;
    const track = progress.querySelector<HTMLElement>('[data-slot="progress-bar-track"]')!;
    const indicator = root
      .element()
      .querySelector<HTMLElement>('[data-slot="carousel-autoplay-progress-indicator"]')!;

    expect(progress.getBoundingClientRect().top).toBeCloseTo(rootRect.top, 0);
    expect(getComputedStyle(progress).opacity).toBe("0.5");
    expect(track.getBoundingClientRect().height).toBe(4);
    expect(parseFloat(getComputedStyle(track).borderRadius)).toBeGreaterThan(0);
    await expect.poll(() => indicator.getAnimations()[0]?.playState).toBe("running");
    await root.hover();
    await expect.poll(() => indicator.getAnimations()[0]?.playState).toBe("paused");
    await page.getByTestId("autoplay-progress-outside").hover();
    await expect.poll(() => indicator.getAnimations()[0]?.playState).toBe("running");
  });

  it("disables autoplay when a responsive breakpoint leaves one snap", async () => {
    await page.viewport(1200, 600);
    await render(
      <Carousel autoplay itemsPerView={{base: 1, lg: 3, md: 2}}>
        <Carousel.Content>
          {[1, 2, 3].map((value) => (
            <Carousel.Item key={value}>{value}</Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.AutoplayControl />
      </Carousel>,
    );

    await expect.element(page.getByRole("region")).toBeInTheDocument();
    expect(page.getByRole("button", {name: /autoplay/}).query()).toBeNull();
  });
});

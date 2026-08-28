import type {EmblaCarouselType} from "embla-carousel";
import type {ReactNode} from "react";

import {act, fireEvent, render, screen} from "@sy-inc/testing/helpers";
import {useState} from "react";

import {Carousel} from "@/components/carousel";

import {CarouselFixture} from "./fixtures";

describe("Carousel", () => {
  type SelectionCarouselProps = Partial<React.ComponentProps<typeof Carousel>>;

  const renderSelectionCarousel = (props: SelectionCarouselProps = {}) =>
    render(
      <Carousel aria-label="Selection carousel" options={{duration: 1}} {...props}>
        <Carousel.Content>
          {["first", "second", "third"].map((value, index) => (
            <Carousel.Item key={value} aria-label={`${index + 1} of 3`}>
              {value}
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Pagination aria-label="Choose slide" />
      </Carousel>,
    );

  it("notifies once with the initial selection", async () => {
    const onSelectionChange = vi.fn();

    renderSelectionCarousel({onSelectionChange});

    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledTimes(1));
    expect(onSelectionChange).toHaveBeenCalledWith(0);
  });

  it("exposes one selected item and its value", async () => {
    const onSelectionChange = vi.fn();

    renderSelectionCarousel({onSelectionChange});
    const items = screen.getAllByRole("group");

    expect(items.filter((item) => item.dataset["selected"] === "true")).toHaveLength(1);
  });

  it("notifies the index for Previous, Next, and Pagination entry points", async () => {
    const onSelectionChange = vi.fn();

    let api: EmblaCarouselType | undefined;

    renderSelectionCarousel({onApiChange: (nextApi) => (api = nextApi), onSelectionChange});
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledTimes(1));
    onSelectionChange.mockClear();

    vi.spyOn(api!, "selectedSnap").mockReturnValue(1);
    fireEvent.click(screen.getByRole("button", {name: "Next slide"}));
    api!.createEvent("select", {targetSnap: 1, sourceSnap: 0}).emit();
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith(1));
    onSelectionChange.mockClear();

    vi.mocked(api!.selectedSnap).mockReturnValue(0);
    fireEvent.click(screen.getByRole("button", {name: "Previous slide"}));
    api!.createEvent("select", {targetSnap: 0, sourceSnap: 1}).emit();
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith(0));
    onSelectionChange.mockClear();

    // jsdom reports zero-width slides, so Embla collapses to a single snap unless it is told
    // otherwise. Force three snaps to exercise the pagination entry point.
    vi.spyOn(api!, "snapList").mockReturnValue([0, 1, 2]);
    await act(async () => api!.reInit());
    vi.mocked(api!.selectedSnap).mockReturnValue(2);
    fireEvent.click(screen.getByRole("button", {name: "Go to slide 3"}));
    api!.createEvent("select", {targetSnap: 2, sourceSnap: 1}).emit();
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith(2));
  });

  it("notifies from Embla select and ignores duplicate selections from reInit", async () => {
    let api: EmblaCarouselType | undefined;
    const onSelectionChange = vi.fn();

    renderSelectionCarousel({
      onApiChange: (nextApi) => (api = nextApi),
      onSelectionChange,
    });
    await vi.waitFor(() => expect(api).toBeDefined());
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledTimes(1));
    onSelectionChange.mockClear();

    vi.spyOn(api!, "selectedSnap").mockReturnValue(1);
    api!.createEvent("select", {targetSnap: 1, sourceSnap: 0}).emit();
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith(1));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    await act(async () => api!.reInit());
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("uses only the latest callback after onSelectionChange updates", async () => {
    const oldCallback = vi.fn();
    const newCallback = vi.fn();
    let api: EmblaCarouselType | undefined;

    function ControlledCallback() {
      const [callback, setCallback] = useState(() => oldCallback);

      return (
        <>
          <button type="button" onClick={() => setCallback(() => newCallback)}>
            Update callback
          </button>
          <Carousel
            aria-label="Selection carousel"
            onApiChange={(nextApi) => (api = nextApi)}
            onSelectionChange={callback}
          >
            <Carousel.Content>
              {["first", "second", "third"].map((value, index) => (
                <Carousel.Item key={value} aria-label={`${index + 1} of 3`}>
                  {value}
                </Carousel.Item>
              ))}
            </Carousel.Content>
          </Carousel>
        </>
      );
    }

    render(<ControlledCallback />);
    await vi.waitFor(() => expect(api).toBeDefined());
    oldCallback.mockClear();
    newCallback.mockClear();

    fireEvent.click(screen.getByRole("button", {name: "Update callback"}));
    vi.spyOn(api!, "selectedSnap").mockReturnValue(1);
    await act(async () => api!.createEvent("select", {targetSnap: 1, sourceSnap: 0}).emit());

    expect(oldCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalled();
  });

  const renderAutoPaginatedCarousel = ({
    children,
    count = 5,
    onApiChange,
  }: {
    count?: number;
    children?: ({index, isSelected}: {index: number; isSelected: boolean}) => ReactNode;
    onApiChange?: (api: EmblaCarouselType) => void;
  } = {}) =>
    render(
      <Carousel
        aria-label="Auto-paginated content"
        options={{duration: 1, slidesToScroll: 2, draggable: false}}
        style={{width: 320}}
        onApiChange={onApiChange}
      >
        <Carousel.Content>
          {Array.from({length: count}, (_, index) => (
            <Carousel.Item key={index} aria-label={`${index + 1} of ${count}`}>
              Slide {index + 1}
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
        <Carousel.Pagination>{children}</Carousel.Pagination>
      </Carousel>,
    );

  it("creates one pagination button per Embla scroll snap, not per slide", async () => {
    let api: EmblaCarouselType | undefined;

    renderAutoPaginatedCarousel({onApiChange: (nextApi) => (api = nextApi)});

    await vi.waitFor(() => expect(api).toBeDefined());
    const snapCount = api!.snapList().length;

    expect(snapCount).not.toBe(5);
    expect(document.querySelectorAll('[data-slot="carousel-pagination-item"]')).toHaveLength(
      snapCount,
    );
    expect(screen.getAllByRole("button", {name: /Go to slide/})).toHaveLength(snapCount);
  });

  it("updates automatic pagination after Embla reInit changes the slide count", async () => {
    let api: EmblaCarouselType | undefined;

    function DynamicSlides() {
      const [count, setCount] = useState(3);

      return (
        <>
          <button type="button" onClick={() => setCount(5)}>
            Add slides
          </button>
          <Carousel.Content>
            {Array.from({length: count}, (_, index) => (
              <Carousel.Item key={index} aria-label={`${index + 1} of ${count}`}>
                Slide {index + 1}
              </Carousel.Item>
            ))}
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
          <Carousel.Pagination />
        </>
      );
    }

    // Keep the state transition inside the same rendered carousel so reInit is observable.
    const {container} = render(
      <Carousel
        aria-label="Dynamic content"
        options={{duration: 1, slidesToScroll: 2, draggable: false}}
        style={{width: 320}}
        onApiChange={(nextApi) => (api = nextApi)}
      >
        <DynamicSlides />
      </Carousel>,
    );

    await vi.waitFor(() => expect(api).toBeDefined());
    let snapCount = 2;

    vi.spyOn(api!, "snapList").mockImplementation(() =>
      Array.from({length: snapCount}, (_, index) => index),
    );
    await act(async () => api?.reInit());
    await vi.waitFor(() =>
      expect(container.querySelectorAll('[data-slot="carousel-pagination-item"]')).toHaveLength(2),
    );

    fireEvent.click(screen.getByRole("button", {name: "Add slides"}));
    snapCount = 3;
    await act(async () => api?.reInit());

    await vi.waitFor(() =>
      expect(container.querySelectorAll('[data-slot="carousel-pagination-item"]')).toHaveLength(3),
    );
  });

  it("scrolls to the selected snap and exposes only one current indicator", async () => {
    let api: EmblaCarouselType | undefined;

    renderAutoPaginatedCarousel({onApiChange: (nextApi) => (api = nextApi)});

    await vi.waitFor(() => expect(api).toBeDefined());
    vi.spyOn(api!, "snapList").mockReturnValue([0, 1, 2]);
    await act(async () => api?.reInit());
    const goTo = vi.spyOn(api!, "goTo");

    fireEvent.click(screen.getByRole("button", {name: "Go to slide 2"}));

    expect(goTo).toHaveBeenCalledWith(1);
    expect(document.querySelectorAll('button[aria-current="true"]')).toHaveLength(1);
  });

  it("supports render-prop pagination content for numbers and thumbnails", async () => {
    let api: EmblaCarouselType | undefined;

    renderAutoPaginatedCarousel({
      count: 3,
      onApiChange: (nextApi) => (api = nextApi),
      children: ({index}: {index: number; isSelected: boolean}) => (
        <>
          <span data-testid={`pagination-number-${index}`}>{index + 1}</span>
          <img alt={`Thumbnail ${index + 1}`} src={`/thumbnail-${index + 1}.jpg`} />
        </>
      ),
    });

    await vi.waitFor(() => expect(api).toBeDefined());
    vi.spyOn(api!, "snapList").mockReturnValue([0, 1, 2]);
    await act(async () => api?.reInit());

    expect(screen.getByTestId("pagination-number-0")).toHaveTextContent("1");
    expect(screen.getByTestId("pagination-number-2")).toHaveTextContent("3");
    expect(screen.getByRole("img", {name: "Thumbnail 3"})).toBeInTheDocument();

    expect(screen.getAllByRole("button", {name: /Go to slide/})).toHaveLength(3);
  });

  it("keeps control names and 44px pointer-target classes on generated buttons", () => {
    renderAutoPaginatedCarousel({count: 3});

    expect(screen.getByRole("button", {name: "Previous slide"})).toHaveClass("carousel__control");
    expect(screen.getByRole("button", {name: "Next slide"})).toHaveClass("carousel__control");
    for (const button of screen.getAllByRole("button", {name: /Go to slide/})) {
      expect(button).toHaveClass("carousel__pagination-item");
    }
  });

  it("exposes a labelled carousel region and slide semantics", () => {
    render(<CarouselFixture />);

    const carousel = screen.getByRole("region", {name: "Featured content"});

    expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    expect(carousel).toHaveAttribute("data-orientation", "horizontal");
    expect(carousel.className).toEqual(expect.stringContaining("carousel--horizontal"));
    expect(screen.getAllByRole("group", {name: /of 3/})).toHaveLength(3);
    expect(screen.getByRole("group", {name: "1 of 3"})).toHaveAttribute(
      "aria-roledescription",
      "slide",
    );
  });

  it("renders compound parts with documented data slots", () => {
    render(<CarouselFixture />);

    expect(document.querySelector('[data-slot="carousel-viewport"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="carousel-content"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-slot="carousel-item"]')).toHaveLength(3);
    // Item count follows Embla's snap list, which needs real layout; assert the container only.
    expect(document.querySelector('[data-slot="carousel-pagination"]')).not.toBeNull();
  });

  it("exposes accessible labels for controls and pagination", () => {
    render(<CarouselFixture />);

    expect(screen.getByRole("button", {name: "Previous slide"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Next slide"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("maps vertical orientation to Embla and BEM state", () => {
    render(<CarouselFixture orientation="vertical" />);

    const carousel = screen.getByRole("region", {name: "Featured content"});
    const content = document.querySelector('[data-slot="carousel-content"]');

    expect(carousel).toHaveAttribute("data-orientation", "vertical");
    expect(carousel.className).toEqual(expect.stringContaining("carousel--vertical"));
    expect(content).toHaveAttribute("data-orientation", "vertical");
  });

  it("calls onApiChange when Embla initializes", async () => {
    const onApiChange = vi.fn();

    render(
      <Carousel aria-label="API carousel" onApiChange={onApiChange}>
        <Carousel.Content>
          <Carousel.Item aria-label="1 of 1">Only slide</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    );

    await vi.waitFor(() => expect(onApiChange).toHaveBeenCalledTimes(1));
    expect(onApiChange.mock.calls[0]?.[0]).toHaveProperty("goToNext");
  });

  it("rejects parts rendered outside the root", () => {
    expect(() => render(<Carousel.Item>Orphan slide</Carousel.Item>)).toThrow(
      "Carousel parts must be rendered inside Carousel.Root.",
    );
  });

  describe("autoplay", () => {
    beforeEach(() => {
      vi.useFakeTimers({shouldAdvanceTime: true});
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("autoplays with loop enabled and exposes a pause control", async () => {
      render(<CarouselFixture autoplay />);

      const pause = screen.getByRole("button", {name: "Pause autoplay"});

      expect(pause).toHaveAttribute("data-slot", "carousel-autoplay");
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );

      await act(async () => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 2"})).toHaveAttribute(
        "aria-current",
        "true",
      );

      await act(async () => {
        vi.advanceTimersByTime(8000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("pauses and resumes autoplay from its accessible control", async () => {
      render(<CarouselFixture autoplay={{delay: 1000}} />);
      const pause = screen.getByRole("button", {name: "Pause autoplay"});

      fireEvent.click(pause);
      expect(screen.getByRole("button", {name: "Play autoplay"})).toBeInTheDocument();
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );

      fireEvent.click(screen.getByRole("button", {name: "Play autoplay"}));
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 2"})).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("pauses while the pointer is inside and resumes when it leaves", async () => {
      render(<CarouselFixture autoplay={{delay: 1000}} />);
      const root = screen.getByRole("region", {name: "Featured content"});

      fireEvent.pointerEnter(root);
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );

      fireEvent.pointerLeave(root);
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 2"})).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("preserves the remaining delay when pointer pause resumes autoplay", async () => {
      render(<CarouselFixture autoplay={{delay: 1000}} />);
      const root = screen.getByRole("region", {name: "Featured content"});

      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      fireEvent.pointerEnter(root);
      await act(async () => {
        vi.advanceTimersByTime(700);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );

      fireEvent.pointerLeave(root);
      await act(async () => {
        vi.advanceTimersByTime(599);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );
      await act(async () => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole("button", {name: "Go to slide 2"})).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("restarts autoplay with the new delay when autoplay props change", async () => {
      const {rerender} = render(<CarouselFixture autoplay={{delay: 1000}} />);
      const root = screen.getByRole("region", {name: "Featured content"});

      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      rerender(<CarouselFixture autoplay={{delay: 2000}} />);

      await act(async () => {
        vi.advanceTimersByTime(1500);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );
      fireEvent.pointerEnter(root);
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );
      fireEvent.pointerLeave(root);
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.getByRole("button", {name: "Go to slide 2"})).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("stays paused across a drag, which always happens with the pointer inside", async () => {
      render(<CarouselFixture autoplay={{delay: 1000}} options={{draggable: true}} />);
      const root = screen.getByRole("region", {name: "Featured content"});
      const viewport = document.querySelector('[data-slot="carousel-viewport"]')!;

      fireEvent.pointerEnter(root);
      fireEvent.pointerDown(viewport, {pointerId: 1, pointerType: "mouse"});
      fireEvent.pointerUp(viewport, {pointerId: 1, pointerType: "mouse"});
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );

      fireEvent.pointerLeave(root);
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 2"})).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("pauses for a touch drag and resumes when the finger lifts", async () => {
      render(<CarouselFixture autoplay={{delay: 1000}} options={{draggable: true}} />);
      const root = screen.getByRole("region", {name: "Featured content"});
      const viewport = document.querySelector('[data-slot="carousel-viewport"]')!;
      const touch = {pointerId: 1, pointerType: "touch"};

      // A touch pointer has no hover: it enters on finger-down and leaves on finger-up.
      fireEvent.pointerEnter(root, touch);
      fireEvent.pointerDown(viewport, touch);
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );

      fireEvent.pointerUp(viewport, touch);
      fireEvent.pointerLeave(root, touch);
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole("button", {name: "Go to slide 2"})).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("keeps an explicit pause when the pointer leaves", async () => {
      render(<CarouselFixture autoplay={{delay: 1000}} />);
      const root = screen.getByRole("region", {name: "Featured content"});

      fireEvent.click(screen.getByRole("button", {name: "Pause autoplay"}));
      fireEvent.pointerEnter(root);
      fireEvent.pointerLeave(root);
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByRole("button", {name: "Play autoplay"})).toBeInTheDocument();
      expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
        "aria-current",
        "true",
      );
    });

    it("does not start under reduced motion and does not advance after unmount", async () => {
      const originalMatchMedia = window.matchMedia;
      let api: EmblaCarouselType | undefined;

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      try {
        const {unmount} = render(
          <CarouselFixture autoplay={{delay: 1000}} onApiChange={(nextApi) => (api = nextApi)} />,
        );

        expect(screen.getByRole("button", {name: "Play autoplay"})).toBeInTheDocument();
        await act(async () => {
          vi.advanceTimersByTime(2000);
        });
        expect(screen.getByRole("button", {name: "Go to slide 1"})).toHaveAttribute(
          "aria-current",
          "true",
        );

        unmount();
        await act(async () => {
          vi.advanceTimersByTime(4000);
        });
        expect(api?.selectedSnap()).toBe(0);
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });
  });

  it("supports viewport keyboard navigation and opt-in wheel navigation", async () => {
    let api: EmblaCarouselType | undefined;

    render(<CarouselFixture onApiChange={(nextApi) => (api = nextApi)} />);
    const viewport = document.querySelector('[data-slot="carousel-viewport"]')!;

    await vi.waitFor(() => expect(api).toBeDefined());

    vi.spyOn(api!, "canGoToNext").mockReturnValue(true);
    const goToNext = vi.spyOn(api!, "goToNext");

    fireEvent.keyDown(viewport, {key: "ArrowRight"});
    expect(goToNext).toHaveBeenCalledTimes(1);

    const preventDefault = vi.fn();

    fireEvent.wheel(viewport, {deltaY: 100, preventDefault});
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("selects an interactive item once and ignores nested controls", async () => {
    const onSelectionChange = vi.fn();
    const onItemClick = vi.fn();
    let api: EmblaCarouselType | undefined;

    render(
      <Carousel
        clickable
        aria-label="Plans"
        options={{duration: 1}}
        onApiChange={(nextApi) => (api = nextApi)}
        onSelectionChange={onSelectionChange}
      >
        <Carousel.Content>
          <Carousel.Item>One</Carousel.Item>
          <Carousel.Item onClick={onItemClick}>
            Two <button type="button">Details</button>
          </Carousel.Item>
          <Carousel.Item isDisabled>Three</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    );
    await vi.waitFor(() => expect(api).toBeDefined());
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledTimes(1));
    onSelectionChange.mockClear();

    const goTo = vi.spyOn(api!, "goTo");

    fireEvent.click(screen.getByRole("button", {name: "Two Details"}));
    expect(goTo).toHaveBeenCalledWith(1);
    expect(onSelectionChange).not.toHaveBeenCalled();
    vi.spyOn(api!, "selectedSnap").mockReturnValue(1);
    api!.createEvent("select", {targetSnap: 1, sourceSnap: 0}).emit();
    await vi.waitFor(() => expect(onSelectionChange).toHaveBeenCalledWith(1));

    goTo.mockClear();
    onItemClick.mockClear();
    fireEvent.click(screen.getByRole("button", {name: "Details"}));
    expect(goTo).not.toHaveBeenCalled();
    // A nested control suppresses selection, never the item's own onClick.
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", {name: "Three"})).toHaveAttribute("aria-disabled", "true");
  });
});

import type {Meta, StoryObj} from "@storybook/react";
import type {EmblaCarouselType} from "embla-carousel";

import React, {useCallback, useEffect, useRef, useState} from "react";

import {Carousel} from "./index";

const slides = Array.from({length: 16}, (_, index) => ({
  color: `hsl(${Math.floor(Math.random() * 360)} 70% 60%)`,
  label: `Slide ${index + 1}`,
}));

const meta = {
  component: Carousel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Components/Carousel",
} satisfies Meta<typeof Carousel>;

export default meta;

type Story = StoryObj<typeof meta>;

const renderCarousel = (
  orientation: "horizontal" | "vertical" = "horizontal",
  autoplay = false,
) => (
  <Carousel
    aria-label="Featured content"
    autoplay={autoplay ? {delay: 1000} : undefined}
    orientation={orientation}
    className={
      (orientation === "horizontal" ? "w-[min(24rem,calc(100vw-2rem))]" : "h-96 w-72") +
      " rounded-3xl"
    }
  >
    <Carousel.Content>
      {slides.map((slide, index) => (
        <Carousel.Item key={slide.label} aria-label={`${index + 1} of ${slides.length}`}>
          <div
            className="flex h-64 items-center justify-center text-xl font-semibold"
            style={{backgroundColor: slide.color}}
          >
            {slide.label}
          </div>
        </Carousel.Item>
      ))}
    </Carousel.Content>
    <Carousel.Previous />
    <Carousel.Next />
    <Carousel.Pagination aria-label="Choose slide" />
  </Carousel>
);

export const Default: Story = {
  render: () => renderCarousel(),
};

export const Vertical: Story = {
  render: () => renderCarousel("vertical"),
};

export const VerticalPeek: Story = {
  render: () => (
    <Carousel
      aria-label="Vertical peek carousel"
      className="h-96 w-72"
      gap={8}
      orientation="vertical"
      peek="15%"
    >
      <Carousel.Content>
        {slides.slice(0, 6).map((slide, index) => (
          <Carousel.Item key={slide.label} aria-label={`${index + 1} of 6`}>
            <div
              className="flex h-full items-center justify-center rounded-3xl text-lg font-semibold"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Pagination aria-label="Choose vertical slide" />
    </Carousel>
  ),
};

export const Autoplay: Story = {
  render: () => renderCarousel("horizontal", true),
};

export const AutoplayInteraction: Story = {
  render: () => (
    <div className="grid w-[min(64rem,calc(100vw-2rem))] gap-8 md:grid-cols-2">
      {(["resume", "stop"] as const).map((interaction) => (
        <Carousel
          key={interaction}
          aria-label={`${interaction} autoplay`}
          autoplay={{delay: 1500}}
          autoplayInteraction={interaction}
        >
          <Carousel.Content>
            {slides.slice(0, 4).map((slide, index) => (
              <Carousel.Item key={slide.label} aria-label={`${index + 1} of 4`}>
                <div
                  className="flex h-48 items-center justify-center rounded-3xl text-lg font-semibold"
                  style={{backgroundColor: slide.color}}
                >
                  {interaction}: {slide.label}
                </div>
              </Carousel.Item>
            ))}
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
          <Carousel.Pagination aria-label={`Choose ${interaction} slide`} />
        </Carousel>
      ))}
    </div>
  ),
};

export const Peek: Story = {
  render: () => (
    <Carousel
      aria-label="Peek carousel"
      className="w-[min(42rem,calc(100vw-2rem))]"
      gap={8}
      itemsPerView={1}
      peek="10%"
    >
      <Carousel.Content>
        {slides.map((slide, index) => (
          <Carousel.Item key={slide.label} aria-label={`${index + 1} of ${slides.length}`}>
            <div
              className="flex h-48 items-center justify-center rounded-3xl text-lg font-semibold"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Pagination aria-label="Choose slide" />
    </Carousel>
  ),
};

export const PeekTwo: Story = {
  render: () => (
    <Carousel
      aria-label="Two-card peek carousel"
      className="w-[min(42rem,calc(100vw-2rem))]"
      gap={8}
      itemsPerView={2}
      peek="8%"
    >
      <Carousel.Content>
        {slides.map((slide, index) => (
          <Carousel.Item key={slide.label} aria-label={`${index + 1} of ${slides.length}`}>
            <div
              className="flex h-48 items-center justify-center rounded-3xl text-lg font-semibold"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Pagination aria-label="Choose slide" />
    </Carousel>
  ),
};

export const PeekThree: Story = {
  render: () => (
    <Carousel
      aria-label="Three-card peek carousel"
      className="w-[min(42rem,calc(100vw-2rem))]"
      gap={8}
      itemsPerView={3}
      options={{loop: true, dragFree: "snap"}}
      peek="8%"
      slidesToScroll={1}
    >
      <Carousel.Content>
        {slides.map((slide, index) => (
          <Carousel.Item key={slide.label} aria-label={`${index + 1} of ${slides.length}`}>
            <div
              className="flex h-48 items-center justify-center rounded-3xl text-lg font-semibold"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Pagination aria-label="Choose slide" />
    </Carousel>
  ),
};

export const ResponsiveItems: Story = {
  render: () => (
    <Carousel
      aria-label="Responsive items carousel"
      className="w-[min(64rem,calc(100vw-2rem))]"
      gap={{base: 8, sm: 16, lg: 24}}
      itemsPerView={{base: 1, sm: 2, lg: 3}}
      peek={{base: 8, md: 12, lg: 16}}
    >
      <Carousel.Content>
        {slides.map((slide, index) => (
          <Carousel.Item key={slide.label} aria-label={`${index + 1} of ${slides.length}`}>
            <div
              className="flex h-48 items-center justify-center rounded-3xl text-lg font-semibold"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Pagination aria-label="Choose slide" />
    </Carousel>
  ),
};

export const CenteredEmphasis: Story = {
  render: () => (
    <Carousel
      aria-label="Centered emphasis"
      className="w-[min(42rem,calc(100vw-2rem))]"
      itemsPerView={1}
      peek="10%"
    >
      <Carousel.Content>
        {slides.slice(0, 6).map((slide, index) => (
          <Carousel.Item
            key={slide.label}
            aria-label={`${index + 1} of 6`}
            className="transition duration-200 data-[selected=false]:opacity-50 data-[selected=true]:scale-[1.02] data-[selected=true]:opacity-100"
            value={slide.label}
          >
            <div
              className="flex h-48 items-center justify-center rounded-3xl text-lg font-semibold"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Pagination aria-label="Choose slide" />
    </Carousel>
  ),
};

export const CustomPagination: Story = {
  render: () => (
    <Carousel aria-label="Custom pagination" className="w-[min(24rem,calc(100vw-2rem))]">
      <Carousel.Content>
        {slides.map((slide) => (
          <Carousel.Item key={slide.label}>
            <div
              className="flex h-48 items-center justify-center rounded-3xl text-lg font-semibold"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Pagination aria-label="Choose slide">
        {({index, isSelected}) => (
          <span className={isSelected ? "font-semibold text-accent" : "text-muted"}>
            {index + 1}
          </span>
        )}
      </Carousel.Pagination>
    </Carousel>
  ),
};

export const MultipleItems: Story = {
  render: () => (
    <Carousel
      aria-label="Related content"
      className="w-[min(42rem,calc(100vw-2rem))]"
      options={{align: "start"}}
    >
      <Carousel.Content className="-ml-4">
        {slides.map((slide, index) => (
          <Carousel.Item
            key={slide.label}
            aria-label={`${index + 1} of ${slides.length}`}
            className="basis-1/2 pl-4"
          >
            <div
              className="flex h-48 items-center justify-center rounded-3xl font-medium"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
    </Carousel>
  ),
};

export const InteractiveItems: Story = {
  render: () => (
    <Carousel
      clickable
      wheelNavigation
      aria-label="Choose a plan"
      className="w-[min(42rem,calc(100vw-2rem))]"
    >
      <Carousel.Content>
        {slides.map((slide, index) => (
          <Carousel.Item key={slide.label} aria-label={`${index + 1} of ${slides.length}`}>
            <div
              className="flex h-48 items-center justify-center rounded-3xl text-lg font-semibold"
              style={{backgroundColor: slide.color}}
            >
              {slide.label}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
    </Carousel>
  ),
};

const pickerValues = Array.from({length: 18}, (_, index) => index);
const PICKER_ITEM_SIZE = 32;
const PICKER_ITEM_COUNT = pickerValues.length;
const PICKER_ITEM_RADIUS = 360 / PICKER_ITEM_COUNT;
const PICKER_IN_VIEW_DEGREES = PICKER_ITEM_RADIUS * 4;
const PICKER_WHEEL_RADIUS = Math.round(
  PICKER_ITEM_SIZE / 2 / Math.tan(Math.PI / PICKER_ITEM_COUNT),
);

const IOSPicker = ({loop}: {loop: boolean}) => {
  const [api, setApi] = useState<EmblaCarouselType>();
  const rootRef = useRef<HTMLDivElement>(null);
  const totalRadius = PICKER_ITEM_COUNT * PICKER_ITEM_RADIUS;

  const updateWheel = useCallback(
    (emblaApi: EmblaCarouselType) => {
      const rotationOffset = loop ? 0 : PICKER_ITEM_RADIUS;
      const rotation = totalRadius - rotationOffset;

      emblaApi.containerNode().style.transform = `translateZ(${PICKER_WHEEL_RADIUS}px) rotateX(${rotation * emblaApi.scrollProgress()}deg)`;

      const wheelLocation = emblaApi.scrollProgress() * totalRadius;

      emblaApi.slideNodes().forEach((slideNode, index) => {
        const snapCount = loop ? PICKER_ITEM_COUNT : PICKER_ITEM_COUNT - 1;
        const position = (index / snapCount) * totalRadius;
        const positionStart = position + totalRadius;
        const positionEnd = position - totalRadius;
        let angle = index * -PICKER_ITEM_RADIUS;
        let visible = Math.abs(wheelLocation - position) < PICKER_IN_VIEW_DEGREES;

        if (loop && Math.abs(wheelLocation - positionEnd) < PICKER_IN_VIEW_DEGREES) {
          visible = true;
          angle = -360 + (PICKER_ITEM_COUNT - index) * PICKER_ITEM_RADIUS;
        }
        if (loop && Math.abs(wheelLocation - positionStart) < PICKER_IN_VIEW_DEGREES) {
          visible = true;
          angle = -(totalRadius % 360) - index * PICKER_ITEM_RADIUS;
        }

        slideNode.style.opacity = visible ? "1" : "0";
        slideNode.style.transform = visible
          ? `translateY(-${index * 100}%) rotateX(${angle}deg) translateZ(${PICKER_WHEEL_RADIUS}px)`
          : "none";
      });
    },
    [loop, totalRadius],
  );

  useEffect(() => {
    if (!api) return;
    const {slideLooper, translate} = api.internalEngine();

    translate.clear();
    translate.toggleActive(false);
    slideLooper.loopPoints.forEach(({translate: loopTranslate}) => {
      loopTranslate.clear();
      loopTranslate.toggleActive(false);
    });
    api.on("scroll", updateWheel);
    api.on("reInit", updateWheel);
    updateWheel(api);

    return () => {
      api.off("scroll", updateWheel);
      api.off("reInit", updateWheel);
    };
  }, [api, updateWheel]);

  return (
    <div
      ref={rootRef}
      className="bg-surface-subtle relative h-[22.2rem] w-full max-w-[30rem] overflow-hidden rounded-2xl"
    >
      <div className="from-surface-subtle/70 to-surface-subtle pointer-events-none absolute inset-x-0 top-0 z-10 h-[calc(50%_-_16px)] border-b border-border/30 bg-gradient-to-t" />
      <div className="from-surface-subtle/70 to-surface-subtle pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[calc(50%_-_16px)] border-t border-border/30 bg-gradient-to-b" />
      <Carousel
        aria-label={loop ? "iOS style looping picker" : "iOS style picker"}
        className="h-full w-full"
        options={{containScroll: false, dragFree: true, loop, watchSlides: false}}
        orientation="vertical"
        onApiChange={setApi}
      >
        <Carousel.Content className="h-8 [will-change:transform] [transform-style:preserve-3d]">
          {pickerValues.map((value) => (
            <Carousel.Item
              key={value}
              aria-label={`${value}, ${value + 1} of ${PICKER_ITEM_COUNT}`}
              className="flex h-8 basis-8 items-center justify-center text-[19px] leading-none [backface-visibility:hidden] [perspective:1000px]"
            >
              {value}
            </Carousel.Item>
          ))}
        </Carousel.Content>
      </Carousel>
    </div>
  );
};

export const IOSStylePickerDefault: Story = {
  render: () => <IOSPicker loop={false} />,
};

export const IOSStylePickerLoop: Story = {
  render: () => <IOSPicker loop />,
};

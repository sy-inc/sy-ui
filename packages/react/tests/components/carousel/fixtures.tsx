import type {EmblaCarouselType} from "embla-carousel";

import {Carousel} from "@/components/carousel";

const slideLabels = ["First slide", "Second slide", "Third slide"];

export function CarouselFixture({
  autoplay,
  clickable = false,
  onApiChange,
  options,
  orientation = "horizontal",
  wheelNavigation = false,
}: {
  autoplay?: boolean | {delay?: number};
  onApiChange?: (api: EmblaCarouselType) => void;
  orientation?: "horizontal" | "vertical";
  options?: {duration?: number; loop?: boolean; draggable?: boolean};
  wheelNavigation?: boolean;
  clickable?: boolean;
}) {
  return (
    <Carousel
      aria-label="Featured content"
      autoplay={autoplay}
      clickable={clickable}
      options={{duration: 1, draggable: false, ...options}}
      orientation={orientation}
      style={orientation === "horizontal" ? {width: 320} : {height: 320, width: 240}}
      wheelNavigation={wheelNavigation}
      onApiChange={onApiChange}
    >
      <Carousel.Content>
        {slideLabels.map((label, index) => (
          <Carousel.Item key={label} aria-label={`${index + 1} of ${slideLabels.length}`}>
            <div style={{height: 160}}>{label}</div>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Previous />
      <Carousel.Next />
      <Carousel.Pagination aria-label="Choose slide" />
    </Carousel>
  );
}

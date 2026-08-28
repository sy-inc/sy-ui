import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Carousel} from "@/components/carousel";

describe("Carousel SSR", () => {
  it("renders compound structure without hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <Carousel aria-label="Featured content">
        <Carousel.Content>
          <Carousel.Item aria-label="1 of 1">First slide</Carousel.Item>
        </Carousel.Content>
      </Carousel>,
    );

    expect(html).toContain('data-slot="carousel"');
    expect(html).toContain('data-slot="carousel-viewport"');
    expect(html).toContain('aria-roledescription="slide"');
  });
});

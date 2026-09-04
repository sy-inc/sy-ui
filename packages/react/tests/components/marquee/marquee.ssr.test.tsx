import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Marquee} from "@/components/marquee";

describe("Marquee SSR", () => {
  it("renders without hydration mismatch with default props", async () => {
    await ssrSmoke(<Marquee>Scrolling content</Marquee>);
  });

  it("renders without hydration mismatch with motion props", async () => {
    await ssrSmoke(
      <Marquee
        autoFill
        gradient
        pauseOnInteraction
        delay={1}
        direction="up"
        gap={24}
        speed={80}
        style={{"--marquee-gradient-width": "20%", "--marquee-iterations": "3"}}
      >
        Scrolling content
      </Marquee>,
    );
  });
});

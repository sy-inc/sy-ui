import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Marquee} from "@/components/marquee";

describe("Marquee SSR", () => {
  it("renders without hydration mismatch with default props", async () => {
    await ssrSmoke(
      <Marquee>
        <Marquee.Content>Scrolling content</Marquee.Content>
      </Marquee>,
    );
  });

  it("renders without hydration mismatch with motion props and adornments", async () => {
    await ssrSmoke(
      <Marquee>
        <Marquee.Prefix>Notice</Marquee.Prefix>
        <Marquee.Content
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
        </Marquee.Content>
        <Marquee.Suffix>
          <a href="#details">Details</a>
        </Marquee.Suffix>
      </Marquee>,
    );
  });
});

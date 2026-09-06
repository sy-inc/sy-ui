import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {MessageBubble} from "@/components/message-bubble";

import "../../../../styles/dist/sy-inc.min.css";

const contrast = (foreground: string, background: string) => {
  const channels = (value: string) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);

    return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };
  const luminance = (rgb: number[]) =>
    rgb
      .map((channel) => channel / 255)
      .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
      .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index]!, 0);
  const [first, second] = [luminance(channels(foreground)), luminance(channels(background))].sort(
    (a, b) => b - a,
  );

  return (first! + 0.05) / (second! + 0.05);
};

const Fixture = ({
  content,
  direction = "received",
  theme = "light",
  time = "09:41",
  width = 260,
}: {
  content: React.ReactNode;
  direction?: "sent" | "received";
  theme?: "light" | "dark";
  time?: string;
  width?: number;
}) => (
  <div data-theme={theme} style={{width}}>
    <MessageBubble content={content} direction={direction} time={time} />
  </div>
);

const lastTextRect = (content: HTMLElement) => {
  const range = document.createRange();

  range.selectNodeContents(document.createTreeWalker(content, NodeFilter.SHOW_TEXT).nextNode()!);
  const rects = [...range.getClientRects()];

  return rects.at(-1)!;
};

describe("MessageBubble (browser)", () => {
  it.each(["received", "sent"] as const)(
    "overlays %s image-only time without adding a blank footer",
    async (direction) => {
      const image = (
        <img
          alt="Photo"
          height={100}
          src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100"/>'
          width={150}
        />
      );

      await render(
        <div style={{width: 260}}>
          <MessageBubble
            content={
              <>
                {" "}
                {image}
                {"\n"}
              </>
            }
            direction={direction}
            time="09:41"
          />
          <MessageBubble content={image} direction={direction} />
        </div>,
      );

      const bubbles = [
        ...document.querySelectorAll<HTMLElement>('[data-slot="message-bubble-content"]'),
      ];
      const photo = bubbles[0]!.querySelector("img")!;

      await Promise.all(bubbles.map((bubble) => bubble.querySelector("img")!.decode()));
      const bounds = bubbles[0]!.getBoundingClientRect();
      const photoRect = photo.getBoundingClientRect();
      const time = bubbles[0]!.querySelector("time")!;
      const timeRect = time.getBoundingClientRect();

      expect(bounds.height).toBeCloseTo(bubbles[1]!.getBoundingClientRect().height, 0);
      const style = getComputedStyle(bubbles[0]!);

      expect(bounds.height - photoRect.height).toBeCloseTo(
        Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth),
        0,
      );
      expect(timeRect.top).toBeGreaterThanOrEqual(photoRect.top);
      expect(timeRect.bottom).toBeLessThanOrEqual(photoRect.bottom);
      expect(getComputedStyle(time).bottom).toBe("3px");
      expect(bubbles[0]!.querySelector('[data-slot="message-bubble-text"]')).toBeNull();
    },
  );

  it.each(["received", "sent"] as const)(
    "keeps %s text and links clear of the absolute timestamp as width changes",
    async (direction) => {
      await render(
        <div data-testid="width-matrix" style={{width: 480}}>
          <MessageBubble content="Short message" direction={direction} time="09:42" />
          <MessageBubble
            content="test test test test test test test test test test test test test test test test"
            direction={direction}
            time="09:42"
          />
          <MessageBubble
            direction={direction}
            time="09:42"
            content={
              <>
                Here is the <a href="https://example.test/guide">travel guide</a> for this trip.
              </>
            }
          />
          <MessageBubble content={"中文消息\n末行文字和时间"} direction={direction} time="09:42" />
          <MessageBubble
            direction={direction}
            time="09:42"
            content={
              <>
                <img
                  alt="Trip preview"
                  height={100}
                  src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100"/>'
                  width={150}
                />
                Shall we go here? <a href="https://example.test/trip">View the itinerary</a>
              </>
            }
          />
        </div>,
      );

      const wrapper = page.getByTestId("width-matrix").element() as HTMLElement;

      await Promise.all([...wrapper.querySelectorAll("img")].map((image) => image.decode()));
      for (let width = 120; width <= 480; width += 10) {
        wrapper.style.width = `${width}px`;
        for (const content of wrapper.querySelectorAll<HTMLElement>(
          '[data-slot="message-bubble-content"]',
        )) {
          const time = content.querySelector<HTMLElement>("time")!;
          const timeRect = time.getBoundingClientRect();
          const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
          let node: Node | null;

          for (const image of content.querySelectorAll("img")) {
            expect(image.getBoundingClientRect().bottom).toBeLessThanOrEqual(timeRect.top);
          }
          while ((node = walker.nextNode())) {
            if (time.contains(node) || !node.textContent?.trim()) continue;
            const range = document.createRange();

            range.selectNodeContents(node);
            for (const rect of range.getClientRects()) {
              const overlaps =
                rect.left < timeRect.right &&
                rect.right > timeRect.left &&
                rect.top < timeRect.bottom &&
                rect.bottom > timeRect.top;

              expect(overlaps, `Overlapping ${node.textContent} at ${width}px`).toBe(false);
            }
          }
        }
      }
    },
  );

  it("keeps images flush and gives mixed text and time their own margin", async () => {
    await render(
      <Fixture
        content={
          <>
            <img
              alt="Preview"
              height={100}
              src={
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100"/>'
              }
              width={150}
            />
            Shall we go here? <a href="https://example.test/trip">View the itinerary</a>
          </>
        }
      />,
    );

    const content = document.querySelector<HTMLElement>('[data-slot="message-bubble-content"]')!;
    const image = page.getByRole("img", {name: "Preview"}).element() as HTMLImageElement;

    await image.decode();
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    const range = document.createRange();

    range.selectNodeContents(walker.nextNode()!);
    const textRect = range.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    expect(getComputedStyle(content).padding).toBe("0px");
    const contentStyle = getComputedStyle(content);

    expect(imageRect.left - contentRect.left).toBeCloseTo(
      Number.parseFloat(contentStyle.borderLeftWidth),
      0,
    );
    expect(contentRect.right - imageRect.right).toBeCloseTo(
      Number.parseFloat(contentStyle.borderRightWidth),
      0,
    );
    expect(imageRect.top - contentRect.top).toBeCloseTo(
      Number.parseFloat(contentStyle.borderTopWidth),
      0,
    );
    const cornerInset = Number.parseFloat(contentStyle.borderTopLeftRadius) / 10;

    expect(
      document.elementFromPoint(contentRect.left + cornerInset, contentRect.top + cornerInset),
    ).not.toBe(image);
    expect(document.elementFromPoint(imageRect.right - 2, imageRect.bottom - 2)).toBe(image);
    expect(textRect.left - contentRect.left).toBeGreaterThanOrEqual(8);
    expect(textRect.top - imageRect.bottom).toBeGreaterThanOrEqual(8);
    const time = document.querySelector<HTMLElement>('[data-slot="message-bubble-time"]')!;

    expect(contentRect.right - time.getBoundingClientRect().right).toBeGreaterThanOrEqual(8);
    expect(getComputedStyle(time).bottom).toBe("3px");
    expect(contentRect.bottom - time.getBoundingClientRect().bottom).toBeCloseTo(
      3 + Number.parseFloat(contentStyle.borderBottomWidth),
      0,
    );
  });

  it.each([
    ["light", "received", 260],
    ["light", "sent", 260],
    ["dark", "received", 160],
    ["dark", "sent", 160],
  ] as const)(
    "keeps %s %s text readable and within a %spx container",
    async (theme, direction, width) => {
      await render(
        <Fixture
          content="A multi-line message proves that readable content and its timestamp share a safe layout."
          direction={direction}
          theme={theme}
          width={width}
        />,
      );

      const root = document.querySelector<HTMLElement>('[data-slot="message-bubble"]')!;
      const content = document.querySelector<HTMLElement>('[data-slot="message-bubble-content"]')!;
      const time = document.querySelector<HTMLElement>('[data-slot="message-bubble-time"]')!;
      const contentStyle = getComputedStyle(content);
      const timeStyle = getComputedStyle(time);
      const rootRect = root.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();

      expect(contentRect.width).toBeLessThanOrEqual(width * 0.75 + 1);
      expect(timeStyle.position).toBe("absolute");
      expect(timeStyle.fontSize).toBe("12px");
      expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      const contentContrast = contrast(contentStyle.color, contentStyle.backgroundColor);
      const timeContrast = contrast(timeStyle.color, contentStyle.backgroundColor);

      expect(contentContrast).toBeGreaterThanOrEqual(4.5);
      expect(timeContrast).toBeGreaterThanOrEqual(4.5);
      expect(timeContrast).toBeLessThan(contentContrast);
      expect(Number.parseFloat(timeStyle.fontSize)).toBeLessThan(
        Number.parseFloat(contentStyle.fontSize),
      );
      expect(contentRect.left).toBeGreaterThanOrEqual(rootRect.left);
      expect(contentRect.right).toBeLessThanOrEqual(rootRect.right + 1);
    },
  );

  it("keeps a fitting time on the final text line with a gap", async () => {
    await render(<Fixture content="Short message" time="09:41" width={260} />);

    const content = document.querySelector<HTMLElement>('[data-slot="message-bubble-content"]')!;
    const time = document.querySelector<HTMLElement>('[data-slot="message-bubble-time"]')!;
    const text = lastTextRect(content);
    const timeRect = time.getBoundingClientRect();

    expect(timeRect.top).toBeLessThan(text.bottom);
    expect(timeRect.left - text.right).toBeGreaterThanOrEqual(7);
    expect(timeRect.right).toBeLessThanOrEqual(content.getBoundingClientRect().right + 1);
  });

  it("moves an overflowing time to the right of a new final line", async () => {
    await render(
      <Fixture
        content="A message whose final word leaves no room"
        time="Longer timestamp"
        width={160}
      />,
    );

    const content = document.querySelector<HTMLElement>('[data-slot="message-bubble-content"]')!;
    const time = document.querySelector<HTMLElement>('[data-slot="message-bubble-time"]')!;
    const text = lastTextRect(content);
    const timeRect = time.getBoundingClientRect();
    const textRect = time.parentElement!.getBoundingClientRect();

    expect(timeRect.top).toBeGreaterThanOrEqual(text.bottom);
    expect(Math.abs(timeRect.right - textRect.right)).toBeLessThanOrEqual(1);
    expect(content.getBoundingClientRect().bottom - timeRect.bottom).toBeCloseTo(
      3 + Number.parseFloat(getComputedStyle(content).borderBottomWidth),
      0,
    );
  });

  it("finds adjacent exact-fit and just-too-small widths from actual layout", async () => {
    await render(<Fixture content="Exact-fit timestamp boundary" time="09:47" width={100} />);

    const wrapper = document.querySelector<HTMLElement>("[data-theme]")!;
    const content = document.querySelector<HTMLElement>('[data-slot="message-bubble-content"]')!;
    const time = document.querySelector<HTMLElement>('[data-slot="message-bubble-time"]')!;
    let exactFitWidth = 0;
    let overflowingWidth = 0;

    for (let width = 100; width <= 500; width += 1) {
      wrapper.style.width = `${width}px`;
      const fits = time.getBoundingClientRect().top < lastTextRect(content).bottom;

      if (!fits) overflowingWidth = width;
      if (fits && overflowingWidth === width - 1) {
        exactFitWidth = width;
        break;
      }
    }

    expect(exactFitWidth).toBeGreaterThan(100);
    wrapper.style.width = `${exactFitWidth - 1}px`;
    expect(time.getBoundingClientRect().top).toBeGreaterThanOrEqual(lastTextRect(content).bottom);

    wrapper.style.width = `${exactFitWidth}px`;
    const exactFitTime = time.getBoundingClientRect();
    const exactFitText = lastTextRect(content);

    expect(exactFitTime.top).toBeLessThan(exactFitText.bottom);
    expect(exactFitTime.left - exactFitText.right).toBeGreaterThanOrEqual(7);
  });

  it("keeps a spaced timestamp in one line", async () => {
    await render(<Fixture content="Message" time="A longer time" width={220} />);

    const time = document.querySelector<HTMLElement>('[data-slot="message-bubble-time"]')!;

    expect(time.getClientRects()).toHaveLength(1);
  });

  it("preserves a terminal newline as one extra line without a time footer gap", async () => {
    await render(
      <div style={{width: 320}}>
        <Fixture content="A terminal newline" time="09:41" width={320} />
        <Fixture content={"A terminal newline\n"} time="09:41" width={320} />
      </div>,
    );

    const roots = [...document.querySelectorAll<HTMLElement>('[data-slot="message-bubble"]')];
    const [plainRoot, newlineRoot] = roots;
    const newlineTime = newlineRoot!.querySelector<HTMLElement>(
      '[data-slot="message-bubble-time"]',
    )!;
    const plainContent = plainRoot!.querySelector<HTMLElement>(
      '[data-slot="message-bubble-content"]',
    )!;
    const newlineContent = newlineRoot!.querySelector<HTMLElement>(
      '[data-slot="message-bubble-content"]',
    )!;
    const lineHeight = Number.parseFloat(getComputedStyle(newlineContent).lineHeight);
    const newlineRect = newlineContent.getBoundingClientRect();
    const newlineTimeRect = newlineTime.getBoundingClientRect();

    expect(newlineRect.height - plainContent.getBoundingClientRect().height).toBeCloseTo(
      lineHeight,
      0,
    );
    expect(newlineRect.bottom - newlineTimeRect.bottom).toBeLessThanOrEqual(
      Number.parseFloat(getComputedStyle(newlineTime.parentElement!).marginBottom) + 1,
    );
  });

  it("keeps a long URL inside its real flex parent", async () => {
    await render(
      <div className="flex min-w-0" data-testid="flex-parent" style={{width: 180}}>
        <div className="min-w-0 flex-1">
          <MessageBubble
            content="https://example.test/a-very-long-url-without-any-natural-break-points"
            time="09:42"
          />
        </div>
      </div>,
    );

    const parent = document.querySelector<HTMLElement>('[data-testid="flex-parent"]')!;

    expect(parent.scrollWidth).toBeLessThanOrEqual(parent.clientWidth);
  });

  it("keeps short bubbles smaller than their seventy-five-percent ceiling", async () => {
    await render(<Fixture content="Hi" time="09:41" width={320} />);

    const content = document.querySelector<HTMLElement>('[data-slot="message-bubble-content"]')!;

    expect(content.getBoundingClientRect().width).toBeLessThan(320 * 0.75);
  });

  it("fits an image and a long link in a narrow bubble with time below the image", async () => {
    await render(
      <Fixture
        content={
          <>
            <a href="https://example.test/a-very-long-link-without-breaks">
              https://example.test/a-very-long-link-without-breaks
            </a>
            <img
              alt="Landscape preview"
              height={400}
              src={
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="teal"/></svg>'
              }
              width={600}
            />
          </>
        }
        width={180}
      />,
    );

    const image = page.getByRole("img", {name: "Landscape preview"}).element() as HTMLImageElement;

    await image.decode();
    const root = document.querySelector<HTMLElement>('[data-slot="message-bubble"]')!;
    const time = document.querySelector<HTMLElement>('[data-slot="message-bubble-time"]')!;
    const imageRect = image.getBoundingClientRect();

    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
    expect(imageRect.width).toBeGreaterThan(0);
    expect(imageRect.width / imageRect.height).toBeCloseTo(1.5, 1);
    expect(time.getBoundingClientRect().top).toBeGreaterThanOrEqual(imageRect.bottom);

    const link = page.getByRole("link").element() as HTMLAnchorElement;

    await userEvent.tab();
    expect(document.activeElement).toBe(link);
    expect(getComputedStyle(link).textDecorationLine).toContain("underline");
    expect(getComputedStyle(link).outlineStyle).toBe("solid");
  });
});

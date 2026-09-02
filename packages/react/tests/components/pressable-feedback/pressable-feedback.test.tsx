import {
  advanceTimersByTime,
  cleanup,
  render,
  runAllTimers,
  screen,
  setupUser,
} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {PressableFeedback} from "@/components/pressable-feedback";

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`);
const waves = () => document.querySelectorAll('[data-slot="pressable-feedback-ripple-wave"]');

/** jsdom reports empty rects, so stand in a real one for the wave geometry. */
const stubRect = () =>
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    bottom: 80,
    height: 80,
    left: 0,
    right: 200,
    top: 0,
    width: 200,
    x: 0,
    y: 0,
  } as DOMRect);

describe("PressableFeedback", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    user = setupUser({advanceTimers: vi.advanceTimersByTime});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
    runAllTimers();
    vi.useRealTimers();
  });

  describe("root", () => {
    it("renders a pressable button that forwards its ref and press events", async () => {
      const onPress = vi.fn();
      const ref = createRef<HTMLButtonElement>();

      render(
        <PressableFeedback ref={ref} className="tile" onPress={onPress}>
          Press me
        </PressableFeedback>,
      );

      const root = screen.getByRole("button", {name: "Press me"});

      expect(root).toHaveAttribute("data-slot", "pressable-feedback");
      expect(root).toHaveClass("pressable-feedback", "tile");
      expect(ref.current).toBe(root);

      await user.click(root);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("exposes disabled state to assistive technology", () => {
      render(<PressableFeedback isDisabled>Press me</PressableFeedback>);

      expect(screen.getByRole("button", {name: "Press me"})).toBeDisabled();
    });
  });

  describe("highlight", () => {
    it("renders a decorative overlay", () => {
      render(
        <PressableFeedback>
          <PressableFeedback.Highlight className="bg-primary" />
          Press me
        </PressableFeedback>,
      );

      const highlight = slot("pressable-feedback-highlight")!;

      expect(highlight).toHaveAttribute("aria-hidden", "true");
      expect(highlight).toHaveClass("pressable-feedback__highlight", "bg-primary");
    });
  });

  describe("scale", () => {
    it("wraps its children", () => {
      render(
        <PressableFeedback>
          <PressableFeedback.Scale>Press me</PressableFeedback.Scale>
        </PressableFeedback>,
      );

      const scale = slot("pressable-feedback-scale")!;

      expect(scale).toHaveClass("pressable-feedback__scale");
      expect(scale).toHaveTextContent("Press me");
    });

    it("stays in the accessible name so wrapped labels are still announced", () => {
      render(
        <PressableFeedback>
          <PressableFeedback.Scale>Press me</PressableFeedback.Scale>
        </PressableFeedback>,
      );

      expect(screen.getByRole("button", {name: "Press me"})).toBeInTheDocument();
    });
  });

  describe("ripple", () => {
    it("adds a wave on press and clears it once the wave expires", async () => {
      render(
        <PressableFeedback>
          <PressableFeedback.Ripple duration={300} />
          Press me
        </PressableFeedback>,
      );

      const ripple = slot("pressable-feedback-ripple")!;

      expect(ripple.getAttribute("style")).toContain("--pressable-feedback-ripple-duration: 300ms");
      expect(waves()).toHaveLength(0);

      await user.click(screen.getByRole("button", {name: "Press me"}));

      expect(waves()).toHaveLength(1);

      advanceTimersByTime(200);

      expect(waves()).toHaveLength(1);

      advanceTimersByTime(200);

      expect(waves()).toHaveLength(0);
    });

    it("drops mounted waves when its duration changes mid-flight", async () => {
      const {rerender} = render(
        <PressableFeedback>
          <PressableFeedback.Ripple duration={300} />
          Press me
        </PressableFeedback>,
      );

      await user.click(screen.getByRole("button", {name: "Press me"}));

      expect(waves()).toHaveLength(1);

      rerender(
        <PressableFeedback>
          <PressableFeedback.Ripple duration={100} />
          Press me
        </PressableFeedback>,
      );

      expect(waves()).toHaveLength(0);
    });

    it("supports repeated presses without dropping earlier waves", async () => {
      render(
        <PressableFeedback>
          <PressableFeedback.Ripple />
          Press me
        </PressableFeedback>,
      );

      const root = screen.getByRole("button", {name: "Press me"});

      await user.click(root);
      await user.click(root);

      expect(waves()).toHaveLength(2);
    });

    it("sizes a wave to reach the farthest corner of the surface", async () => {
      stubRect();

      render(
        <PressableFeedback>
          <PressableFeedback.Ripple />
          Press me
        </PressableFeedback>,
      );

      await user.click(screen.getByRole("button", {name: "Press me"}));

      // Press lands at the origin, so the wave must span twice the diagonal.
      const diameter = 2 * Math.hypot(200, 80);

      const wave = waves()[0] as HTMLElement;

      expect(Number.parseFloat(wave.style.width)).toBeCloseTo(diameter, 1);
      expect(Number.parseFloat(wave.style.height)).toBeCloseTo(diameter, 1);
    });

    it("offsets the wave by the root's border so a bordered surface stays centred", async () => {
      const border = 4;

      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
        this: Element,
      ) {
        // The layer sits at the padding box, the root reports its outer border box.
        const isRoot = this.getAttribute("data-slot") === "pressable-feedback";
        const inset = isRoot ? 0 : border;

        return {
          bottom: 80 - inset,
          height: 80 - inset * 2,
          left: inset,
          right: 200 - inset,
          top: inset,
          width: 200 - inset * 2,
          x: inset,
          y: inset,
        } as DOMRect;
      });

      render(
        <PressableFeedback>
          <PressableFeedback.Ripple />
          Press me
        </PressableFeedback>,
      );

      await user.click(screen.getByRole("button", {name: "Press me"}));

      // The press reports (0, 0) on the border box, which is (-4, -4) inside the layer.
      const wave = waves()[0] as HTMLElement;
      const size = Number.parseFloat(wave.style.width);

      expect(Number.parseFloat(wave.style.left)).toBeCloseTo(-border - size / 2, 1);
    });

    it("centres the wave for keyboard activation", async () => {
      stubRect();

      render(
        <PressableFeedback>
          <PressableFeedback.Ripple />
          Press me
        </PressableFeedback>,
      );

      await user.tab();
      await user.keyboard("{Enter}");

      // Centred press: the wave only has to reach a corner from the middle.
      const diameter = Math.hypot(200, 80);
      const wave = waves()[0] as HTMLElement;

      expect(Number.parseFloat(wave.style.width)).toBeCloseTo(diameter, 1);
      expect(Number.parseFloat(wave.style.left)).toBeCloseTo(100 - diameter / 2, 1);
    });

    it("stays inert while the root is disabled", async () => {
      render(
        <PressableFeedback isDisabled>
          <PressableFeedback.Ripple />
          Press me
        </PressableFeedback>,
      );

      await user.click(screen.getByRole("button", {name: "Press me"}));

      expect(waves()).toHaveLength(0);
    });
  });

  describe("progress", () => {
    it("calls onComplete only after the press is held for the full duration", async () => {
      const onComplete = vi.fn();

      render(
        <PressableFeedback>
          <PressableFeedback.Progress duration={1000} onComplete={onComplete} />
          Hold me
        </PressableFeedback>,
      );

      const root = screen.getByRole("button", {name: "Hold me"});
      const overlay = slot("pressable-feedback-progress")!;

      expect(overlay).toHaveAttribute("data-sweep", "right");
      expect(overlay.getAttribute("style")).toContain(
        "--pressable-feedback-progress-duration: 1000ms",
      );

      await user.pointer({keys: "[MouseLeft>]", target: root});

      expect(overlay).toHaveAttribute("data-running", "true");

      advanceTimersByTime(400);
      await user.pointer({keys: "[/MouseLeft]", target: root});

      expect(overlay).not.toHaveAttribute("data-running");

      runAllTimers();

      expect(onComplete).not.toHaveBeenCalled();

      await user.pointer({keys: "[MouseLeft>]", target: root});
      advanceTimersByTime(1000);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("returns to idle after the reset delay and reports it", async () => {
      const onReset = vi.fn();

      render(
        <PressableFeedback>
          <PressableFeedback.Progress duration={500} resetDelay={300} onReset={onReset} />
          Hold me
        </PressableFeedback>,
      );

      const root = screen.getByRole("button", {name: "Hold me"});
      const overlay = slot("pressable-feedback-progress")!;

      await user.pointer({keys: "[MouseLeft>]", target: root});
      advanceTimersByTime(500);

      expect(overlay).toHaveAttribute("data-complete", "true");

      // Releasing after the run finished must not cut the reset short.
      await user.pointer({keys: "[/MouseLeft]", target: root});

      expect(overlay).toHaveAttribute("data-complete", "true");

      advanceTimersByTime(300);

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(overlay).not.toHaveAttribute("data-complete");
    });

    it("keeps the overlay revealed when resetDelay is false", async () => {
      const onReset = vi.fn();

      render(
        <PressableFeedback>
          <PressableFeedback.Progress duration={500} resetDelay={false} onReset={onReset} />
          Hold me
        </PressableFeedback>,
      );

      await user.pointer({keys: "[MouseLeft>]", target: screen.getByRole("button")});
      advanceTimersByTime(500);
      await user.pointer({keys: "[/MouseLeft]", target: screen.getByRole("button")});
      runAllTimers();

      expect(onReset).not.toHaveBeenCalled();
      expect(slot("pressable-feedback-progress")).toHaveAttribute("data-complete", "true");
    });

    it("supports holding Space to confirm", async () => {
      const onComplete = vi.fn();

      render(
        <PressableFeedback>
          <PressableFeedback.Progress duration={1000} onComplete={onComplete} />
          Hold me
        </PressableFeedback>,
      );

      await user.tab();
      await user.keyboard("{ >}");

      expect(slot("pressable-feedback-progress")).toHaveAttribute("data-running", "true");

      advanceTimersByTime(1000);

      expect(onComplete).toHaveBeenCalledTimes(1);

      await user.keyboard("{/ }");
    });

    it("completes on a plain click when cancelOnRelease is off", async () => {
      const onComplete = vi.fn();
      const onReset = vi.fn();

      render(
        <PressableFeedback>
          <PressableFeedback.Progress
            cancelOnRelease={false}
            duration={800}
            resetDelay={300}
            sweep="up"
            onComplete={onComplete}
            onReset={onReset}
          />
          Publish
        </PressableFeedback>,
      );

      const overlay = slot("pressable-feedback-progress")!;

      expect(overlay).toHaveAttribute("data-sweep", "up");

      await user.click(screen.getByRole("button", {name: "Publish"}));

      expect(overlay).toHaveAttribute("data-running", "true");

      advanceTimersByTime(800);

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(overlay).toHaveAttribute("data-complete", "true");

      advanceTimersByTime(300);

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(overlay).not.toHaveAttribute("data-complete");
    });

    it("does not complete when the press is dragged away and abandoned", async () => {
      const onComplete = vi.fn();
      const onPress = vi.fn();

      render(
        <div>
          <PressableFeedback onPress={onPress}>
            <PressableFeedback.Progress
              cancelOnRelease={false}
              duration={500}
              onComplete={onComplete}
            />
            Publish
          </PressableFeedback>
          <div data-testid="elsewhere">elsewhere</div>
        </div>,
      );

      const elsewhere = screen.getByTestId("elsewhere");

      await user.pointer({keys: "[MouseLeft>]", target: screen.getByRole("button")});
      await user.pointer({target: elsewhere});
      await user.pointer({keys: "[/MouseLeft]", target: elsewhere});

      runAllTimers();

      expect(onPress).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("reports a reset when a new press cuts the reset delay short", async () => {
      const onReset = vi.fn();

      render(
        <PressableFeedback>
          <PressableFeedback.Progress duration={200} resetDelay={1000} onReset={onReset} />
          Hold me
        </PressableFeedback>,
      );

      const root = screen.getByRole("button", {name: "Hold me"});
      const overlay = slot("pressable-feedback-progress")!;

      await user.pointer({keys: "[MouseLeft>]", target: root});
      advanceTimersByTime(200);
      await user.pointer({keys: "[/MouseLeft]", target: root});

      expect(overlay).toHaveAttribute("data-complete", "true");

      await user.pointer({keys: "[MouseLeft>]", target: root});

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(overlay).not.toHaveAttribute("data-complete");
      expect(overlay).toHaveAttribute("data-running", "true");

      await user.pointer({keys: "[/MouseLeft]", target: root});
      runAllTimers();

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it("stays inert while the root is disabled", async () => {
      const onComplete = vi.fn();

      render(
        <PressableFeedback isDisabled>
          <PressableFeedback.Progress duration={200} onComplete={onComplete} />
          Hold me
        </PressableFeedback>,
      );

      await user.click(screen.getByRole("button", {name: "Hold me"}));
      runAllTimers();

      expect(onComplete).not.toHaveBeenCalled();
      expect(slot("pressable-feedback-progress")).not.toHaveAttribute("data-running");
    });
  });
});

import {act, cleanup, fireEvent, render, screen} from "@sy-inc/testing/helpers";
import {StrictMode, createRef} from "react";

import {Countdown} from "@/components/countdown";

const now = new Date("2026-09-05T00:00:00Z").getTime();
const readTime = () =>
  screen.getByRole("timer").querySelector('[data-slot="countdown-accessible-text"]')!.textContent;

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders seven days and rolls across the day boundary without dropping units", () => {
    render(<Countdown endDate={now + 7 * 86400_000} />);
    expect(readTime()).toBe("7 days, 0 hours, 0 minutes, 0 seconds");
    expect(screen.getByRole("timer")).toHaveAttribute("aria-live", "off");
    act(() => vi.advanceTimersByTime(1000));
    expect(readTime()).toBe("6 days, 23 hours, 59 minutes, 59 seconds");
    expect(
      screen.getByRole("timer").querySelectorAll('[data-slot="countdown-segment"]'),
    ).toHaveLength(4);
  });

  it("supports Date and ISO deadlines and rounds partial seconds up", () => {
    const view = render(<Countdown endDate={new Date(now + 1500)} />);

    expect(readTime()).toBe("0 days, 0 hours, 0 minutes, 2 seconds");
    act(() => vi.advanceTimersByTime(500));
    expect(readTime()).toBe("0 days, 0 hours, 0 minutes, 1 seconds");
    view.rerender(<Countdown endDate={new Date(now + 2500).toISOString()} />);
    expect(readTime()).toBe("0 days, 0 hours, 0 minutes, 2 seconds");
  });

  it("recalculates against the deadline after a delayed tick and when the page resumes", () => {
    render(<Countdown endDate={now + 60_000} />);
    act(() => {
      vi.setSystemTime(now + 30_000);
      vi.advanceTimersByTime(1000);
    });
    expect(readTime()).toBe("0 days, 0 hours, 0 minutes, 29 seconds");
    act(() => {
      vi.setSystemTime(now + 58_000);
      fireEvent(document, new Event("visibilitychange"));
    });
    expect(readTime()).toBe("0 days, 0 hours, 0 minutes, 2 seconds");
  });

  it("calls the latest completion callback once and stops at zero", () => {
    const oldCallback = vi.fn();
    const callback = vi.fn();
    const view = render(<Countdown endDate={now + 2000} onComplete={oldCallback} />);

    view.rerender(<Countdown endDate={now + 2000} onComplete={callback} />);
    act(() => vi.advanceTimersByTime(5000));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(oldCallback).not.toHaveBeenCalled();
    expect(readTime()).toBe("0 days, 0 hours, 0 minutes, 0 seconds");
    expect(screen.getByRole("timer")).toHaveAttribute("data-state", "complete");
    expect(vi.getTimerCount()).toBe(0);
    fireEvent(document, new Event("visibilitychange"));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls completion once for an expired deadline in Strict Mode and supports a new deadline", () => {
    const callback = vi.fn();
    const view = render(
      <StrictMode>
        <Countdown completionContent="Finished" endDate={now - 1} onComplete={callback} />
      </StrictMode>,
    );

    expect(callback).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("timer")).toHaveTextContent("Finished");
    view.rerender(
      <StrictMode>
        <Countdown endDate={now + 1000} onComplete={callback} />
      </StrictMode>,
    );
    expect(screen.getByRole("timer")).toHaveAttribute("data-state", "running");
    act(() => vi.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("cancels the old deadline when endDate changes", () => {
    const callback = vi.fn();
    const view = render(<Countdown endDate={now + 1000} onComplete={callback} />);

    view.rerender(<Countdown endDate={now + 60_000} onComplete={callback} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(readTime()).toBe("0 days, 0 hours, 0 minutes, 58 seconds");
    expect(callback).not.toHaveBeenCalled();
  });

  it("renders placeholders for invalid deadlines without firing completion", () => {
    const callback = vi.fn();
    const view = render(<Countdown endDate={now + 1000} onComplete={callback} />);

    view.rerender(<Countdown endDate="invalid" onComplete={callback} />);
    expect(screen.getByRole("timer")).toHaveAttribute("data-state", "invalid");
    expect(readTime()).toBe("– days, – hours, – minutes, – seconds");
    act(() => vi.advanceTimersByTime(2000));
    expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("exposes refs, slots, translated labels, and custom classes", () => {
    const ref = createRef<HTMLSpanElement>();

    render(
      <Countdown
        ref={ref}
        aria-label="剩余时间"
        className="custom"
        endDate={now + 1000}
        labels={{days: "天", hours: "时", minutes: "分", seconds: "秒"}}
        size="sm"
      />,
    );
    const timer = screen.getByRole("timer", {name: "剩余时间"});

    expect(ref.current).toBe(timer);
    expect(timer).toHaveClass("countdown", "countdown--sm", "custom");
    expect(timer).toHaveAttribute("data-slot", "countdown");
    expect(readTime()).toBe("0 天, 0 时, 0 分, 1 秒");
    for (const segment of timer.querySelectorAll('[data-slot="countdown-segment"]')) {
      expect(segment).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("changes only affected digits and keeps glyphs bounded without animation events", () => {
    render(<Countdown animation="none" endDate={now + 12_000} />);
    const timer = screen.getByRole("timer");
    const digits = timer.querySelectorAll('[data-slot="countdown-digit"]');
    const unchanged = digits[6]!.firstElementChild;

    act(() => vi.advanceTimersByTime(1000));
    expect(digits[6]!.firstElementChild).toBe(unchanged);
    expect(digits[7]!.querySelector('[data-entering="true"]')).toHaveTextContent("1");
    expect(digits[7]!.querySelector('[data-exiting="true"]')).toHaveTextContent("2");
    act(() => vi.advanceTimersByTime(1000));
    expect(readTime()).toBe("0 days, 0 hours, 0 minutes, 10 seconds");
    for (const digit of timer.querySelectorAll('[data-slot="countdown-digit"]')) {
      expect(digit.childElementCount).toBeLessThanOrEqual(2);
    }
  });

  it("cleans up scheduled ticks and visibility listeners on unmount", () => {
    const callback = vi.fn();
    const view = render(<Countdown endDate={now + 1000} onComplete={callback} />);

    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(2000);
      fireEvent(document, new Event("visibilitychange"));
    });
    expect(callback).not.toHaveBeenCalled();
  });
});

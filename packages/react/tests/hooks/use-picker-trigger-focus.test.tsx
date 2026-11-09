import {cleanup, fireEvent, render, runAllTimers, screen, setupUser} from "@sy-inc/testing/helpers";

import {usePickerTriggerFocus} from "@/hooks/use-picker-trigger-focus";

function PickerTriggerFocusFixture({onOpenChange}: {onOpenChange?: (isOpen: boolean) => void}) {
  const {handleOpenChange, triggerRef} = usePickerTriggerFocus(onOpenChange);

  return (
    <>
      <button ref={triggerRef} onClick={() => handleOpenChange(true)}>
        Open picker
      </button>
      <button onClick={() => handleOpenChange(false)}>Close picker</button>
    </>
  );
}

describe("usePickerTriggerFocus", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    user = setupUser({advanceTimers: vi.advanceTimersByTime});
  });

  afterEach(() => {
    cleanup();
    runAllTimers();
    vi.useRealTimers();
  });

  it("restores keyboard focus after closing and calls onOpenChange before the next frame", async () => {
    const onOpenChange = vi.fn(() => document.activeElement);

    render(<PickerTriggerFocusFixture onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", {name: "Open picker"});
    const close = screen.getByRole("button", {name: "Close picker"});

    await user.click(trigger);
    await user.keyboard("a");
    await user.click(close);

    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(onOpenChange.mock.results.at(-1)?.value).toBe(close);
    runAllTimers();
    expect(trigger).toHaveFocus();
  });

  it.each(["metaKey", "ctrlKey", "altKey"])(
    "preserves pointer focus after a shortcut with %s",
    async (modifier) => {
      render(<PickerTriggerFocusFixture />);
      await user.click(screen.getByRole("button", {name: "Open picker"}));
      fireEvent.keyDown(window, {key: "k", [modifier]: true});
      const close = screen.getByRole("button", {name: "Close picker"});

      await user.click(close);
      runAllTimers();
      expect(close).toHaveFocus();
    },
  );

  it("ignores keys while closed and resets keyboard intent between openings", async () => {
    render(<PickerTriggerFocusFixture />);
    const trigger = screen.getByRole("button", {name: "Open picker"});
    const close = screen.getByRole("button", {name: "Close picker"});

    await user.click(trigger);
    await user.keyboard("a");
    await user.click(close);
    runAllTimers();
    expect(trigger).toHaveFocus();

    await user.keyboard("b");
    await user.click(trigger);
    await user.click(close);
    runAllTimers();
    expect(close).toHaveFocus();
  });
});

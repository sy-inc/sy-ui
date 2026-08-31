import {cleanup, render, runAllTimers, screen, setupUser} from "@sy-inc/testing/helpers";

import {Button} from "@/components/button";
import {Sheet} from "@/components/sheet";

import {SheetFixture} from "./fixtures";

const renderSheet = (props: Parameters<typeof SheetFixture>[0] = {}) =>
  render(<SheetFixture {...props} />);

describe("Sheet", () => {
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

  it("supports uncontrolled opening and exposes public slots", async () => {
    renderSheet({placement: "right", snapPoints: [0.4, 0.8]});

    const trigger = screen.getByRole("button", {name: "Open Sheet"});

    expect(trigger).toHaveAttribute("data-slot", "button");
    expect(trigger).toHaveClass("button", "button--md", "button--secondary");

    await user.click(trigger);
    runAllTimers();

    const dialog = screen.getByRole("dialog", {name: "Sheet Title"});

    expect(dialog).toHaveAttribute("data-slot", "sheet-dialog");
    expect(dialog).toHaveAttribute("data-placement", "right");
    expect(dialog).toHaveAttribute("data-snap-points", "0.4,0.8");
    expect(dialog).toHaveAttribute("data-active-snap-point", "0.8");
    expect(dialog).toHaveAttribute("data-sheet-snap-points", "true");
    expect(document.querySelector('[data-slot="sheet-backdrop"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="sheet-content"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="sheet-handle"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="sheet-header"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="sheet-body"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="sheet-footer"]')).not.toBeNull();
  });

  it("exposes official backdrop variants and calls onClose after dismissal", async () => {
    const onClose = vi.fn();

    render(
      <Sheet defaultOpen onClose={onClose}>
        <Sheet.Trigger>
          <Button variant="secondary">Open Sheet</Button>
        </Sheet.Trigger>
        <Sheet.Backdrop variant="blur">
          <Sheet.Content>
            <Sheet.Dialog>
              <Sheet.Heading>Sheet Title</Sheet.Heading>
            </Sheet.Dialog>
          </Sheet.Content>
        </Sheet.Backdrop>
      </Sheet>,
    );
    runAllTimers();

    expect(document.querySelector('[data-slot="sheet-backdrop"]')).toHaveClass(
      "sheet__backdrop--blur",
    );
    await user.keyboard("{Escape}");
    runAllTimers();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("supports controlled open state without closing until its owner changes props", async () => {
    const onOpenChange = vi.fn();
    const {rerender} = renderSheet({isOpen: false, onOpenChange});

    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<SheetFixture isOpen onOpenChange={onOpenChange} />);
    runAllTimers();

    await user.keyboard("{Escape}");
    runAllTimers();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("uses the default snap point and reports keyboard handle changes", async () => {
    const onActiveSnapPointChange = vi.fn();

    renderSheet({
      defaultActiveSnapPoint: "50%",
      defaultOpen: true,
      onActiveSnapPointChange,
      snapPoints: ["25%", "50%", "90%"],
    });
    runAllTimers();

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("data-active-snap-point", "50%");

    await user.click(screen.getByRole("button", {name: "Adjust sheet size"}));
    expect(onActiveSnapPointChange).toHaveBeenCalledWith("90%");

    await user.keyboard("{ArrowDown}");
    expect(onActiveSnapPointChange).toHaveBeenCalledWith("50%");
  });

  it("rejects invalid and mixed snap point domains", () => {
    expect(() => renderSheet({snapPoints: [0.8, 0.4]})).toThrow(
      "Sheet snap points must be strictly increasing.",
    );
    expect(() => renderSheet({snapPoints: ["50%", "100px"]})).toThrow(
      "Sheet snap points cannot mix px values with number or % values.",
    );
  });

  it("keeps Escape dismissal consistent with Modal when outside dismissal is disabled", async () => {
    const onOpenChange = vi.fn();

    renderSheet({defaultOpen: true, isDismissable: false, onOpenChange});
    runAllTimers();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

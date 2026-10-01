import {User, cleanup, render, runAllTimers, screen, setupUser} from "@sy-inc/testing/helpers";

import {Button} from "@/components/button";
import {Drawer} from "@/components/drawer";

import {DrawerFixture} from "./fixtures";

const renderDrawer = (props: Parameters<typeof DrawerFixture>[0] = {}) =>
  render(<DrawerFixture {...props} />);

describe("Drawer", () => {
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
    renderDrawer({placement: "right", snapPoints: [0.4, 0.8]});

    const trigger = screen.getByRole("button", {name: "Open Drawer"});

    expect(trigger).toHaveAttribute("data-slot", "button");
    expect(trigger).toHaveClass("button", "button--md", "button--secondary");

    await user.click(trigger);
    runAllTimers();

    const dialog = screen.getByRole("dialog", {name: "Drawer Title"});

    expect(dialog).toHaveAttribute("data-slot", "drawer-dialog");
    expect(dialog).toHaveAttribute("data-placement", "right");
    expect(dialog).toHaveAttribute("data-snap-points", "0.4,0.8");
    expect(dialog).toHaveAttribute("data-active-snap-point", "0.8");
    expect(dialog).toHaveAttribute("data-drawer-snap-points", "true");
    expect(document.querySelector('[data-slot="drawer-backdrop"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="drawer-content"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="drawer-handle"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="drawer-header"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="drawer-body"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="drawer-footer"]')).not.toBeNull();
  });

  it("renders non-modal drawers only while open", async () => {
    renderDrawer({isModal: false});

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", {name: "Open Drawer"}));
    expect(screen.getByRole("dialog", {name: "Drawer Title"})).toBeInTheDocument();

    await user.click(screen.getByRole("button", {name: "Close"}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes official backdrop variants and calls onClose after dismissal", async () => {
    const onClose = vi.fn();

    render(
      <Drawer defaultOpen onClose={onClose}>
        <Button variant="secondary">Open Drawer</Button>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content>
            <Drawer.Dialog>
              <Drawer.Heading>Drawer Title</Drawer.Heading>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>,
    );
    runAllTimers();

    expect(document.querySelector('[data-slot="drawer-backdrop"]')).toHaveClass(
      "drawer__backdrop--blur",
    );
    await user.keyboard("{Escape}");
    runAllTimers();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("supports controlled open state without closing until its owner changes props", async () => {
    const onOpenChange = vi.fn();
    const {rerender} = renderDrawer({isOpen: false, onOpenChange});

    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<DrawerFixture isOpen onOpenChange={onOpenChange} />);
    runAllTimers();

    await user.keyboard("{Escape}");
    runAllTimers();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("uses the default snap point and reports keyboard handle changes", async () => {
    const onActiveSnapPointChange = vi.fn();

    renderDrawer({
      defaultActiveSnapPoint: "50%",
      defaultOpen: true,
      onActiveSnapPointChange,
      snapPoints: ["25%", "50%", "90%"],
    });
    runAllTimers();

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("data-active-snap-point", "50%");

    await user.click(screen.getByRole("button", {name: "Adjust drawer size"}));
    expect(onActiveSnapPointChange).toHaveBeenCalledWith("90%");

    await user.keyboard("{ArrowDown}");
    expect(onActiveSnapPointChange).toHaveBeenCalledWith("50%");
  });

  it("rejects invalid and mixed snap point domains", () => {
    expect(() => renderDrawer({snapPoints: [0.8, 0.4]})).toThrow(
      "Drawer snap points must be strictly increasing.",
    );
    expect(() => renderDrawer({snapPoints: ["50%", "100px"]})).toThrow(
      "Drawer snap points cannot mix px values with number or % values.",
    );
  });

  it("renders a decorative handle when there are no snap points to adjust", async () => {
    renderDrawer({defaultOpen: true});
    runAllTimers();

    const handle = document.querySelector('[data-slot="drawer-handle"]');

    expect(handle).toHaveAttribute("aria-hidden", "true");
    expect(handle).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("button", {name: "Adjust drawer size"})).toBeNull();
  });

  describe("part-level composition", () => {
    type PartLevelProps = {
      backdropProps?: Omit<Drawer["BackdropProps"], "children">;
      placement?: "top" | "bottom" | "left" | "right";
      rootProps?: Omit<Drawer["RootProps"], "children">;
    };

    const PartLevelDrawer = ({backdropProps, placement, rootProps}: PartLevelProps) => (
      <Drawer {...rootProps}>
        <Drawer.Trigger>Open Drawer</Drawer.Trigger>
        <Drawer.Backdrop {...backdropProps}>
          <Drawer.Content placement={placement}>
            <Drawer.Dialog>
              <Drawer.Handle />
              <Drawer.Heading>Drawer Title</Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    );

    it("supports opening and closing via the Dialog tester", async () => {
      const testUtilUser = new User({
        advanceTimer: vi.advanceTimersByTime,
        interactionType: "mouse",
      });

      render(<PartLevelDrawer />);

      const tester = testUtilUser.createTester("Dialog", {
        overlayType: "modal",
        root: screen.getByRole("button", {name: "Open Drawer"}),
      });

      expect(tester.getDialog()).toBeNull();

      await tester.open();
      runAllTimers();

      expect(tester.getDialog()).toHaveAttribute("data-slot", "drawer-dialog");

      await tester.close();
      runAllTimers();

      expect(tester.getDialog()).toBeNull();
    });

    it("renders a styled trigger button for non-element children", async () => {
      render(<PartLevelDrawer />);

      const trigger = screen.getByRole("button", {name: "Open Drawer"});

      expect(trigger).toHaveAttribute("data-slot", "drawer-trigger");
      expect(trigger).toHaveClass("drawer__trigger");

      await user.click(trigger);
      runAllTimers();

      expect(screen.getByRole("dialog", {name: "Drawer Title"})).toBeInTheDocument();
    });

    it("supports placement on Content overriding the Root placement", async () => {
      render(<PartLevelDrawer placement="right" rootProps={{defaultOpen: true}} />);
      runAllTimers();

      const content = document.querySelector('[data-slot="drawer-content"]');

      expect(content).toHaveAttribute("data-placement", "right");
      expect(content).toHaveClass("drawer__content--right");
      expect(content).not.toHaveClass("drawer__content--bottom");
      expect(screen.getByRole("dialog")).toHaveAttribute("data-placement", "right");
      expect(screen.getByRole("dialog")).toHaveClass("drawer__dialog--right");
    });

    it("supports isDismissable on Backdrop while CloseTrigger still closes", async () => {
      const onOpenChange = vi.fn();

      render(
        <PartLevelDrawer
          backdropProps={{isDismissable: false}}
          rootProps={{defaultOpen: true, onOpenChange}}
        />,
      );
      runAllTimers();

      await user.click(document.querySelector('[data-slot="drawer-backdrop"]')!);
      runAllTimers();
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByRole("button", {name: "Close"}));
      runAllTimers();
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("supports blocking Escape via isKeyboardDismissDisabled on Backdrop", async () => {
      const onOpenChange = vi.fn();

      render(
        <PartLevelDrawer
          backdropProps={{isKeyboardDismissDisabled: true}}
          rootProps={{defaultOpen: true, onOpenChange}}
        />,
      );
      runAllTimers();

      await user.keyboard("{Escape}");
      runAllTimers();

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("supports a Backdrop controlled via isOpen without Drawer.Root", async () => {
      const onOpenChange = vi.fn();
      const Controlled = ({isOpen}: {isOpen: boolean}) => (
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.Heading>Standalone</Drawer.Heading>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      );
      const {rerender} = render(<Controlled isOpen={false} />);

      expect(screen.queryByRole("dialog")).toBeNull();

      rerender(<Controlled isOpen />);
      runAllTimers();

      expect(screen.getByRole("dialog", {name: "Standalone"})).toHaveClass("drawer__dialog--left");

      await user.keyboard("{Escape}");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("keeps Escape dismissal consistent with Modal when outside dismissal is disabled", async () => {
    const onOpenChange = vi.fn();

    renderDrawer({defaultOpen: true, isDismissable: false, onOpenChange});
    runAllTimers();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

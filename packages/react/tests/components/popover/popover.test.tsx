import {User, cleanup, render, runAllTimers, screen, setupUser} from "@sy-inc/testing/helpers";
import {useContext} from "react";
import {PopoverContext as RACPopoverContext} from "react-aria-components/Popover";

import {Autocomplete} from "@/components/autocomplete";
import {Button} from "@/components/button";
import {ListBox} from "@/components/list-box";
import {Popover} from "@/components/popover";
import {SearchField} from "@/components/search-field";

import {PopoverFixture} from "./fixtures";

function SlottedOptions({
  children,
  ...options
}: React.PropsWithChildren<Pick<Popover["ContentProps"], "render" | "shouldSkipAnimation">>) {
  const context = useContext(RACPopoverContext);

  return (
    <RACPopoverContext value={{...context, slots: {custom: {...context, ...options}}}}>
      {children}
    </RACPopoverContext>
  );
}

const renderPopover = (
  props: {
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  } = {},
) => render(<PopoverFixture {...props} />);

describe("Popover", () => {
  let user: ReturnType<typeof setupUser>;
  let testUtilUser: User;

  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    user = setupUser({advanceTimers: vi.advanceTimersByTime});
    testUtilUser = new User({
      advanceTimer: vi.advanceTimersByTime,
      interactionType: "mouse",
    });
  });

  afterEach(() => {
    cleanup();
    runAllTimers();
    vi.useRealTimers();
  });

  it("exposes dialog slots via Dialog tester", async () => {
    renderPopover();

    const tester = testUtilUser.createTester("Dialog", {
      overlayType: "popover",
      root: screen.getByRole("button", {name: "Open popover"}),
    });

    expect(tester.getDialog()).toBeNull();

    await tester.open();
    runAllTimers();

    const dialog = tester.getDialog();

    expect(dialog).not.toBeNull();
    expect(dialog).toHaveAttribute("data-slot", "popover-dialog");
    expect(dialog?.className).toEqual(expect.stringContaining("popover__dialog"));
    expect(screen.getByText("This is the popover content")).toBeInTheDocument();
    expect(document.querySelector(".popover")).not.toBeNull();

    await tester.close();
    runAllTimers();

    expect(tester.getDialog()).toBeNull();
  });

  it("supports Escape dismiss", async () => {
    const onOpenChange = vi.fn();

    renderPopover({defaultOpen: true, onOpenChange});
    runAllTimers();

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    runAllTimers();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("exposes heading slot", async () => {
    render(
      <Popover defaultOpen>
        <Button>Open popover</Button>
        <Popover.Content>
          <Popover.Dialog>
            <Popover.Heading>Popover heading</Popover.Heading>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>,
    );

    runAllTimers();

    const heading = screen.getByRole("heading", {name: "Popover heading"});

    expect(heading.className).toEqual(expect.stringContaining("popover__heading"));
  });

  it("keeps dialog naming on the dialog and removes orphan names from its generic container", () => {
    render(
      <Popover defaultOpen>
        <Button>Open named</Button>
        <Popover.Content aria-label="Outer name">
          <Popover.Dialog aria-label="Inner name">
            <Button>Inside</Button>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>,
    );
    runAllTimers();
    const dialog = screen.getByRole("dialog", {name: "Inner name"});

    expect(dialog.parentElement).not.toHaveAttribute("aria-label");
    expect(dialog.parentElement).not.toHaveAttribute("aria-labelledby");
  });

  it.each(["local", "slotted"] as const)("preserves %s custom render semantics", (kind) => {
    const renderContainer: NonNullable<Popover["ContentProps"]["render"]> = (props) => (
      <div {...props} aria-label="Custom container" aria-labelledby={undefined} role="region" />
    );

    render(
      <Popover defaultOpen>
        <Button>Open custom</Button>
        <SlottedOptions render={kind === "slotted" ? renderContainer : undefined}>
          <Popover.Content render={kind === "local" ? renderContainer : undefined} slot="custom">
            <Popover.Dialog aria-label="Custom dialog">
              <Button>Inside</Button>
            </Popover.Dialog>
          </Popover.Content>
        </SlottedOptions>
      </Popover>,
    );
    runAllTimers();
    expect(screen.getByRole("region", {name: "Custom container"})).toBeInTheDocument();
  });

  it("preserves forwarded callback ref cleanup", () => {
    const cleanupRef = vi.fn();
    const ref = vi.fn(() => cleanupRef);
    const result = render(
      <Popover defaultOpen>
        <Button>Open ref</Button>
        <Popover.Content ref={ref}>
          <Popover.Dialog aria-label="Ref dialog">
            <Button>Inside</Button>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>,
    );

    runAllTimers();
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
    result.unmount();
    expect(cleanupRef).toHaveBeenCalled();
  });

  describe("list variant", () => {
    it("supports filtering a multi-select list from a search field", async () => {
      render(
        <Popover defaultOpen>
          <Button>Add tags</Button>
          <Popover.Content variant="list">
            <Popover.Dialog aria-label="Tags">
              <Autocomplete.Filter filter={(text, input) => text.includes(input)}>
                <SearchField aria-label="Search tags">
                  <SearchField.Group>
                    <SearchField.Input />
                  </SearchField.Group>
                </SearchField>
                <ListBox aria-label="Tags" selectionMode="multiple">
                  <ListBox.Item id="vip" textValue="VIP">
                    VIP
                  </ListBox.Item>
                  <ListBox.Item id="new" textValue="New">
                    New
                  </ListBox.Item>
                </ListBox>
              </Autocomplete.Filter>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>,
      );
      runAllTimers();

      expect(screen.getByRole("dialog").closest(".popover")).toHaveClass("popover--list");

      await user.type(screen.getByRole("searchbox", {name: "Search tags"}), "VI");
      runAllTimers();

      expect(screen.getByRole("option", {name: "VIP"})).toBeInTheDocument();
      expect(screen.queryByRole("option", {name: "New"})).toBeNull();
    });
  });
});

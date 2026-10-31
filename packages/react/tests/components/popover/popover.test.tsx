import {User, cleanup, render, runAllTimers, screen, setupUser} from "@sy-inc/testing/helpers";

import {Autocomplete} from "@/components/autocomplete";
import {Button} from "@/components/button";
import {ListBox} from "@/components/list-box";
import {Popover} from "@/components/popover";
import {SearchField} from "@/components/search-field";

import {PopoverFixture} from "./fixtures";

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
      interactionType: "mouse",
      advanceTimer: vi.advanceTimersByTime,
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
      root: screen.getByRole("button", {name: "Open popover"}),
      overlayType: "popover",
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

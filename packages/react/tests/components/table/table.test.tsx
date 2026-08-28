import type {Selection, SortDescriptor} from "react-aria-components/Table";
import {useState} from "react";

import {
  User,
  act,
  cleanup,
  fireEvent,
  render,
  runAllTimers,
  screen,
  setupUser,
  waitFor,
} from "@sy-ui/testing/helpers";

import {Checkbox} from "@/components/checkbox";
import {Table} from "@/components/table";

const rows = [
  {id: "1", name: "Kate", role: "CEO"},
  {id: "2", name: "John", role: "CTO"},
  {id: "3", name: "Sara", role: "CMO"},
];

const renderTable = (
  props: {
    selectedKeys?: Selection;
    onSelectionChange?: (keys: Selection) => void;
    sortDescriptor?: SortDescriptor;
    onSortChange?: (descriptor: SortDescriptor | undefined) => void;
  } = {},
) => {
  return render(
    <Table data-testid="table">
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Team"
          selectedKeys={props.selectedKeys}
          selectionMode="multiple"
          sortDescriptor={props.sortDescriptor}
          onSelectionChange={props.onSelectionChange}
          onSortChange={props.onSortChange}
        >
          <Table.Header>
            <Table.Column>
              <Checkbox aria-label="Select all" slot="selection">
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox.Content>
              </Checkbox>
            </Table.Column>
            <Table.Column allowsSorting isRowHeader id="name">
              {({sortDirection}) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Member
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column id="role">Role</Table.Column>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id} id={row.id}>
                <Table.Cell>
                  <Checkbox aria-label={`Select ${row.name}`} slot="selection">
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Content>
                  </Checkbox>
                </Table.Cell>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>{row.role}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>,
  );
};

describe("Table", () => {
  let testUtilUser: User;

  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
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

  it("exposes shell slots and grid role", () => {
    renderTable();

    expect(screen.getByTestId("table")).toHaveAttribute("data-slot", "table");
    expect(screen.getByTestId("table").className).toEqual(expect.stringContaining("table"));
    expect(document.querySelector('[data-slot="table-scroll-container"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="table-content"]')).not.toBeNull();
    expect(screen.getByRole("grid", {name: "Team"})).toBeInTheDocument();
    expect(document.querySelector('[data-slot="table-header"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="table-body"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="table-row"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="table-cell"]')).not.toBeNull();
  });

  it("supports toggling row selection via Table tester", async () => {
    const onSelectionChange = vi.fn();

    renderTable({onSelectionChange});

    const tester = testUtilUser.createTester("Table", {
      root: screen.getByRole("grid", {name: "Team"}),
      advanceTimer: vi.advanceTimersByTime,
    });

    await tester.toggleRowSelection({row: "John"});
    runAllTimers();

    expect(onSelectionChange).toHaveBeenCalled();
    const selection = onSelectionChange.mock.calls[0]?.[0] as Selection;

    expect(selection === "all" ? null : [...selection]).toEqual(["2"]);
  });

  it("renders a selection checkbox with the selection slot and toggles row selection", async () => {
    const onSelectionChange = vi.fn();

    render(
      <Table>
        <Table.Content
          aria-label="Selectable team"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        >
          <Table.Header>
            <Table.Column aria-label="Select rows">
              <Table.SelectionCheckbox aria-label="Select all rows" />
            </Table.Column>
            <Table.Column isRowHeader>Name</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row id="1">
              <Table.Cell>
                <Table.SelectionCheckbox aria-label="Select Kate" />
              </Table.Cell>
              <Table.Cell>Kate</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table>,
    );

    const checkbox = screen.getByRole("checkbox", {name: /^Select Kate/});

    expect(checkbox.closest('[data-slot="table-selection-checkbox"]')).toHaveAttribute(
      "slot",
      "selection",
    );
    expect(checkbox.closest('[data-slot="table-selection-checkbox"]')).toBeInTheDocument();

    await setupUser({advanceTimers: vi.advanceTimersByTime}).click(checkbox);
    runAllTimers();

    expect([...(onSelectionChange.mock.calls[0]?.[0] as Set<string>)]).toEqual(["1"]);
    expect(checkbox).toBeChecked();
  });

  it("supports selecting all rows and exposes a partial header selection state", async () => {
    const user = setupUser({advanceTimers: vi.advanceTimersByTime});
    const onSelectionChange = vi.fn();

    renderTable({onSelectionChange});

    const selectAll = screen.getByRole("checkbox", {name: "Select all"});
    const rowCheckboxes = rows.map((row) =>
      screen.getByRole("checkbox", {name: new RegExp(`Select ${row.name}`)}),
    );

    await user.click(selectAll);
    runAllTimers();

    expect(selectAll).toBeChecked();
    for (const checkbox of rowCheckboxes) expect(checkbox).toBeChecked();
    expect(
      screen
        .getAllByRole("row")
        .slice(1)
        .every((row) => row.getAttribute("aria-selected") === "true"),
    ).toBe(true);

    await user.click(rowCheckboxes[0]!);
    runAllTimers();

    expect(selectAll).toBePartiallyChecked();
    expect(rowCheckboxes[0]).not.toBeChecked();
    for (const checkbox of rowCheckboxes.slice(1)) expect(checkbox).toBeChecked();
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it("supports toggling sort via Table tester", async () => {
    const onSortChange = vi.fn();

    renderTable({
      sortDescriptor: {column: "name", direction: "ascending"},
      onSortChange,
    });

    expect(document.querySelector('[data-slot="table-sortable-column-header"]')).not.toBeNull();

    const tester = testUtilUser.createTester("Table", {
      root: screen.getByRole("grid", {name: "Team"}),
      advanceTimer: vi.advanceTimersByTime,
    });

    await tester.toggleSort({column: "Member"});
    runAllTimers();

    expect(onSortChange).toHaveBeenCalled();
    expect(onSortChange.mock.calls[0]?.[0]).toEqual(expect.objectContaining({column: "name"}));
  });

  it("truncates cell content when enabled on the root", () => {
    render(
      <Table isTruncate>
        <Table.Content aria-label="Overflow modes">
          <Table.Header>
            <Table.Column isRowHeader>Name</Table.Column>
            <Table.Column>Role</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row id="1">
              <Table.Cell>Kate</Table.Cell>
              <Table.Cell>Chief executive officer</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table>,
    );

    expect(screen.getByText("Kate")).toHaveAttribute("data-slot", "table-cell-content");
    expect(screen.getByText("Chief executive officer")).toHaveAttribute(
      "data-slot",
      "table-cell-content",
    );
  });

  it("exposes the appropriate indicator affordance for each sort state", () => {
    renderTable();

    let indicator = document.querySelector('[data-slot="table-sortable-column-indicator"]');

    expect(indicator).not.toBeNull();
    expect(indicator).not.toHaveAttribute("data-direction");
    expect(indicator?.querySelectorAll('[data-sort-icon^="neutral-"]')).toHaveLength(2);

    cleanup();
    renderTable({sortDescriptor: {column: "name", direction: "ascending"}});
    indicator = document.querySelector('[data-slot="table-sortable-column-indicator"]');

    expect(indicator).toHaveAttribute("data-direction", "ascending");
    expect(indicator?.querySelectorAll('[data-sort-icon="active"]')).toHaveLength(1);
    expect(indicator?.querySelectorAll('[data-sort-icon^="neutral-"]')).toHaveLength(2);

    cleanup();
    renderTable({sortDescriptor: {column: "name", direction: "descending"}});
    indicator = document.querySelector('[data-slot="table-sortable-column-indicator"]');

    expect(indicator).toHaveAttribute("data-direction", "descending");
    expect(indicator?.querySelectorAll('[data-sort-icon="active"]')).toHaveLength(1);
  });

  it("cycles sortable columns through ascending, descending, and unsorted", async () => {
    const onSortChange = vi.fn();

    function SortableTable() {
      const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>();

      return (
        <Table>
          <Table.Content
            aria-label="Sortable team"
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor) => {
              onSortChange(descriptor);
              setSortDescriptor(descriptor);
            }}
          >
            <Table.Header>
              <Table.Column allowsSorting isRowHeader id="name">
                {({sortDirection}) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Member
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
            </Table.Header>
            <Table.Body />
          </Table.Content>
        </Table>
      );
    }

    render(<SortableTable />);
    const tester = testUtilUser.createTester("Table", {
      root: screen.getByRole("grid", {name: "Sortable team"}),
      advanceTimer: vi.advanceTimersByTime,
    });

    await tester.toggleSort({column: "Member"});
    await tester.toggleSort({column: "Member"});
    await tester.toggleSort({column: "Member"});

    expect(onSortChange.mock.calls.map(([descriptor]) => descriptor)).toEqual([
      {column: "name", direction: "ascending"},
      {column: "name", direction: "descending"},
      undefined,
    ]);
  });

  it("supports managed widths and logical native pinning", async () => {
    render(
      <Table>
        <Table.ManagedColumns
          viewportWidth={420}
          columns={[
            {id: "name", pinned: "start", width: 120},
            {id: "role", flex: 1, minWidth: 180},
            {id: "actions", pinned: "end", width: 80},
          ]}
        >
          <Table.ScrollContainer>
            <Table.Content aria-label="Managed team">
              <Table.Header>
                <Table.Column isRowHeader id="name">
                  Name
                </Table.Column>
                <Table.Column id="role">Role</Table.Column>
                <Table.Column id="actions">Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                <Table.Row id="1">
                  <Table.Cell>Kate</Table.Cell>
                  <Table.Cell>CEO</Table.Cell>
                  <Table.Cell>Edit</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table.ManagedColumns>
      </Table>,
    );

    const headers = screen.getAllByRole("columnheader");
    const cells = screen.getAllByRole("gridcell");
    const managedColumns = document.querySelector('[data-slot="table-managed-columns"]');

    expect(headers[0]).toHaveAttribute("data-pinned", "start");
    expect(headers[2]).toHaveAttribute("data-pinned", "end");
    expect(screen.getByRole("grid", {name: "Managed team"})).toHaveAttribute(
      "data-managed-layout",
      "true",
    );
    expect(managedColumns).not.toHaveAttribute("style");
    await waitFor(() => {
      expect(screen.getByRole("rowheader", {name: "Kate"})).toHaveAttribute("data-pinned", "start");
      expect(cells.at(-1)).toHaveAttribute("data-pinned", "end");
    });
    expect(managedColumns?.querySelector("style")).toBeNull();
  });

  it("auto-connects the resizable container and column resizers", () => {
    const onResize = vi.fn();
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();

    render(
      <Table
        isResizable
        onResize={onResize}
        onResizeStart={onResizeStart}
        onResizeEnd={onResizeEnd}
      >
        <Table.Content aria-label="Resizable team">
          <Table.Header>
            <Table.Column isRowHeader defaultWidth={160} minWidth={100}>
              Name
            </Table.Column>
            <Table.Column defaultWidth={160}>Role</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row id="1">
              <Table.Cell>Kate</Table.Cell>
              <Table.Cell>CEO</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table>,
    );

    expect(document.querySelector('[data-slot="table-resizable-container"]')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="table-column-resizer"]')).toHaveLength(2);
  });

  it("forwards resize lifecycle callbacks from the root API", () => {
    const onResize = vi.fn();
    const onResizeStart = vi.fn();
    const onResizeEnd = vi.fn();

    render(
      <Table
        isResizable
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        onResizeStart={onResizeStart}
      >
        <Table.Content aria-label="Resizable callbacks">
          <Table.Header>
            <Table.Column isRowHeader defaultWidth={160} minWidth={80}>
              Name
            </Table.Column>
            <Table.Column defaultWidth={160}>Role</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row id="1">
              <Table.Cell>Kate</Table.Cell>
              <Table.Cell>CEO</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table>,
    );

    const resizer = document.querySelector<HTMLElement>('[data-slot="table-column-resizer"]')!;
    const input = resizer.querySelector<HTMLInputElement>('input[type="range"]')!;

    fireEvent.focus(input);
    fireEvent.keyDown(resizer, {key: "Enter"});
    fireEvent.keyDown(resizer, {key: "ArrowRight"});
    fireEvent.keyDown(resizer, {key: " "});

    expect(onResizeStart).toHaveBeenCalled();
    expect(onResize).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalled();
  });

  it("adds a header overflow tooltip only after the header content overflows", async () => {
    let notifyResize: ResizeObserverCallback = () => undefined;
    const OriginalResizeObserver = globalThis.ResizeObserver;

    globalThis.ResizeObserver = class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        notifyResize = callback;
      }
      disconnect() {}
      observe() {}
      unobserve() {}
    };

    try {
      render(
        <Table isTruncate>
          <Table.Content aria-label="Header overflow">
            <Table.Header>
              <Table.Column isRowHeader tooltipProps={{delay: 0}}>
                Interest Collected
              </Table.Column>
            </Table.Header>
            <Table.Body>
              <Table.Row id="1">
                <Table.Cell>250</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Content>
        </Table>,
      );

      const overflow = screen.getByText("Interest Collected");
      Object.defineProperties(overflow, {
        clientWidth: {configurable: true, value: 80},
        scrollWidth: {configurable: true, value: 180},
      });

      act(() => notifyResize([], {} as ResizeObserver));

      await waitFor(() => expect(overflow).toHaveAttribute("data-overflowed", "true"));
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      act(() => screen.getByRole("columnheader").focus());
      runAllTimers();
      expect(screen.getByRole("tooltip")).toHaveTextContent("Interest Collected");
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });

  it("supports sharing managed widths with explicit virtualization while ignoring pinning", () => {
    render(
      <Table>
        <Table.Virtualizer
          layoutOptions={{headingHeight: 40, rowHeight: 40}}
          viewportWidth={300}
          columns={[
            {id: "name", pinned: "start", width: 120},
            {id: "role", flex: 1, minWidth: 100},
          ]}
        >
          <Table.Content aria-label="Virtual team">
            <Table.Header>
              <Table.Column isRowHeader id="name">
                Name
              </Table.Column>
              <Table.Column id="role">Role</Table.Column>
            </Table.Header>
            <Table.Body>
              <Table.Row id="1">
                <Table.Cell>Kate</Table.Cell>
                <Table.Cell>CEO</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Content>
        </Table.Virtualizer>
      </Table>,
    );

    expect(document.querySelector('[data-slot="table-virtualizer"]')).not.toBeNull();
    const name = screen.getByRole("columnheader", {name: "Name"});
    const role = screen.getByRole("columnheader", {name: "Role"});

    expect(name).not.toHaveAttribute("data-pinned");
    expect(Number.parseFloat(role.style.width)).toBeGreaterThan(
      Number.parseFloat(name.style.width),
    );
  });

  it("calls a warning when native pinned columns consume the viewport", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(
      <Table>
        <Table.ManagedColumns
          viewportWidth={200}
          columns={[
            {id: "name", pinned: "start", width: 100},
            {id: "actions", pinned: "end", width: 100},
          ]}
        >
          <div />
        </Table.ManagedColumns>
      </Table>,
    );

    expect(warn).toHaveBeenCalledWith(
      "Table pinned columns use 200px of a 200px viewport. Unpin or resize a column to preserve scrollable content.",
    );

    warn.mockRestore();
  });

  it("renders a native summary row group within the table", () => {
    render(
      <Table>
        <Table.Content aria-label="Revenue">
          <Table.Header>
            <Table.Column isRowHeader>Label</Table.Column>
            <Table.Column>Amount</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row id="revenue">
              <Table.Cell>Revenue</Table.Cell>
              <Table.Cell>$100</Table.Cell>
            </Table.Row>
          </Table.Body>
          <Table.Summary isSticky>
            <Table.Row id="total">
              <Table.Cell>Total</Table.Cell>
              <Table.Cell>$100</Table.Cell>
            </Table.Row>
          </Table.Summary>
        </Table.Content>
      </Table>,
    );

    const summary = document.querySelector('[data-slot="table-summary"]');

    expect(summary?.tagName).toBe("TFOOT");
    expect(summary).toHaveClass("table__summary");
    expect(summary).toHaveAttribute("data-sticky", "true");
    expect(screen.getByRole("row", {name: "Total"})).toBeInTheDocument();
  });

  it("supports an overflow tooltip from parent focus and text hover without an extra tab stop", async () => {
    let onResize: ResizeObserverCallback = () => undefined;
    const OriginalResizeObserver = globalThis.ResizeObserver;

    globalThis.ResizeObserver = class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        onResize = callback;
      }
      disconnect() {}
      observe() {}
      unobserve() {}
    };

    try {
      render(
        <Table>
          <Table.Content aria-label="Overflow table">
            <Table.Header>
              <Table.Column isRowHeader>
                <Table.Overflow tooltip data-testid="overflow">
                  A very long header
                </Table.Overflow>
              </Table.Column>
            </Table.Header>
            <Table.Body>
              <Table.Row id="row">
                <Table.Cell>Value</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Content>
        </Table>,
      );

      const overflow = screen.getByTestId("overflow");

      Object.defineProperties(overflow, {
        clientWidth: {configurable: true, value: 100},
        scrollWidth: {configurable: true, value: 180},
      });

      act(() => onResize([], {} as ResizeObserver));

      expect(screen.getByTestId("overflow")).toHaveAttribute("data-overflowed", "true");
      const column = screen.getByRole("columnheader", {name: "A very long header"});

      act(() => column.focus());
      runAllTimers();

      expect(document.querySelector('[data-slot="tooltip-trigger"]')).toBeNull();
      expect(screen.getByRole("tooltip")).toHaveTextContent("A very long header");
      expect(column).toHaveAccessibleDescription("A very long header");

      act(() => column.blur());
      runAllTimers();
      expect(screen.queryByRole("tooltip")).toBeNull();

      const user = setupUser({advanceTimers: vi.advanceTimersByTime});

      await user.hover(overflow);
      runAllTimers();
      expect(screen.getByRole("tooltip")).toHaveTextContent("A very long header");
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });

  it("supports updating overflow state when content changes at the same width", () => {
    let onResize: ResizeObserverCallback = () => undefined;
    let scrollWidth = 80;
    const OriginalResizeObserver = globalThis.ResizeObserver;

    globalThis.ResizeObserver = class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        onResize = callback;
      }
      disconnect() {}
      observe() {}
      unobserve() {}
    };

    try {
      const view = render(
        <Table>
          <Table.Overflow tooltip data-testid="changing-overflow">
            Short
          </Table.Overflow>
        </Table>,
      );
      const overflow = screen.getByTestId("changing-overflow");

      Object.defineProperties(overflow, {
        clientWidth: {configurable: true, value: 100},
        scrollWidth: {configurable: true, get: () => scrollWidth},
      });
      act(() => onResize([], {} as ResizeObserver));
      expect(overflow).not.toHaveAttribute("data-overflowed");

      scrollWidth = 180;
      view.rerender(
        <Table>
          <Table.Overflow tooltip data-testid="changing-overflow">
            A much longer value
          </Table.Overflow>
        </Table>,
      );

      expect(screen.getByTestId("changing-overflow")).toHaveAttribute("data-overflowed", "true");
    } finally {
      globalThis.ResizeObserver = OriginalResizeObserver;
    }
  });

  it("exposes a presentational loading overlay without owning loading state", () => {
    render(
      <Table>
        <Table.LoadingOverlay aria-label="Refreshing team">Loading</Table.LoadingOverlay>
      </Table>,
    );

    const overlay = screen.getByLabelText("Refreshing team");

    expect(overlay).toHaveAttribute("data-slot", "table-loading-overlay");
    expect(overlay).toHaveClass("table__loading-overlay");
    expect(overlay).toHaveTextContent("Loading");
  });
});

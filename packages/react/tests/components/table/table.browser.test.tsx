import {render} from "@sy-inc/testing/browser";
import React from "react";
import type {SortDescriptor} from "react-aria-components/Table";
import {page} from "vitest/browser";

import {Table} from "@/components/table";

import "../../../../styles/dist/sy-ui.min.css";

function DynamicPinnedRows() {
  const [rows, setRows] = React.useState(["Kate"]);

  return (
    <Table>
      <button type="button" onClick={() => setRows((current) => [...current, "John"])}>
        Add row
      </button>
      <Table.ManagedColumns
        viewportWidth={260}
        columns={[
          {id: "name", pinned: "start", width: 100},
          {id: "role", width: 300},
        ]}
      >
        <Table.ScrollContainer style={{overflowX: "auto", width: 260}}>
          <Table.Content aria-label="Dynamic pinned team">
            <Table.Header>
              <Table.Column isRowHeader id="name">
                Name
              </Table.Column>
              <Table.Column id="role">Role</Table.Column>
            </Table.Header>
            <Table.Body>
              {rows.map((name) => (
                <Table.Row key={name} id={name}>
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>Engineer</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.ManagedColumns>
    </Table>
  );
}

function SortableTable() {
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor | undefined>({
    column: "name",
    direction: "ascending",
  });

  return (
    <Table>
      <Table.Content
        aria-label="Sortable team"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <Table.Header>
          <Table.Column allowsSorting id="name" isRowHeader>
            {({sortDirection}) => (
              <Table.SortableColumnHeader sortDirection={sortDirection}>
                Name
              </Table.SortableColumnHeader>
            )}
          </Table.Column>
        </Table.Header>
        <Table.Body />
      </Table.Content>
    </Table>
  );
}

describe("Table (browser)", () => {
  it("rotates the active sort icon when the sort direction changes", async () => {
    await render(<SortableTable />);

    const icon = document.querySelector<SVGElement>('[data-sort-icon="active"]')!;
    let transitionCount = 0;
    icon.addEventListener("transitionstart", (event) => {
      if (event.propertyName === "transform") transitionCount += 1;
    });

    await page.getByRole("columnheader", {name: "Name"}).click();
    await new Promise<void>((resolve) => setTimeout(resolve, 150));

    expect(icon.closest('[data-slot="table-sortable-column-indicator"]')).toHaveAttribute(
      "data-direction",
      "descending",
    );
    expect(transitionCount).toBeGreaterThan(0);
  });

  it("fades the neutral icons in when sorting is cleared", async () => {
    await render(<SortableTable />);

    const neutralIcons = document.querySelectorAll<SVGElement>('[data-sort-icon^="neutral-"]');
    let transitionCount = 0;
    neutralIcons.forEach((icon) => {
      icon.addEventListener("transitionstart", (event) => {
        if (event.propertyName === "opacity") transitionCount += 1;
      });
    });

    const column = page.getByRole("columnheader", {name: "Name"});
    await column.click();
    await column.click();
    await new Promise<void>((resolve) => setTimeout(resolve, 250));

    expect(transitionCount).toBeGreaterThan(0);
  });

  it("supports native header, body, and summary pinning while scrolling", async () => {
    await render(
      <Table>
        <Table.ManagedColumns
          viewportWidth={300}
          columns={[
            {id: "name", pinned: "start", width: 120},
            {id: "role", width: 300},
            {id: "actions", pinned: "end", width: 100},
          ]}
        >
          <Table.ScrollContainer style={{height: 180, overflow: "auto", width: 300}}>
            <Table.Content aria-label="Pinned team">
              <Table.Header>
                <Table.Column isRowHeader id="name">
                  Name
                </Table.Column>
                <Table.Column id="role">Role</Table.Column>
                <Table.Column id="actions">Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {Array.from({length: 12}, (_, index) => (
                  <Table.Row key={index} id={String(index)}>
                    <Table.Cell>{index === 0 ? "Kate" : `Member ${index + 1}`}</Table.Cell>
                    <Table.Cell>CEO</Table.Cell>
                    <Table.Cell>Edit</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Summary isSticky>
                <Table.Row id="summary">
                  <Table.Cell>Total</Table.Cell>
                  <Table.Cell>1</Table.Cell>
                  <Table.Cell>—</Table.Cell>
                </Table.Row>
              </Table.Summary>
            </Table.Content>
          </Table.ScrollContainer>
        </Table.ManagedColumns>
      </Table>,
    );

    const header = page.getByRole("columnheader", {name: "Name"}).element();
    const ordinaryHeader = page.getByRole("columnheader", {name: "Role"}).element();
    const endHeader = page.getByRole("columnheader", {name: "Actions"}).element();
    const bodyCell = page.getByRole("rowheader", {name: "Kate"}).element();
    const summaryCell = page.getByRole("rowheader", {name: "Total"}).element();
    const tableHeader = header.closest<HTMLElement>('[data-slot="table-header"]')!;
    const scrollContainer = document.querySelector<HTMLElement>(
      '[data-slot="table-scroll-container"]',
    )!;
    const geometry = document.querySelector<HTMLElement>("[data-table-geometry]")!;
    const grid = page.getByRole("grid", {name: "Pinned team"}).element();
    const summary = summaryCell.closest<HTMLElement>('[data-slot="table-summary"]')!;
    const summaryBeforeScroll = summary.getBoundingClientRect();
    const viewportBeforeScroll = scrollContainer.getBoundingClientRect();

    expect(header).toHaveAttribute("data-pinned", "start");
    expect(bodyCell).toHaveAttribute("data-pinned", "start");
    expect(summaryCell).toHaveAttribute("data-pinned", "start");
    expect(Number(getComputedStyle(tableHeader).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(bodyCell).zIndex),
    );
    expect(Number(getComputedStyle(header).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(ordinaryHeader).zIndex),
    );
    expect(Number(getComputedStyle(endHeader).zIndex)).toBeGreaterThan(
      Number(getComputedStyle(ordinaryHeader).zIndex),
    );
    expect(getComputedStyle(summaryCell).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(summary).toHaveAttribute("data-sticky", "true");
    expect(grid).toHaveAttribute("data-managed-layout", "true");
    expect(scrollContainer.scrollWidth).toBeGreaterThan(scrollContainer.clientWidth);
    expect(scrollContainer.scrollHeight).toBeGreaterThan(scrollContainer.clientHeight);
    expect(summaryBeforeScroll.bottom).toBeLessThanOrEqual(viewportBeforeScroll.bottom + 1);

    await page.getByRole("row", {name: "Total"}).click();
    expect(header).not.toHaveAttribute("data-selected");
    expect(summary).not.toHaveAttribute("data-selected");

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    scrollContainer.dispatchEvent(new Event("scroll", {bubbles: true}));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const summaryAfterScroll = summary.getBoundingClientRect();
    const viewportAfterScroll = scrollContainer.getBoundingClientRect();

    expect(summaryAfterScroll.bottom).toBeLessThanOrEqual(viewportAfterScroll.bottom + 1);
    expect(summaryAfterScroll.top).toBeGreaterThanOrEqual(viewportAfterScroll.top - 1);

    scrollContainer.scrollLeft = getComputedStyle(scrollContainer).direction === "rtl" ? -100 : 100;
    expect(Math.abs(scrollContainer.scrollLeft)).toBe(100);
    scrollContainer.dispatchEvent(new Event("scroll", {bubbles: true}));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

    expect(geometry.dataset["tableStartShadow"]).toBe("1");
  });

  it("keeps pinned cells opaque while a row is hovered", async () => {
    await render(
      <Table>
        <Table.ManagedColumns
          viewportWidth={260}
          columns={[
            {id: "name", pinned: "start", width: 100},
            {id: "role", width: 260},
            {id: "actions", pinned: "end", width: 80},
          ]}
        >
          <Table.ScrollContainer style={{overflowX: "auto", width: 260}}>
            <Table.Content aria-label="Hovered pinned team">
              <Table.Header>
                <Table.Column id="name" isRowHeader>
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

    const row = page.getByRole("row", {name: "Kate"}).element();
    row.dataset["hovered"] = "true";

    const pinnedCell = page.getByRole("rowheader", {name: "Kate"}).element();

    const background = getComputedStyle(pinnedCell).backgroundColor;

    expect(background).not.toContain("/");
    expect(background).not.toBe("oklch(1 0 0)");
  });

  it("supports logical pinned offsets in RTL", async () => {
    await render(
      <Table dir="rtl">
        <Table.ManagedColumns
          viewportWidth={260}
          columns={[
            {id: "name", pinned: "start", width: 100},
            {id: "role", width: 200},
            {id: "actions", pinned: "end", width: 80},
          ]}
        >
          <Table.ScrollContainer style={{overflowX: "auto", width: 260}}>
            <Table.Content aria-label="RTL team">
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

    const start = page.getByRole("columnheader", {name: "Name"}).element();
    const end = page.getByRole("columnheader", {name: "Actions"}).element();

    expect(start).toHaveAttribute("data-pinned", "start");
    expect(end).toHaveAttribute("data-pinned", "end");
  });

  it("keeps pinned cells opaque when all rows are selected", async () => {
    await render(
      <Table>
        <Table.ManagedColumns
          viewportWidth={260}
          columns={[
            {id: "name", pinned: "start", width: 100},
            {id: "role", width: 260},
            {id: "actions", pinned: "end", width: 80},
          ]}
        >
          <Table.ScrollContainer style={{overflowX: "auto", width: 260}}>
            <Table.Content aria-label="Selectable pinned team" selectionMode="multiple">
              <Table.Header>
                <Table.Column id="name" isRowHeader>
                  <Table.SelectionCheckbox aria-label="Select all rows" />
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

    await page.getByRole("checkbox", {name: "Select all rows"}).click({force: true});

    const selectedName = page.getByRole("rowheader", {name: "Kate"}).element();
    const selectedActions = page.getByRole("gridcell", {name: "Edit"}).element();

    expect(selectedName.closest('[role="row"]')).toHaveAttribute("data-selected", "true");
    expect(getComputedStyle(selectedName).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(selectedActions).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("supports recalculating pinned offsets after column resizing", async () => {
    let resizedWidth = 0;

    await render(
      <Table>
        <Table.ManagedColumns
          viewportWidth={320}
          columns={[
            {id: "name", maxWidth: 180, minWidth: 80, pinned: "start", width: 100},
            {id: "role", pinned: "start", width: 100},
            {id: "email", width: 200},
          ]}
        >
          <Table.ResizableContainer
            onResize={(widths) => {
              const width = widths.get("name");

              resizedWidth = typeof width === "number" ? width : 0;
            }}
          >
            <Table.Content aria-label="Resizable pinned team">
              <Table.Header>
                <Table.Column isRowHeader id="name">
                  Name
                  <Table.ColumnResizer />
                </Table.Column>
                <Table.Column id="role">Role</Table.Column>
                <Table.Column id="email">Email</Table.Column>
              </Table.Header>
              <Table.Body>
                <Table.Row id="1">
                  <Table.Cell>Kate</Table.Cell>
                  <Table.Cell>CEO</Table.Cell>
                  <Table.Cell>kate@example.com</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Content>
          </Table.ResizableContainer>
        </Table.ManagedColumns>
      </Table>,
    );

    const roleHeader = page.getByRole("columnheader", {name: "Role"}).element();
    const resizer = document.querySelector<HTMLInputElement>(
      '[data-slot="table-column-resizer"] input[type="range"]',
    )!;

    const offsetBeforeResize = Number.parseFloat(
      roleHeader.style.getPropertyValue("--table-pinned-offset"),
    );

    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(resizer, "120");
    resizer.dispatchEvent(new Event("input", {bubbles: true}));
    resizer.dispatchEvent(new Event("change", {bubbles: true}));

    expect(resizedWidth).toBeGreaterThan(100);
    expect(
      Number.parseFloat(roleHeader.style.getPropertyValue("--table-pinned-offset")),
    ).toBeGreaterThan(offsetBeforeResize);
  });

  it("supports adding pinned rows after a scroll frontier is active", async () => {
    await render(<DynamicPinnedRows />);

    const scrollContainer = document.querySelector<HTMLElement>(
      '[data-slot="table-scroll-container"]',
    )!;

    scrollContainer.scrollLeft = 100;
    scrollContainer.dispatchEvent(new Event("scroll", {bubbles: true}));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    await page.getByRole("button", {name: "Add row"}).click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(page.getByRole("rowheader", {name: "John"}).element()).toHaveAttribute(
      "data-pinned-shadow",
    );
  });
});

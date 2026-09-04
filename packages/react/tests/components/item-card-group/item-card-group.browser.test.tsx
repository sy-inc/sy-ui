import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {ItemCard} from "@/components/item-card";
import {ItemCardGroup} from "@/components/item-card-group";
import {Separator} from "@/components/separator";

const Row = ({title}: {title: string}) => (
  <ItemCard>
    <ItemCard.Content>
      <ItemCard.Title>{title}</ItemCard.Title>
    </ItemCard.Content>
  </ItemCard>
);

const rowsOf = (testId: string) =>
  [...page.getByTestId(testId).element().children] as HTMLElement[];

const dividerWidthOf = (row: HTMLElement) => getComputedStyle(row).borderTopWidth;

describe("ItemCardGroup (browser)", () => {
  it("divides neighbouring list rows edge to edge but never after the header", async () => {
    await render(
      <ItemCardGroup data-testid="group">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Settings</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <Row title="Profile" />
        <Row title="Security" />
      </ItemCardGroup>,
    );

    const group = page.getByTestId("group").element() as HTMLElement;
    const [header, first, second] = rowsOf("group");

    expect(dividerWidthOf(header!)).toBe("0px");
    expect(dividerWidthOf(first!)).toBe("0px");
    expect(dividerWidthOf(second!)).toBe("1px");

    // The divider spans the group, leaving no gap at either edge.
    expect(second!.getBoundingClientRect().left).toBe(group.getBoundingClientRect().left);
    expect(second!.getBoundingClientRect().right).toBe(group.getBoundingClientRect().right);
  });

  it("lets an explicit Separator replace the automatic divider", async () => {
    await render(
      <ItemCardGroup data-testid="group">
        <Row title="Profile" />
        <Separator />
        <Row title="Security" />
      </ItemCardGroup>,
    );

    for (const row of rowsOf("group")) {
      expect(dividerWidthOf(row)).toBe("0px");
    }
  });

  it("does not clip a nested group that ends on its own edge", async () => {
    await render(
      <ItemCardGroup data-testid="section" variant="transparent">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Source control</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <ItemCardGroup data-testid="nested">
          <Row title="GitHub" />
          <Row title="GitLab" />
        </ItemCardGroup>
      </ItemCardGroup>,
    );

    const section = page.getByTestId("section").element() as HTMLElement;
    const nested = page.getByTestId("nested").element() as HTMLElement;

    // The wrapper ends on the nested group's bottom edge, so clipping here would
    // cut off the nested group's rounded corners and its shadow.
    expect(section.getBoundingClientRect().bottom).toBe(nested.getBoundingClientRect().bottom);
    expect(getComputedStyle(section).overflow).toBe("visible");
  });

  it("draws no dividers in a grid and resolves the requested column count", async () => {
    await render(
      <ItemCardGroup columns={3} data-testid="grid" layout="grid">
        <Row title="Profile" />
        <Row title="Security" />
        <Row title="Language" />
      </ItemCardGroup>,
    );

    const grid = page.getByTestId("grid").element() as HTMLElement;

    expect(getComputedStyle(grid).gridTemplateColumns.split(" ")).toHaveLength(3);
    for (const row of rowsOf("grid")) {
      expect(dividerWidthOf(row)).toBe("0px");
    }
  });
});

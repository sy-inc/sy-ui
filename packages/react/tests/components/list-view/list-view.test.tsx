import type {Selection} from "@react-types/shared";

import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {Button} from "@/components/button";
import {Header} from "@/components/header";
import {ListView} from "@/components/list-view";

const renderListView = (
  props: {
    onSelectionChange?: (keys: Selection) => void;
    selectionMode?: "single" | "multiple";
  } = {},
) =>
  render(
    <ListView
      aria-label="Team members"
      data-testid="team-members"
      selectionMode="multiple"
      {...props}
    >
      <ListView.Item id="maya" textValue="Maya Chen">
        <ListView.Selection aria-label="Select Maya Chen" />
        <ListView.Content>
          <ListView.Title>Maya Chen</ListView.Title>
          <ListView.Description>Design</ListView.Description>
        </ListView.Content>
      </ListView.Item>
      <ListView.Item id="noah" textValue="Noah Williams">
        <ListView.Selection aria-label="Select Noah Williams" />
        <ListView.Content>
          <ListView.Title>Noah Williams</ListView.Title>
          <ListView.Description>Engineering</ListView.Description>
        </ListView.Content>
      </ListView.Item>
      <ListView.Item id="olivia" textValue="Olivia Martin">
        <ListView.Selection aria-label="Select Olivia Martin" />
        <ListView.Content>
          <ListView.Title>Olivia Martin</ListView.Title>
          <ListView.Description>Operations</ListView.Description>
        </ListView.Content>
      </ListView.Item>
    </ListView>,
  );

describe("ListView", () => {
  const user = setupUser();

  it("exposes grid row semantics and stable slots", () => {
    renderListView();

    expect(screen.getByRole("grid", {name: "Team members"})).toHaveAttribute(
      "data-slot",
      "list-view",
    );
    expect(screen.getByRole("row", {name: /Maya Chen/})).toHaveAttribute(
      "data-slot",
      "list-view-item",
    );
    expect(screen.getByText("Maya Chen")).toHaveAttribute("data-slot", "list-view-title");
    expect(screen.getByText("Design")).toHaveAttribute("data-slot", "list-view-description");
  });

  it("calls onSelectionChange and exposes the selected row", async () => {
    const onSelectionChange = vi.fn();

    renderListView({onSelectionChange});

    await user.click(screen.getByRole("checkbox", {name: /^Select Noah Williams/}));

    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    const selection = onSelectionChange.mock.calls[0]?.[0] as Selection;

    expect(selection === "all" ? null : [...selection]).toEqual(["noah"]);
    expect(screen.getByRole("row", {name: /Noah Williams/})).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("moves focus between options with ArrowDown", async () => {
    renderListView();

    await user.tab();
    expect(screen.getByRole("row", {name: /Maya Chen/})).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("row", {name: /Noah Williams/})).toHaveFocus();
    expect(screen.getByRole("row", {name: /Noah Williams/})).toHaveAttribute(
      "data-focus-visible",
      "true",
    );
  });

  it("exposes disabled rows as non-interactive", () => {
    render(
      <ListView aria-label="Disabled files">
        <ListView.Item isDisabled id="archive" textValue="Archive">
          <ListView.Content>
            <ListView.Title>Archive</ListView.Title>
          </ListView.Content>
        </ListView.Item>
      </ListView>,
    );

    const row = screen.getByRole("row", {name: "Archive"});

    expect(row).toHaveAttribute("aria-disabled", "true");
    expect(row).toHaveAttribute("data-disabled", "true");
  });

  it("renders sections as labelled row groups", () => {
    render(
      <ListView aria-label="Files">
        <ListView.Section>
          <Header>Recent</Header>
          <ListView.Item id="brief" textValue="Brief">
            <ListView.Content>
              <ListView.Title>Brief</ListView.Title>
            </ListView.Content>
          </ListView.Item>
        </ListView.Section>
      </ListView>,
    );

    expect(screen.getByRole("rowgroup")).toHaveAttribute("data-slot", "list-view-section");
  });

  it("defaults to no selection until selectionMode is set", async () => {
    render(
      <ListView aria-label="Files">
        <ListView.Item id="brief" textValue="Brief">
          <ListView.Content>
            <ListView.Title>Brief</ListView.Title>
          </ListView.Content>
        </ListView.Item>
      </ListView>,
    );

    const row = screen.getByRole("row", {name: "Brief"});

    expect(row).not.toHaveAttribute("aria-selected");

    await user.click(row);

    expect(row).not.toHaveAttribute("aria-selected");
  });

  it("supports focusable controls inside a row", async () => {
    const onPress = vi.fn();

    render(
      <ListView aria-label="Files">
        <ListView.Item id="brief" textValue="Brief">
          <ListView.Content>
            <ListView.Title>Brief</ListView.Title>
          </ListView.Content>
          <Button aria-label="Download Brief" onPress={onPress} />
        </ListView.Item>
      </ListView>,
    );

    await user.tab();
    expect(screen.getByRole("row", {name: /Brief/})).toHaveFocus();

    await user.tab();

    const action = screen.getByRole("button", {name: "Download Brief"});

    expect(action).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

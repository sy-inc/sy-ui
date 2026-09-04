import type {Key} from "@react-types/shared";

import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {CellSelect} from "@/components/cell-select";
import {ListBox} from "@/components/list-box";

type FixtureProps = {
  defaultValue?: string;
  isDisabled?: boolean;
  value?: string;
  onChange?: (key: Key | null) => void;
};

const Fixture = (props: FixtureProps = {}) => (
  <CellSelect
    aria-label="Theme"
    data-testid="cell-select"
    defaultValue={props.defaultValue}
    isDisabled={props.isDisabled}
    value={props.value}
    onChange={props.onChange}
  >
    <CellSelect.Trigger>
      <CellSelect.Label>Theme</CellSelect.Label>
      <CellSelect.Value />
      <CellSelect.Indicator />
    </CellSelect.Trigger>
    <CellSelect.Popover>
      <ListBox>
        <ListBox.Item id="default" textValue="Default">
          Default
          <ListBox.ItemIndicator />
        </ListBox.Item>
        <ListBox.Item id="dark" textValue="Dark">
          Dark
          <ListBox.ItemIndicator />
        </ListBox.Item>
      </ListBox>
    </CellSelect.Popover>
  </CellSelect>
);

describe("CellSelect", () => {
  it("exposes the cell slots and a labelled select trigger", () => {
    render(<Fixture defaultValue="default" />);

    expect(screen.getByRole("button", {name: /Theme/})).toBeInTheDocument();
    expect(screen.getByTestId("cell-select")).toHaveAttribute("data-slot", "cell-select");
    expect(screen.getByTestId("cell-select").className).toContain("cell-select");
    expect(document.querySelector('[data-slot="cell-select-trigger"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="cell-select-label"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="cell-select-value"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="cell-select-indicator"]')).not.toBeNull();
  });

  it("supports non-controlled selection and calls onChange", async () => {
    const user = setupUser();
    const onChange = vi.fn();

    render(<Fixture onChange={onChange} />);
    await user.click(screen.getByRole("button", {name: /Theme/}));
    await user.click(screen.getByRole("option", {name: "Dark"}));

    expect(onChange).toHaveBeenCalledWith("dark");
    expect(screen.getByTestId("cell-select")).toHaveTextContent("Dark");
  });

  it("supports controlled values and keyboard focus", async () => {
    const user = setupUser();
    render(<Fixture value="dark" />);

    await user.tab();

    expect(screen.getByRole("button", {name: /Theme/})).toHaveFocus();
    expect(screen.getByTestId("cell-select")).toHaveTextContent("Dark");
  });

  it("does not open when disabled", async () => {
    const user = setupUser();
    render(<Fixture isDisabled />);

    const trigger = screen.getByRole("button", {name: /Theme/});
    expect(trigger).toBeDisabled();
    await user.click(trigger);

    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

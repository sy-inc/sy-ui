import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {CheckboxButtonGroup} from "@/components/checkbox-button-group";
import {Description} from "@/components/description";
import {Label} from "@/components/label";

const Options = () => (
  <>
    <CheckboxButtonGroup.Item value="security">
      <CheckboxButtonGroup.Indicator />
      <CheckboxButtonGroup.ItemContent>
        <Label>Security</Label>
        <Description>Protect your project</Description>
      </CheckboxButtonGroup.ItemContent>
    </CheckboxButtonGroup.Item>
    <CheckboxButtonGroup.Item value="storage">
      <CheckboxButtonGroup.Indicator>Selected</CheckboxButtonGroup.Indicator>
      <CheckboxButtonGroup.ItemContent>Storage</CheckboxButtonGroup.ItemContent>
    </CheckboxButtonGroup.Item>
  </>
);

describe("CheckboxButtonGroup", () => {
  const user = setupUser();

  it("renders group semantics, stable slots, and the default indicator", () => {
    render(
      <CheckboxButtonGroup defaultValue={["security"]}>
        <Label>Features</Label>
        <Description>Choose features</Description>
        <Options />
      </CheckboxButtonGroup>,
    );

    const group = screen.getByRole("group", {name: "Features"});
    const security = screen.getByRole("checkbox", {name: /Security/});

    expect(group).toHaveAttribute("data-slot", "checkbox-button-group");
    expect(group.className).toContain("checkbox-button-group");
    expect(security).toBeChecked();
    expect(security.closest('[data-slot="checkbox-content"]')).toHaveClass(
      "checkbox-button-group__item",
    );
    expect(
      document.querySelector('[data-slot="checkbox-button-group-indicator"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="checkbox-default-indicator--checkmark"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="checkbox-button-group-item-content"]'),
    ).toBeInTheDocument();
  });

  it("supports keyboard toggles and calls onChange with the selected values", async () => {
    const onChange = vi.fn();

    render(
      <CheckboxButtonGroup aria-label="Features" onChange={onChange}>
        <Options />
      </CheckboxButtonGroup>,
    );

    await user.tab();
    expect(screen.getByRole("checkbox", {name: /Security/})).toHaveFocus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith(["security"]);
  });

  it("shows a custom indicator only while selected and restores it after cancellation", async () => {
    render(
      <CheckboxButtonGroup aria-label="Features">
        <Options />
      </CheckboxButtonGroup>,
    );

    expect(screen.queryByText("Selected")).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", {name: "Storage"}));
    expect(screen.getByText("Selected")).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", {name: "Storage"}));
    expect(screen.queryByText("Selected")).not.toBeInTheDocument();
    expect(
      document.querySelector(
        '[data-slot="checkbox-button-group-indicator"][data-custom="true"] [data-slot="checkbox-default-indicator--checkmark"]',
      ),
    ).not.toBeInTheDocument();
  });

  it("updates uncontrolled selections and removes only the cancelled value", async () => {
    const onChange = vi.fn();
    render(
      <CheckboxButtonGroup aria-label="Features" onChange={onChange}>
        <Options />
      </CheckboxButtonGroup>,
    );
    await user.click(screen.getByRole("checkbox", {name: /Security/}));
    await user.click(screen.getByRole("checkbox", {name: "Storage"}));
    expect(onChange).toHaveBeenLastCalledWith(["security", "storage"]);
    await user.click(screen.getByRole("checkbox", {name: /Security/}));
    expect(onChange).toHaveBeenLastCalledWith(["storage"]);
  });

  it("keeps controlled state until rerender and forwards root and item refs", async () => {
    const groupRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    const onChange = vi.fn();
    const {rerender} = render(
      <CheckboxButtonGroup aria-label="Features" ref={groupRef} value={[]} onChange={onChange}>
        <CheckboxButtonGroup.Item ref={itemRef} value="security">
          <CheckboxButtonGroup.ItemContent>Security</CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      </CheckboxButtonGroup>,
    );

    await user.click(screen.getByRole("checkbox", {name: "Security"}));
    expect(onChange).toHaveBeenLastCalledWith(["security"]);
    expect(screen.getByRole("checkbox", {name: "Security"})).not.toBeChecked();
    expect(groupRef.current).toHaveAttribute("data-slot", "checkbox-button-group");
    expect(itemRef.current).toHaveAttribute("data-slot", "checkbox-button-group-item");
    rerender(
      <CheckboxButtonGroup aria-label="Features" value={["security"]} onChange={onChange}>
        <CheckboxButtonGroup.Item value="security">
          <CheckboxButtonGroup.ItemContent>Security</CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      </CheckboxButtonGroup>,
    );
    expect(screen.getByRole("checkbox", {name: "Security"})).toBeChecked();
  });

  it("keeps item-level disabled choices inert while other choices remain available", async () => {
    const onChange = vi.fn();
    render(
      <CheckboxButtonGroup aria-label="Features" onChange={onChange}>
        <CheckboxButtonGroup.Item isDisabled value="locked">
          <CheckboxButtonGroup.ItemContent>Locked</CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
        <CheckboxButtonGroup.Item value="open">
          <CheckboxButtonGroup.ItemContent>Open</CheckboxButtonGroup.ItemContent>
        </CheckboxButtonGroup.Item>
      </CheckboxButtonGroup>,
    );
    await user.click(screen.getByRole("checkbox", {name: "Locked"}));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("checkbox", {name: "Open"}));
    expect(onChange).toHaveBeenLastCalledWith(["open"]);
  });

  it("supports controlled values, grid layout, disabled items, custom indicators, and render props", async () => {
    const {rerender, unmount} = render(
      <CheckboxButtonGroup aria-label="Features" layout="grid" value={["storage"]}>
        <Options />
      </CheckboxButtonGroup>,
    );

    expect(screen.getByRole("checkbox", {name: "Storage"})).toBeChecked();
    expect(screen.getByRole("group").className).toContain("checkbox-button-group--grid");
    expect(screen.getByText("Selected")).toBeInTheDocument();
    rerender(
      <CheckboxButtonGroup aria-label="Features" isDisabled value={["storage"]}>
        <Options />
      </CheckboxButtonGroup>,
    );
    expect(screen.getByRole("checkbox", {name: /Security/})).toBeDisabled();
    unmount();
    render(
      <CheckboxButtonGroup aria-label="Features">
        <CheckboxButtonGroup.Item value="security">
          {({isSelected}) => (
            <CheckboxButtonGroup.ItemContent>
              {isSelected ? "Selected" : "Security"}
            </CheckboxButtonGroup.ItemContent>
          )}
        </CheckboxButtonGroup.Item>
      </CheckboxButtonGroup>,
    );
    await user.click(screen.getByRole("checkbox", {name: "Security"}));
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });
});

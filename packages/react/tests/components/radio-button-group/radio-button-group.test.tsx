import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {Description} from "@/components/description";
import {Label} from "@/components/label";
import {RadioButtonGroup} from "@/components/radio-button-group";

const Plans = () => (
  <>
    <RadioButtonGroup.Item value="basic">
      <RadioButtonGroup.Indicator />
      <RadioButtonGroup.ItemContent>Basic</RadioButtonGroup.ItemContent>
    </RadioButtonGroup.Item>
    <RadioButtonGroup.Item value="pro">
      <RadioButtonGroup.Indicator>✓</RadioButtonGroup.Indicator>
      <RadioButtonGroup.ItemContent>Pro</RadioButtonGroup.ItemContent>
    </RadioButtonGroup.Item>
  </>
);
describe("RadioButtonGroup", () => {
  const user = setupUser();
  it("renders roles, slots, default indicator, label, and description", () => {
    render(
      <RadioButtonGroup defaultValue="basic">
        <Label>Plan</Label>
        <Description>Choose one</Description>
        <Plans />
      </RadioButtonGroup>,
    );
    expect(screen.getByRole("radiogroup", {name: "Plan"})).toHaveAttribute(
      "data-slot",
      "radio-button-group",
    );
    expect(screen.getByRole("radio", {name: "Basic"})).toBeChecked();
    // The card class sits on the clickable label so the whole card is the hit area.
    expect(screen.getByRole("radio", {name: "Basic"}).closest(".radio-button-group__item")).toBe(
      screen.getByRole("radio", {name: "Basic"}).closest('[data-slot="radio-content"]'),
    );
    expect(
      document.querySelector('[data-slot="radio-button-group-indicator"]'),
    ).toBeInTheDocument();
    expect(screen.getByText("Choose one")).toBeInTheDocument();
  });
  it("calls onChange and supports arrow-key focus and selection", async () => {
    const onChange = vi.fn();
    render(
      <RadioButtonGroup aria-label="Plan" defaultValue="basic" onChange={onChange}>
        <Plans />
      </RadioButtonGroup>,
    );
    await user.tab();
    expect(screen.getByRole("radio", {name: "Basic"})).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", {name: "Pro"})).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("pro");
  });
  it("supports controlled, disabled, layout, custom indicator, and render props", async () => {
    const {rerender} = render(
      <RadioButtonGroup aria-label="Plan" layout="grid" value="pro">
        <Plans />
      </RadioButtonGroup>,
    );
    expect(screen.getByRole("radio", {name: "Pro"})).toBeChecked();
    expect(screen.getByRole("radiogroup").className).toContain("radio-button-group--grid");
    expect(screen.getByText("✓")).toBeInTheDocument();
    rerender(
      <RadioButtonGroup aria-label="Plan" isDisabled>
        <Plans />
      </RadioButtonGroup>,
    );
    expect(screen.getByRole("radio", {name: "Basic"})).toBeDisabled();
    rerender(
      <RadioButtonGroup aria-label="Plan">
        <RadioButtonGroup.Item isDisabled value="basic">
          <RadioButtonGroup.Indicator />
          <RadioButtonGroup.ItemContent>Basic</RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
        <RadioButtonGroup.Item value="pro">
          <RadioButtonGroup.Indicator />
          <RadioButtonGroup.ItemContent>Pro</RadioButtonGroup.ItemContent>
        </RadioButtonGroup.Item>
      </RadioButtonGroup>,
    );
    expect(screen.getByRole("radio", {name: "Basic"})).toBeDisabled();
    expect(screen.getByRole("radio", {name: "Pro"})).not.toBeDisabled();
    rerender(
      <RadioButtonGroup aria-label="Plan">
        <RadioButtonGroup.Item value="basic">
          {({isSelected}) => (
            <RadioButtonGroup.ItemContent>
              {isSelected ? "Selected" : "Basic"}
            </RadioButtonGroup.ItemContent>
          )}
        </RadioButtonGroup.Item>
      </RadioButtonGroup>,
    );
    await user.click(screen.getByRole("radio", {name: "Basic"}));
    expect(screen.getByText("Selected")).toBeInTheDocument();
  });
});

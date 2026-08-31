import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {Segment} from "@/components/segment";

describe("Segment", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  const options = (
    <>
      <Segment.Item id="monthly">Monthly</Segment.Item>
      <Segment.Item id="yearly">Yearly</Segment.Item>
    </>
  );

  it("renders native radio buttons with names, slots, and automatic indicators", () => {
    render(
      <Segment aria-label="Billing" defaultSelectedKey="monthly">
        {options}
      </Segment>,
    );

    expect(screen.getByRole("radiogroup", {name: "Billing"})).toHaveAttribute(
      "data-slot",
      "segment",
    );
    expect(screen.getByRole("radio", {name: "Monthly"})).toHaveAttribute(
      "data-slot",
      "segment-item",
    );
    expect(document.querySelectorAll('[data-slot="segment-indicator"]')).toHaveLength(1);
    expect(screen.getByRole("radio", {name: "Monthly"}).className).toContain("segment__item");
  });

  it("supports scalar uncontrolled selection and never calls back with an empty key", async () => {
    const onSelectionChange = vi.fn();
    render(
      <Segment defaultSelectedKey="monthly" onSelectionChange={onSelectionChange}>
        {options}
      </Segment>,
    );

    await user.click(screen.getByRole("radio", {name: "Yearly"}));
    expect(screen.getByRole("radio", {name: "Yearly"})).toHaveAttribute("aria-checked", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith("yearly");
    await user.click(screen.getByRole("radio", {name: "Yearly"}));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("supports scalar controlled selection", async () => {
    const onSelectionChange = vi.fn();
    render(
      <Segment selectedKey="monthly" onSelectionChange={onSelectionChange}>
        {options}
      </Segment>,
    );
    await user.click(screen.getByRole("radio", {name: "Yearly"}));
    expect(onSelectionChange).toHaveBeenCalledWith("yearly");
    expect(screen.getByRole("radio", {name: "Monthly"})).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", {name: "Monthly"}));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("supports root and item disabled states", async () => {
    const onChange = vi.fn();
    const {rerender} = render(
      <Segment isDisabled onSelectionChange={onChange}>
        {options}
      </Segment>,
    );
    expect(screen.getByRole("radio", {name: "Monthly"})).toBeDisabled();
    await user.click(screen.getByRole("radio", {name: "Monthly"}));
    expect(onChange).not.toHaveBeenCalled();
    rerender(
      <Segment>
        <Segment.Item id="monthly">Monthly</Segment.Item>
        <Segment.Item isDisabled id="yearly">
          Yearly
        </Segment.Item>
      </Segment>,
    );
    expect(screen.getByRole("radio", {name: "Yearly"})).toBeDisabled();
  });

  it("supports keyboard navigation with visible focus", async () => {
    const onSelectionChange = vi.fn();
    render(
      <Segment defaultSelectedKey="monthly" onSelectionChange={onSelectionChange}>
        {options}
      </Segment>,
    );
    await user.tab();
    expect(screen.getByRole("radio", {name: "Monthly"})).toHaveFocus();
    expect(screen.getByRole("radio", {name: "Monthly"})).toHaveAttribute(
      "data-focus-visible",
      "true",
    );
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", {name: "Yearly"})).toHaveFocus();
    expect(screen.getByRole("radio", {name: "Yearly"})).toHaveAttribute(
      "data-focus-visible",
      "true",
    );
    expect(screen.getByRole("radio", {name: "Monthly"})).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", {name: "Yearly"})).toHaveAttribute("aria-checked", "false");
    expect(onSelectionChange).not.toHaveBeenCalled();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", {name: "Yearly"})).toHaveAttribute("aria-checked", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith("yearly");
  });

  it("supports render props, separators, and refs", () => {
    const ref = {current: null as HTMLDivElement | null};
    render(
      <Segment ref={ref} separators>
        <Segment.Item id="grid">
          {({isSelected}) => (isSelected ? "Selected grid" : "Grid")}
        </Segment.Item>
        <Segment.Item id="list">List</Segment.Item>
      </Segment>,
    );
    expect(screen.getByRole("radio", {name: "Grid"})).toBeInTheDocument();
    expect(ref.current).toHaveClass("segment--separators");
    expect(ref.current).toHaveAttribute("data-slot", "segment");
  });

  it("exposes default and ghost variants in all documented sizes", () => {
    const {container} = render(
      <div>
        <Segment aria-label="Small" defaultSelectedKey="monthly" size="sm">
          {options}
        </Segment>
        <Segment aria-label="Medium" defaultSelectedKey="monthly">
          {options}
        </Segment>
        <Segment aria-label="Large" defaultSelectedKey="monthly" size="lg" variant="ghost">
          {options}
        </Segment>
      </div>,
    );

    expect(container.querySelector(".segment--sm .segment__item--sm")).toBeInTheDocument();
    expect(container.querySelector(".segment--md .segment__item--md")).toBeInTheDocument();
    expect(container.querySelector(".segment--lg .segment__item--lg")).toBeInTheDocument();
    expect(container.querySelector(".segment--ghost")).toBeInTheDocument();
  });

  it("keeps icon-expand labels mounted while selection switches", async () => {
    const iconExpandOptions = ["Home", "Chat", "Meetings", "Inbox"] as const;
    render(
      <Segment aria-label="Workspace navigation" defaultSelectedKey="meetings" variant="ghost">
        {iconExpandOptions.map((label) => (
          <Segment.Item key={label} aria-label={label} className="w-auto" id={label.toLowerCase()}>
            {() => (
              <>
                <span aria-hidden="true" />
                <span className="segment__item-label">
                  <span className="segment__item-label-inner">{label}</span>
                </span>
              </>
            )}
          </Segment.Item>
        ))}
      </Segment>,
    );

    await user.click(screen.getByRole("radio", {name: "Home"}));
    await user.click(screen.getByRole("radio", {name: "Inbox"}));

    for (const label of iconExpandOptions) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole("radio", {name: "Inbox"})).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", {name: "Home"})).toHaveAttribute("aria-checked", "false");
  });

  it("uses the documented display names", () => {
    expect(Segment.displayName).toBe("SY INC.Segment");
    expect(Segment.Item.displayName).toBe("SY INC.Segment.Item");
  });
});

import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {CellSwitch} from "@/components/cell-switch";

describe("CellSwitch", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("renders its switch role, name, and slots", () => {
    render(<CellSwitch>Animations</CellSwitch>);

    expect(screen.getByRole("switch", {name: "Animations"})).toBeInTheDocument();
    expect(document.querySelector('[data-slot="label"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="switch-control"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="switch-thumb"]')).not.toBeNull();
  });

  it("supports Space and pointer toggles", async () => {
    render(<CellSwitch>Animations</CellSwitch>);
    const control = screen.getByRole("switch", {name: "Animations"});

    await user.tab();
    await user.keyboard(" ");
    expect(control).toBeChecked();

    await user.click(control);
    expect(control).not.toBeChecked();
  });

  it("calls controlled onChange without changing its controlled state", async () => {
    const onChange = vi.fn();
    render(
      <CellSwitch isSelected={false} onChange={onChange}>
        Animations
      </CellSwitch>,
    );
    const control = screen.getByRole("switch", {name: "Animations"});

    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(control).not.toBeChecked();
  });

  it("keeps disabled switches unchanged", async () => {
    const onChange = vi.fn();
    render(
      <CellSwitch defaultSelected isDisabled onChange={onChange}>
        Animations
      </CellSwitch>,
    );
    const control = screen.getByRole("switch", {name: "Animations"});

    expect(control).toBeDisabled();
    await user.click(control);
    expect(control).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("maps its variant onto the shared Switch cell surface", () => {
    render(<CellSwitch variant="secondary">Animations</CellSwitch>);

    expect(document.querySelector('[data-slot="switch"]')?.className).toContain(
      "switch--cell-secondary",
    );
  });

  it("exposes variant and feature content hooks", () => {
    render(
      <CellSwitch badge="New" description="Keep your pages within reach." variant="feature">
        Try the new sidebar
      </CellSwitch>,
    );

    const root = document.querySelector('[data-slot="switch"]');

    expect(root?.className).toContain("cell-switch--feature");
    /* The row surface comes from the shared Switch cell variant, not a local copy. */
    expect(root?.className).toContain("switch--cell");
    expect(screen.getByText("New")).toHaveAttribute("data-slot", "cell-switch-badge");
    expect(screen.getByText("Keep your pages within reach.")).toHaveAttribute(
      "data-slot",
      "description",
    );
  });
});

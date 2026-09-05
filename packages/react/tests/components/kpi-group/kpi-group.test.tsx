import {render, screen} from "@sy-inc/testing/helpers";
import React from "react";

import {KPI} from "@/components/kpi";
import {KPIGroup} from "@/components/kpi-group";
import {Separator} from "@/components/separator";

const Metric = ({title}: {title: string}) => (
  <KPI>
    <KPI.Header>
      <KPI.Title>{title}</KPI.Title>
    </KPI.Header>
    <KPI.Content>
      <KPI.Value value={1} />
    </KPI.Content>
  </KPI>
);

describe("KPIGroup", () => {
  it("supports native div props, role and ref", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<KPIGroup ref={ref} aria-label="Email metrics" data-testid="group" id="metrics" />);

    const group = screen.getByTestId("group");

    expect(group.tagName).toBe("DIV");
    expect(group).toHaveAttribute("role", "group");
    expect(group).toHaveAttribute("id", "metrics");
    expect(ref.current).toBe(group);
  });

  it("supports horizontal and vertical orientation hooks", () => {
    const {rerender} = render(<KPIGroup data-testid="group" />);

    expect(screen.getByTestId("group")).toHaveClass("kpi-group--horizontal");

    rerender(<KPIGroup data-testid="group" orientation="vertical" />);
    expect(screen.getByTestId("group")).toHaveClass("kpi-group--vertical");
  });

  it("orients composed separators across the group direction", () => {
    const {rerender} = render(
      <KPIGroup>
        <Metric title="Subscribers" />
        <Separator />
        <Metric title="Open rate" />
      </KPIGroup>,
    );

    const separator = screen.getByRole("separator");

    expect(separator).toHaveAttribute("data-orientation", "vertical");

    rerender(
      <KPIGroup orientation="vertical">
        <Metric title="Subscribers" />
        <Separator />
        <Metric title="Open rate" />
      </KPIGroup>,
    );

    expect(screen.getByRole("separator")).toHaveAttribute("data-orientation", "horizontal");
  });
});

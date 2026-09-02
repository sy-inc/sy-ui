import {render, screen} from "@sy-inc/testing/helpers";

import {Widget} from "@/components/widget";

describe("Widget", () => {
  it("renders composed content", () => {
    render(
      <Widget>
        <Widget.Header>
          <Widget.Title>Monthly revenue</Widget.Title>
          <Widget.Legend>
            <Widget.LegendItem color="rebeccapurple">Revenue</Widget.LegendItem>
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content>Chart</Widget.Content>
      </Widget>,
    );

    expect(screen.getByRole("heading", {name: "Monthly revenue"})).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Chart")).toBeInTheDocument();
  });

  it("exposes data-slot hooks for each part and legend marker", () => {
    render(
      <Widget data-testid="widget">
        <Widget.Header data-testid="header">
          <Widget.Title data-testid="title">Title</Widget.Title>
          <Widget.Legend data-testid="legend">
            <Widget.LegendItem color="rgb(1, 2, 3)" data-testid="item">
              Revenue
            </Widget.LegendItem>
          </Widget.Legend>
        </Widget.Header>
        <Widget.Content data-testid="content">Chart</Widget.Content>
      </Widget>,
    );

    expect(screen.getByTestId("widget")).toHaveAttribute("data-slot", "widget");
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "widget-header");
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "widget-title");
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "widget-content");
    expect(screen.getByTestId("legend")).toHaveAttribute("data-slot", "widget-legend");
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "widget-legend-item");

    const item = screen.getByTestId("item");

    expect(item.querySelector('[data-slot="widget-legend-item-dot"]')).toHaveStyle({
      backgroundColor: "rgb(1, 2, 3)",
    });
    expect(item.querySelector('[data-slot="widget-legend-item-label"]')).toHaveTextContent(
      "Revenue",
    );
  });
});

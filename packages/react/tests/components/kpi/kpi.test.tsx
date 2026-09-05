import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {KPI} from "@/components/kpi";
import {Separator} from "@/components/separator";

describe("KPI", () => {
  it("renders composed parts with stable slots", () => {
    render(
      <KPI data-testid="kpi">
        <KPI.Header data-testid="header">
          <KPI.Icon color="success" data-testid="icon" />
          <KPI.Title data-testid="title">Revenue</KPI.Title>
        </KPI.Header>
        <KPI.Content data-testid="content">
          <KPI.Value data-testid="value" value={1234} />
          <KPI.Trend data-testid="trend">12%</KPI.Trend>
        </KPI.Content>
        <Separator data-testid="separator" />
        <KPI.Footer data-testid="footer">Details</KPI.Footer>
      </KPI>,
    );

    expect(screen.getByTestId("kpi")).toHaveAttribute("data-slot", "kpi");
    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "kpi-header");
    expect(screen.getByTestId("icon")).toHaveAttribute("data-color", "success");
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "kpi-title");
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "kpi-content");
    expect(screen.getByTestId("value")).toHaveAttribute("data-slot", "kpi-value");
    expect(screen.getByTestId("trend")).toHaveAttribute("data-trend", "up");
    expect(screen.getByRole("separator")).toHaveAttribute("data-slot", "separator");
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "kpi-footer");
  });

  it("formats values with Intl options and render children", () => {
    render(
      <>
        <KPI.Value
          data-testid="currency"
          formatOptions={{currency: "USD", style: "currency"}}
          value={228451}
        />
        <KPI.Value data-testid="percent" formatOptions={{style: "percent"}} value={0.5816} />
        <KPI.Value data-testid="custom" value={1200}>
          {(formatted) => `Total: ${formatted}`}
        </KPI.Value>
      </>,
    );

    expect(screen.getByTestId("currency")).toHaveTextContent("$228,451.00");
    expect(screen.getByTestId("percent")).toHaveTextContent("58%");
    expect(screen.getByTestId("custom")).toHaveTextContent("Total: 1,200");
  });

  it("maps trends and progress semantics", () => {
    render(
      <>
        <KPI.Trend data-testid="up">12%</KPI.Trend>
        <KPI.Trend data-testid="down" trend="down">
          4%
        </KPI.Trend>
        <KPI.Trend data-testid="neutral" trend="neutral">
          0%
        </KPI.Trend>
        <KPI.Progress aria-label="Server load" color="danger" data-testid="progress" value={98} />
      </>,
    );

    expect(screen.getByTestId("up")).toHaveAttribute("data-trend", "up");
    expect(screen.getByTestId("down")).toHaveAttribute("data-trend", "down");
    expect(screen.getByTestId("neutral")).toHaveAttribute("data-trend", "neutral");
    expect(screen.getByRole("progressbar", {name: "Server load"})).toHaveAttribute(
      "aria-valuenow",
      "98",
    );
    expect(screen.getByTestId("progress")).toHaveAttribute("data-slot", "kpi-progress");
  });

  it("uses an accessible default action button", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(<KPI.Actions onPress={onPress} />);
    await user.click(screen.getByRole("button", {name: "More actions"}));

    expect(onPress).toHaveBeenCalledOnce();
  });

  it("renders a sized chart container for any chart", () => {
    render(
      <KPI.Chart data-testid="chart" height={44}>
        <svg data-testid="sparkline" />
      </KPI.Chart>,
    );

    const chart = screen.getByTestId("chart");

    expect(chart).toHaveAttribute("data-slot", "kpi-chart");
    expect(chart).toHaveStyle({height: "44px"});
    expect(screen.getByTestId("sparkline")).toBeInTheDocument();
  });
});

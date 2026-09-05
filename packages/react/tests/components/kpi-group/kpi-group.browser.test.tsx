import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import {KPI} from "@/components/kpi";
import {KPIGroup} from "@/components/kpi-group";

import "../../../../styles/dist/sy-inc.min.css";

describe("KPIGroup (browser)", () => {
  it("keeps the values of every card on one line, whatever each card composes", async () => {
    await render(
      <KPIGroup style={{width: 900}}>
        <KPI>
          <KPI.Header>
            <KPI.Title>Subscribers</KPI.Title>
          </KPI.Header>
          <KPI.Content>
            <KPI.Value data-testid="trend-value" value={5400} />
            <KPI.Trend>+33%</KPI.Trend>
          </KPI.Content>
        </KPI>
        <KPI>
          <KPI.Header>
            <KPI.Title>Open rate</KPI.Title>
          </KPI.Header>
          {/* The progress adds a second row, which used to push this value off the shared line. */}
          <KPI.Content>
            <KPI.Value data-testid="progress-value" value={5400} />
            <KPI.Progress value={38} />
          </KPI.Content>
        </KPI>
      </KPIGroup>,
    );
    const top = (id: string) => page.getByTestId(id).element().getBoundingClientRect().top;

    expect(top("progress-value")).toBe(top("trend-value"));
  });
});

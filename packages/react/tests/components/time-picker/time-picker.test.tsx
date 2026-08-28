import {Time} from "@internationalized/date";
import {render, screen} from "@sy-inc/testing/helpers";

import {TimePicker} from "@/components/time-picker";

describe("TimePicker", () => {
  it("renders hours and minutes by default", () => {
    render(<TimePicker defaultValue={new Time(9, 30)} />);
    expect(screen.getAllByRole("button", {name: "09"}).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", {name: "30"}).length).toBeGreaterThan(0);
  });

  it("emits a time when a unit changes", async () => {
    const onChange = vi.fn();

    render(<TimePicker defaultValue={new Time(9, 30)} onChange={onChange} />);
    await screen
      .getByRole("region", {name: "hour"})
      .querySelector<HTMLElement>('[data-value="1"]')
      ?.click();
    expect(onChange).toHaveBeenLastCalledWith(new Time(1, 30));
  });

  it("renders seconds only when requested", () => {
    render(<TimePicker defaultValue={new Time(9, 30, 45)} granularity="second" />);
    expect(screen.getByRole("region", {name: "second"})).toBeInTheDocument();
  });

  it("does not emit changes when disabled", async () => {
    const onChange = vi.fn();

    render(<TimePicker isDisabled defaultValue={new Time(9, 30)} onChange={onChange} />);
    await screen.getAllByRole("button", {name: "01"}).at(0)?.click();
    expect(onChange).not.toHaveBeenCalled();
  });
});

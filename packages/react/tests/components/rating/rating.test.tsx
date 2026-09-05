import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {useState} from "react";

import {Rating} from "@/components/rating";

const RatingItems = () => (
  <>
    {[1, 2, 3, 4, 5].map((value) => (
      <Rating.Item key={value} value={value} />
    ))}
  </>
);
const getItem = (name: string) =>
  screen.getByRole("radio", {name}).closest('[data-slot="rating-item"]');

describe("Rating", () => {
  it("renders a horizontal radio group with stable slots", () => {
    render(
      <Rating aria-label="Rating" defaultValue={3}>
        <RatingItems />
      </Rating>,
    );

    expect(screen.getByRole("radiogroup", {name: "Rating"})).toHaveAttribute("data-slot", "rating");
    expect(getItem("3 stars")).toHaveAttribute("data-slot", "rating-item");
    expect(document.querySelectorAll('[data-slot="rating-icon"]')).toHaveLength(5);
  });

  it("supports numeric uncontrolled and controlled values", async () => {
    const user = setupUser();
    const onValueChange = vi.fn();
    const {rerender} = render(
      <Rating aria-label="Rating" defaultValue={2} onValueChange={onValueChange}>
        <RatingItems />
      </Rating>,
    );

    await user.click(screen.getByRole("radio", {name: "4 stars"}));
    expect(onValueChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole("radio", {name: "4 stars"})).toBeChecked();

    rerender(
      <Rating aria-label="Rating" value={5}>
        <RatingItems />
      </Rating>,
    );
    expect(screen.getByRole("radio", {name: "5 stars"})).toBeChecked();
  });

  it("supports keyboard focus and selection", async () => {
    const user = setupUser();

    render(
      <Rating aria-label="Rating" defaultValue={2}>
        <RatingItems />
      </Rating>,
    );

    await user.tab();
    expect(screen.getByRole("radio", {name: "2 stars"})).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", {name: "3 stars"})).toBeChecked();
  });

  // The hover preview is pure CSS, keyed off the data-hovered React Aria puts on
  // each item. jsdom cannot evaluate it, so assert the attribute the stylesheet
  // depends on instead — including that read-only groups never expose it.
  it("exposes data-hovered for the preview, but not while read-only", async () => {
    const user = setupUser();
    const {rerender} = render(
      <Rating aria-label="Rating" defaultValue={2}>
        <RatingItems />
      </Rating>,
    );

    await user.hover(screen.getByRole("radio", {name: "4 stars"}));
    expect(getItem("4 stars")).toHaveAttribute("data-hovered", "true");

    await user.unhover(screen.getByRole("radio", {name: "4 stars"}));
    expect(getItem("4 stars")).not.toHaveAttribute("data-hovered");

    rerender(
      <Rating isReadOnly aria-label="Rating" value={2}>
        <RatingItems />
      </Rating>,
    );
    await user.hover(screen.getByRole("radio", {name: "4 stars"}));
    expect(getItem("4 stars")).not.toHaveAttribute("data-hovered");
  });

  it("supports a group icon and a per-item override", () => {
    render(
      <Rating aria-label="Rating" defaultValue={2} icon={<span>heart</span>}>
        <Rating.Item value={1} />
        <Rating.Item value={2}>
          <span>bolt</span>
        </Rating.Item>
      </Rating>,
    );

    expect(screen.getByText("heart")).toBeInTheDocument();
    expect(screen.getByText("bolt")).toBeInTheDocument();
  });

  it("renders a fractional read-only overlay and blocks selection", async () => {
    const user = setupUser();
    const onValueChange = vi.fn();

    render(
      <Rating isReadOnly aria-label="Rating" value={2.3} onValueChange={onValueChange}>
        <RatingItems />
      </Rating>,
    );

    const third = screen.getByRole("radio", {name: "3 stars"});

    expect(getItem("3 stars")).toHaveAttribute("data-readonly", "true");
    expect(document.querySelector('[data-slot="rating-icon-partial"]')).toHaveStyle({
      "--rating-partial": "30%",
    });
    await user.click(third);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("stays uncontrolled without warning when no defaultValue is given", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const user = setupUser();

    render(
      <Rating aria-label="Rating">
        <RatingItems />
      </Rating>,
    );

    await user.click(screen.getByRole("radio", {name: "4 stars"}));
    expect(screen.getByRole("radio", {name: "4 stars"})).toBeChecked();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("supports a controlled group starting with no selection", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const user = setupUser();
    const Host = () => {
      const [value, setValue] = useState<number | null>(null);

      return (
        <Rating aria-label="Rating" value={value} onValueChange={setValue}>
          <RatingItems />
        </Rating>
      );
    };

    render(<Host />);

    await user.click(screen.getByRole("radio", {name: "3 stars"}));
    expect(screen.getByRole("radio", {name: "3 stars"})).toBeChecked();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("renders a fractional overlay outside read-only mode", () => {
    render(
      <Rating aria-label="Rating" value={3.5}>
        <RatingItems />
      </Rating>,
    );

    expect(document.querySelector('[data-slot="rating-icon-partial"]')).toHaveStyle({
      "--rating-partial": "50%",
    });
  });

  it("supports a custom item label", () => {
    render(
      <Rating aria-label="Rating" getItemLabel={(value) => `${value} hearts`}>
        <RatingItems />
      </Rating>,
    );

    expect(screen.getByRole("radio", {name: "4 hearts"})).toBeInTheDocument();
  });

  it("prevents changes while disabled", async () => {
    const user = setupUser();
    const onValueChange = vi.fn();

    render(
      <Rating isDisabled aria-label="Rating" defaultValue={2} onValueChange={onValueChange}>
        <RatingItems />
      </Rating>,
    );

    await user.click(screen.getByRole("radio", {name: "4 stars"}));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

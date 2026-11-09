import {fireEvent, render, screen, setupUser} from "@sy-inc/testing/helpers";
import {ButtonContext} from "react-aria-components/Button";

import {CloseButton} from "@/components/close-button";
import {Label} from "@/components/label";
import {SearchField} from "@/components/search-field";
import {Tag} from "@/components/tag";
import {TagGroup} from "@/components/tag-group";

const pointerOpts = {
  button: 0,
  pointerId: 1,
  pointerType: "mouse" as const,
  clientX: 1,
  clientY: 1,
};

// RAC usePress sequence in jsdom.
const pressDown = (element: HTMLElement) => fireEvent.pointerDown(element, pointerOpts);
const pressUp = (element: HTMLElement) => {
  fireEvent.pointerUp(element, pointerOpts);
  fireEvent.click(element, {button: 0});
};

describe("CloseButton", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("renders with default Close accessible name", () => {
    render(<CloseButton />);

    expect(screen.getByRole("button", {name: "Close"})).toBeInTheDocument();
  });

  it("exposes BEM block, data-slot, and default icon slot", () => {
    render(<CloseButton />);
    const button = screen.getByRole("button", {name: "Close"});

    expect(button.className).toEqual(expect.stringContaining("close-button"));
    expect(button).toHaveAttribute("data-slot", "close-button");
    expect(button.querySelector('[data-slot="close-button-icon"]')).not.toBeNull();
  });

  it("supports overriding aria-label", () => {
    render(<CloseButton aria-label="Dismiss dialog" />);

    expect(screen.getByRole("button", {name: "Dismiss dialog"})).toBeInTheDocument();
  });

  it("keeps a localized name from the button slot", () => {
    render(
      <ButtonContext value={{slots: {close: {"aria-label": "关闭通知"}}}}>
        <CloseButton slot="close" />
      </ButtonContext>,
    );

    expect(screen.getByRole("button", {name: "关闭通知"})).toBeInTheDocument();
  });

  it("prefers an explicit name over the button slot", () => {
    render(
      <ButtonContext value={{slots: {close: {"aria-label": "关闭通知"}}}}>
        <CloseButton aria-label="Dismiss notification" slot="close" />
      </ButtonContext>,
    );

    expect(screen.getByRole("button", {name: "Dismiss notification"})).toBeInTheDocument();
  });

  it("supports an explicit labelledby without adding the default label", () => {
    render(
      <>
        <span id="dismiss-label">Dismiss panel</span>
        <CloseButton aria-labelledby="dismiss-label" />
      </>,
    );

    expect(screen.getByRole("button", {name: "Dismiss panel"})).not.toHaveAttribute("aria-label");
  });

  it("keeps labelledby from the button slot", () => {
    render(
      <>
        <span id="slot-dismiss-label">Dismiss item</span>
        <ButtonContext value={{slots: {remove: {"aria-labelledby": "slot-dismiss-label"}}}}>
          <CloseButton slot="remove" />
        </ButtonContext>
      </>,
    );

    expect(screen.getByRole("button", {name: "Dismiss item"})).not.toHaveAttribute("aria-label");
  });

  it("keeps an unslotted context name", () => {
    render(
      <ButtonContext value={{"aria-label": "Dismiss context"}}>
        <CloseButton />
      </ButtonContext>,
    );

    expect(screen.getByRole("button", {name: "Dismiss context"})).toBeInTheDocument();
  });

  it("falls back to Close when a button slot has no name", () => {
    render(
      <ButtonContext value={{slots: {close: {}}}}>
        <CloseButton slot="close" />
      </ButtonContext>,
    );

    expect(screen.getByRole("button", {name: "Close"})).toBeInTheDocument();
  });

  it("keeps the SearchField clear name and action", async () => {
    render(
      <SearchField defaultValue="draft">
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.Input />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>,
    );

    await user.click(screen.getByRole("button", {name: "Clear search"}));
    expect(screen.getByRole("searchbox", {name: "Search"})).toHaveValue("");
  });

  it("keeps the Tag remove name and action", async () => {
    const onRemove = vi.fn();

    render(
      <TagGroup aria-label="Categories" onRemove={onRemove}>
        <TagGroup.List>
          <Tag id="news">News</Tag>
        </TagGroup.List>
      </TagGroup>,
    );

    await user.click(screen.getByRole("button", {name: "Remove tag News"}));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("supports data attribute passthrough", () => {
    render(<CloseButton data-testid="close" />);

    expect(screen.getByTestId("close")).toBeInTheDocument();
  });

  it("supports hover state", async () => {
    render(<CloseButton />);
    const button = screen.getByRole("button", {name: "Close"});

    await user.hover(button);
    expect(button).toHaveAttribute("data-hovered", "true");

    await user.unhover(button);
    expect(button).not.toHaveAttribute("data-hovered");
  });

  it("supports press state", () => {
    render(<CloseButton />);
    const button = screen.getByRole("button", {name: "Close"});

    pressDown(button);
    expect(button).toHaveAttribute("data-pressed", "true");

    pressUp(button);
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("calls onPress on click", async () => {
    const onPress = vi.fn();

    render(<CloseButton onPress={onPress} />);

    await user.click(screen.getByRole("button", {name: "Close"}));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("supports focus-visible via keyboard", async () => {
    render(<CloseButton />);
    const button = screen.getByRole("button", {name: "Close"});

    await user.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("data-focus-visible", "true");
  });

  it("supports disabled state and blocks press", async () => {
    const onPress = vi.fn();

    render(<CloseButton isDisabled onPress={onPress} />);
    const button = screen.getByRole("button", {name: "Close"});

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-disabled", "true");

    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("exposes no hover state when disabled", async () => {
    render(<CloseButton isDisabled />);
    const button = screen.getByRole("button", {name: "Close"});

    await user.hover(button);
    expect(button).not.toHaveAttribute("data-hovered");
  });
});

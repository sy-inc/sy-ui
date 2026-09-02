import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import React from "react";

import {ItemCard} from "@/components/item-card";

describe("ItemCard", () => {
  it("renders all compound parts with their default elements and slots", () => {
    render(
      <ItemCard data-testid="root">
        <ItemCard.Icon data-testid="icon">Icon</ItemCard.Icon>
        <ItemCard.Content data-testid="content">
          <ItemCard.Title data-testid="title">Title</ItemCard.Title>
          <ItemCard.Description data-testid="description">Description</ItemCard.Description>
        </ItemCard.Content>
        <ItemCard.Action data-testid="action">Action</ItemCard.Action>
      </ItemCard>,
    );
    expect(screen.getByTestId("root").tagName).toBe("DIV");
    expect(screen.getByTestId("icon").tagName).toBe("DIV");
    expect(screen.getByTestId("content").tagName).toBe("DIV");
    expect(screen.getByTestId("title").tagName).toBe("SPAN");
    expect(screen.getByTestId("description").tagName).toBe("SPAN");
    expect(screen.getByTestId("action").tagName).toBe("DIV");
    for (const [id, slot] of Object.entries({
      action: "item-card-action",
      content: "item-card-content",
      description: "item-card-description",
      icon: "item-card-icon",
      root: "item-card",
      title: "item-card-title",
    }))
      expect(screen.getByTestId(id)).toHaveAttribute("data-slot", slot);
  });

  it("exposes every variant hook", () => {
    for (const variant of ["default", "secondary", "tertiary", "outline", "transparent"] as const) {
      const {unmount} = render(<ItemCard data-testid="root" variant={variant} />);

      expect(screen.getByTestId("root")).toHaveClass(`item-card--${variant}`);
      unmount();
    }
  });

  it("supports a pressable root with native keyboard, pointer, focus, and callback behavior", async () => {
    const user = setupUser();
    const onClick = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <ItemCard<"button">
        ref={ref}
        className="custom-card"
        data-item="setting"
        render={(props) => <button type="button" {...props} />}
        onClick={onClick}
      >
        <ItemCard.Content>
          <ItemCard.Title>Account settings</ItemCard.Title>
          <ItemCard.Description>Manage your account preferences</ItemCard.Description>
        </ItemCard.Content>
      </ItemCard>,
    );
    const button = screen.getByRole("button", {
      name: /Account settings.*Manage your account preferences/,
    });

    expect(button).toHaveClass("custom-card");
    expect(button).toHaveAttribute("data-item", "setting");
    expect(ref.current).toBe(button);

    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();

    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("supports disabled pressable roots and does not interfere with action events", async () => {
    const user = setupUser();
    const onCardClick = vi.fn();
    const onActionClick = vi.fn();

    render(
      <>
        <ItemCard<"button">
          render={(props) => <button disabled type="button" {...props} />}
          onClick={onCardClick}
        >
          Disabled settings
        </ItemCard>
        <ItemCard>
          <ItemCard.Content>
            <ItemCard.Title>Language</ItemCard.Title>
          </ItemCard.Content>
          <ItemCard.Action>
            <button type="button" onClick={onActionClick}>
              Change language
            </button>
          </ItemCard.Action>
        </ItemCard>
      </>,
    );
    const disabled = screen.getByRole("button", {name: "Disabled settings"});

    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(onCardClick).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", {name: "Change language"}));
    expect(onActionClick).toHaveBeenCalledOnce();
  });
});

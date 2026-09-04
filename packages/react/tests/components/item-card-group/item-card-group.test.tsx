import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import React from "react";

import {ItemCard} from "@/components/item-card";
import {ItemCardGroup} from "@/components/item-card-group";
import {PressableFeedback} from "@/components/pressable-feedback";

const Card = ({title}: {title: string}) => (
  <ItemCard>
    <ItemCard.Content>
      <ItemCard.Title>{title}</ItemCard.Title>
    </ItemCard.Content>
  </ItemCard>
);

describe("ItemCardGroup", () => {
  it("supports native div props and refs", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <ItemCardGroup ref={ref} aria-label="Account settings" data-testid="group" id="settings" />,
    );

    const group = screen.getByTestId("group");
    expect(group.tagName).toBe("DIV");
    expect(group).toHaveAttribute("id", "settings");
    expect(group).toHaveAttribute("role", "group");
    expect(ref.current).toBe(group);
  });

  it("supports overriding the default role", () => {
    render(<ItemCardGroup aria-label="Account settings" data-testid="group" role="list" />);

    expect(screen.getByTestId("group")).toHaveAttribute("role", "list");
  });

  it("renders semantic compound parts with stable slots", () => {
    render(
      <ItemCardGroup>
        <ItemCardGroup.Header data-testid="header">
          <ItemCardGroup.Title data-testid="title">Settings</ItemCardGroup.Title>
          <ItemCardGroup.Description data-testid="description">
            Your preferences
          </ItemCardGroup.Description>
        </ItemCardGroup.Header>
      </ItemCardGroup>,
    );

    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "item-card-group-header");
    expect(screen.getByTestId("title").tagName).toBe("H3");
    expect(screen.getByTestId("title")).toHaveAttribute("data-slot", "item-card-group-title");
    expect(screen.getByTestId("description").tagName).toBe("P");
    expect(screen.getByTestId("description")).toHaveAttribute(
      "data-slot",
      "item-card-group-description",
    );
  });

  it("exposes default list and variant hooks", () => {
    render(<ItemCardGroup data-testid="group" />);
    const group = screen.getByTestId("group");

    expect(group).toHaveClass("item-card-group--list");
    expect(group).toHaveClass("item-card-group--default");
  });

  it("supports explicit layouts and variants", () => {
    for (const variant of ["default", "secondary", "tertiary", "outline", "transparent"] as const) {
      const {unmount} = render(
        <ItemCardGroup data-testid="group" layout="grid" variant={variant} />,
      );
      const group = screen.getByTestId("group");

      expect(group).toHaveClass("item-card-group--grid");
      expect(group).toHaveClass(`item-card-group--${variant}`);
      unmount();
    }
  });

  it("exposes the grid column count as a custom property", () => {
    const {rerender} = render(
      <ItemCardGroup columns={4} data-testid="group" layout="grid" style={{width: 200}} />,
    );
    const group = screen.getByTestId("group");

    expect(group.style.getPropertyValue("--item-card-group-columns")).toBe("4");
    expect(group.style.width).toBe("200px");

    rerender(<ItemCardGroup columns={4} data-testid="group" />);
    expect(group.style.getPropertyValue("--item-card-group-columns")).toBe("");
  });

  it("renders children as given without injecting separator elements", () => {
    render(
      <ItemCardGroup data-testid="group">
        <ItemCardGroup.Header>
          <ItemCardGroup.Title>Settings</ItemCardGroup.Title>
        </ItemCardGroup.Header>
        <Card title="Profile" />
        <Card title="Security" />
      </ItemCardGroup>,
    );

    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(screen.getByTestId("group").children).toHaveLength(3);
  });

  it("preserves composed pressable feedback interactions", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(
      <ItemCardGroup>
        <PressableFeedback onPress={onPress}>
          <PressableFeedback.Highlight />
          Open account
        </PressableFeedback>
      </ItemCardGroup>,
    );

    await user.click(screen.getByRole("button", {name: "Open account"}));
    expect(onPress).toHaveBeenCalledOnce();
  });
});

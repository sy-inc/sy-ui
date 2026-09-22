import {render, screen} from "@sy-inc/testing/helpers";

import {Avatar} from "@/components/avatar";
import {AvatarGroup} from "@/components/avatar-group";

const avatars = ["Ada", "Lin", "Sam", "Kai"].map((name) => (
  <Avatar key={name} aria-label={name}>
    <Avatar.Fallback>{name[0]}</Avatar.Fallback>
  </Avatar>
));

describe("AvatarGroup", () => {
  it("renders a labelled group with a capped avatar count and overflow", () => {
    render(
      <AvatarGroup aria-label="Team" max={2} role="group">
        {avatars}
      </AvatarGroup>,
    );

    expect(screen.getByRole("group", {name: "Team"})).toHaveClass("avatar-group");
    expect(screen.getByLabelText("Ada")).toBeInTheDocument();
    expect(screen.getByLabelText("Lin")).toBeInTheDocument();
    expect(screen.queryByLabelText("Sam")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("uses an explicit Count instead of the calculated overflow", () => {
    render(
      <AvatarGroup max={2}>
        {avatars}
        <AvatarGroup.Count>+8</AvatarGroup.Count>
      </AvatarGroup>,
    );

    expect(screen.getByText("+8").parentElement).toHaveAttribute("data-slot", "avatar-group-count");
    expect(screen.queryByText("+2")).not.toBeInTheDocument();
  });

  it("passes group variants to avatars and preserves child overrides", () => {
    render(
      <AvatarGroup isGrid color="accent" size="sm">
        <Avatar aria-label="Inherited">
          <Avatar.Fallback>I</Avatar.Fallback>
        </Avatar>
        <Avatar aria-label="Override" color="danger" size="lg">
          <Avatar.Fallback>O</Avatar.Fallback>
        </Avatar>
      </AvatarGroup>,
    );

    expect(screen.getByLabelText("Inherited")).toHaveClass("avatar--sm");
    expect(screen.getByText("I")).toHaveClass("avatar__fallback--accent");
    expect(screen.getByLabelText("Override")).toHaveClass("avatar--lg");
    expect(screen.getByText("O")).toHaveClass("avatar__fallback--danger");
    expect(screen.getByLabelText("Inherited").parentElement).toHaveClass("avatar-group--grid");
  });

  it("only passes group variants to direct avatar children", () => {
    render(
      <AvatarGroup size="sm">
        <div>
          <Avatar aria-label="Nested">
            <Avatar.Fallback>N</Avatar.Fallback>
          </Avatar>
        </div>
      </AvatarGroup>,
    );

    expect(screen.getByLabelText("Nested")).toHaveClass("avatar--md");
    expect(screen.getByLabelText("Nested")).not.toHaveClass("avatar--sm");
  });
});

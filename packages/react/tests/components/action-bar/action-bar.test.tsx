import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {ActionBar} from "@/components/action-bar";

import {ActionBarFixture} from "./fixtures";

describe("ActionBar", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("renders an accessible toolbar for contextual actions", () => {
    render(<ActionBar isOpen>Actions</ActionBar>);

    expect(screen.getByRole("toolbar", {name: "Actions"})).toBeInTheDocument();
  });

  it("exposes open state and Toolbar passthrough on its root", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <ActionBar ref={ref} isOpen className="selection-actions" data-testid="action-bar">
        Actions
      </ActionBar>,
    );

    const toolbar = screen.getByTestId("action-bar");

    expect(toolbar).toHaveAttribute("data-open", "true");
    expect(toolbar).toHaveAttribute("data-slot", "action-bar");
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    expect(toolbar).toHaveClass("action-bar", "toolbar--attached", "selection-actions");
    expect(ref.current).toBe(toolbar);
  });

  it("removes closed actions from the accessibility tree and interaction order", () => {
    render(<ActionBarFixture isOpen={false} />);

    const root = document.querySelector('[data-slot="action-bar"]')!;

    expect(root).toHaveAttribute("data-open", "false");
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("inert");
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "Archive"})).not.toBeInTheDocument();
  });

  it("preserves Toolbar arrow navigation and action callbacks", async () => {
    const onAction = vi.fn();

    render(<ActionBarFixture onAction={onAction} />);

    const archive = screen.getByRole("button", {name: "Archive"});
    const move = screen.getByRole("button", {name: "Move"});

    await user.tab();

    expect(archive).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(move).toHaveFocus();

    await user.click(move);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

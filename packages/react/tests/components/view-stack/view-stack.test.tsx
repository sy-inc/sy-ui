import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import React from "react";

import {ViewStack, useViewStack} from "@/components/view-stack";

import {ViewStackFixture} from "./fixtures";

const stack = () => screen.getByTestId("stack");
const Go = ({to}: {to: string}) => {
  const {navigate} = useViewStack();

  return <button onClick={() => navigate(to)}>{`Go to ${to}`}</button>;
};
const page = (name: string) => screen.getByRole("group", {name});

describe("ViewStack", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("renders only the current page, labelled by its title", () => {
    render(<ViewStackFixture />);

    expect(page("Details")).toHaveAttribute("data-current", "true");
    expect(page("Details")).toHaveAttribute("data-slot", "view-stack-view");
    expect(screen.queryByRole("group", {name: "Plan"})).not.toBeInTheDocument();
    expect(stack()).toHaveAttribute("data-slot", "view-stack");
    expect(stack()).not.toHaveAttribute("data-direction");
  });

  it("hides Back on the first page of the path", () => {
    render(<ViewStackFixture />);

    expect(screen.queryByRole("button", {name: "Back"})).not.toBeInTheDocument();
  });

  describe("navigation", () => {
    it("supports going forward and back", async () => {
      render(<ViewStackFixture />);

      await user.click(screen.getByRole("button", {name: "Next"}));
      expect(page("Plan")).toBeInTheDocument();
      expect(stack()).toHaveAttribute("data-direction", "forward");

      await user.click(screen.getByRole("button", {name: "Back"}));
      expect(page("Details")).toBeInTheDocument();
      expect(stack()).toHaveAttribute("data-direction", "backward");
      expect(screen.queryByRole("button", {name: "Back"})).not.toBeInTheDocument();
    });

    it("supports branches: Back returns to the page it came from", async () => {
      render(<ViewStackFixture />);

      await user.click(screen.getByRole("button", {name: "Help"}));
      await user.click(screen.getByRole("button", {name: "Back"}));

      expect(page("Details")).toBeInTheDocument();
    });

    it("treats an outside jump to an earlier page as going back and truncates the path", async () => {
      const onCurrentChange = vi.fn();

      render(<ViewStackFixture onCurrentChange={onCurrentChange} />);

      await user.click(screen.getByRole("button", {name: "Next"}));
      await user.click(screen.getByRole("button", {name: "Continue"}));
      await user.click(screen.getByRole("button", {name: "Restart"}));

      expect(page("Details")).toBeInTheDocument();
      expect(stack()).toHaveAttribute("data-direction", "backward");
      expect(screen.queryByRole("button", {name: "Back"})).not.toBeInTheDocument();
      expect(onCurrentChange).toHaveBeenLastCalledWith("info");
    });

    it("supports uncontrolled use through useViewStack", async () => {
      const Links = () => {
        const {navigate} = useViewStack();

        return <button onClick={() => navigate("b")}>Go to B</button>;
      };

      render(
        <ViewStack defaultKey="a">
          <ViewStack.View id="a">
            <ViewStack.Title>A</ViewStack.Title>
            <Links />
          </ViewStack.View>
          <ViewStack.View id="b">
            <ViewStack.Back />
            <ViewStack.Title>B</ViewStack.Title>
          </ViewStack.View>
        </ViewStack>,
      );

      await user.click(screen.getByRole("button", {name: "Go to B"}));
      expect(page("B")).toBeInTheDocument();

      await user.click(screen.getByRole("button", {name: "Back"}));
      expect(page("A")).toBeInTheDocument();
    });
  });

  describe("focus", () => {
    it("does not move focus on the first render", () => {
      render(<ViewStackFixture />);

      expect(document.body).toHaveFocus();
    });

    it("moves focus to the title of the entered page", async () => {
      render(<ViewStackFixture />);

      await user.click(screen.getByRole("button", {name: "Next"}));

      expect(screen.getByRole("heading", {name: "Plan"})).toHaveFocus();
    });

    it("leaves focus on an autoFocus field of the entered page", async () => {
      render(<ViewStackFixture initialKey="plan" />);

      await user.click(screen.getByRole("button", {name: "Continue"}));

      expect(screen.getByRole("textbox", {name: "Code"})).toHaveFocus();
    });

    it("restores focus to the control that left a remounted page", async () => {
      render(<ViewStackFixture />);

      await user.click(screen.getByRole("button", {name: "Help"}));
      await user.click(screen.getByRole("button", {name: "Back"}));

      expect(screen.getByRole("button", {name: "Help"})).toHaveFocus();
    });
  });

  describe("shouldForceMount", () => {
    it("keeps an inactive page mounted, hidden and inert", async () => {
      render(<ViewStackFixture forceMountInfo />);

      await user.click(screen.getByRole("button", {name: "Next"}));

      const info = document.querySelector('[data-slot="view-stack-view"]:not([data-current])');

      expect(info).toHaveAttribute("hidden");
      expect(info).toHaveAttribute("inert");
      expect(info?.querySelector("input")).toBeInTheDocument();
    });

    it("restores focus to the same element when the page stayed mounted", async () => {
      render(<ViewStackFixture forceMountInfo />);

      await user.type(screen.getByRole("textbox", {name: "Draft"}), "kept");
      await user.click(screen.getByRole("button", {name: "Next"}));
      await user.click(screen.getByRole("button", {name: "Back"}));

      expect(screen.getByRole("button", {name: "Next"})).toHaveFocus();
      expect(screen.getByRole("textbox", {name: "Draft"})).toHaveValue("kept");
    });
  });

  it("renders the header with its data-slot", () => {
    render(
      <ViewStack defaultKey="a">
        <ViewStack.View id="a">
          <ViewStack.Header data-testid="header" />
        </ViewStack.View>
      </ViewStack>,
    );

    expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "view-stack-header");
  });

  it("prefers a passed aria-labelledby over the title", () => {
    render(
      <ViewStack defaultKey="a">
        <span id="outside">Outside</span>
        <ViewStack.View aria-labelledby="outside" id="a">
          <ViewStack.Title>A</ViewStack.Title>
        </ViewStack.View>
      </ViewStack>,
    );

    expect(page("Outside")).toBeInTheDocument();
  });

  it("supports a text Back button", async () => {
    render(
      <ViewStack defaultKey="a">
        <ViewStack.View id="a">
          <ViewStack.Title>A</ViewStack.Title>
        </ViewStack.View>
        <ViewStack.View id="b">
          <div>
            <ViewStack.Back>Previous</ViewStack.Back>
          </div>
        </ViewStack.View>
        <Go to="b" />
      </ViewStack>,
    );

    await user.click(screen.getByRole("button", {name: "Go to b"}));
    const back = screen.getByRole("button", {name: "Previous"});

    expect(back).not.toHaveAttribute("data-icon-only");
    await user.click(back);
    expect(page("A")).toBeInTheDocument();
  });

  it("throws when a part is used outside ViewStack", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<ViewStack.View id="x" />)).toThrow(/within ViewStack/);
  });
});

import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {MessageBubble} from "@/components/message-bubble";
import {SplitView, splitViewVariants} from "@/components/split-view";
import {Surface} from "@/components/surface";

import {WorkspaceFixture} from "./fixtures";

describe("SplitView", () => {
  it("renders labelled sections and documented slots", () => {
    render(<WorkspaceFixture />);
    const root = screen.getByRole("group", {name: "Workspace"});

    expect(root).toHaveAttribute("data-slot", "split-view");
    expect(root).toHaveClass("split-view");
    expect(root.firstElementChild).toHaveAttribute("data-slot", "split-view-layout");
    expect(root.firstElementChild).toHaveAttribute("data-active", "start");
    expect(root.firstElementChild).toHaveAttribute("data-medium-behavior", "replace-start");
    for (const name of ["Navigation", "Main content", "Inspector"]) {
      expect(screen.getByRole("region", {name})).toHaveAttribute("tabindex", "-1");
    }
    expect(screen.getByRole("region", {name: "Main content"})).toHaveAttribute(
      "data-slot",
      "split-view-content",
    );
    expect(screen.getByRole("region", {name: "Inspector"})).toHaveAttribute("data-pane", "end");
    expect(screen.getByRole("button", {name: "Back to list"})).toHaveAttribute(
      "data-slot",
      "split-view-back",
    );
    expect(splitViewVariants().pane()).toBe("split-view__pane");
  });

  it("supports controlled pane and medium behavior changes", () => {
    const view = render(<WorkspaceFixture activePane="content" />);

    view.rerender(<WorkspaceFixture activePane="end" mediumBehavior="replace-content" />);
    const layout = screen.getByRole("group", {name: "Workspace"}).firstElementChild;

    expect(layout).toHaveAttribute("data-active", "end");
    expect(layout).toHaveAttribute("data-medium-behavior", "replace-content");
  });

  it("exposes the previous pane for entry motion", () => {
    const view = render(<WorkspaceFixture activePane="start" />);
    const root = screen.getByRole("group", {name: "Workspace"});
    const layout = root.firstElementChild;

    expect(layout).toHaveAttribute("data-motion");
    expect(layout).toHaveAttribute("data-from", "start");

    view.rerender(<WorkspaceFixture activePane="end" />);
    view.rerender(<WorkspaceFixture activePane="content" />);
    expect(layout).toHaveAttribute("data-from", "end");
    view.rerender(<WorkspaceFixture activePane="content" />);
    expect(layout).toHaveAttribute("data-from", "end");
  });

  it("supports independent surfaces without changing sibling sections", () => {
    render(
      <SplitView>
        <SplitView.Pane aria-label="Navigation">
          <MessageBubble aria-label="Navigation message" />
        </SplitView.Pane>
        <SplitView.Content aria-label="Chat" variant="surface">
          <MessageBubble aria-label="Chat message" />
        </SplitView.Content>
        <SplitView.Pane aria-label="Inspector" position="end" variant="surface">
          <MessageBubble aria-label="Inspector message" />
        </SplitView.Pane>
      </SplitView>,
    );

    expect(screen.getByRole("region", {name: "Navigation"})).toHaveAttribute(
      "data-variant",
      "transparent",
    );
    expect(screen.getByLabelText("Navigation message")).not.toHaveAttribute("data-surface");
    expect(screen.getByRole("region", {name: "Chat"})).toHaveClass("split-view__content--surface");
    expect(screen.getByRole("region", {name: "Inspector"})).toHaveClass(
      "split-view__pane--surface",
    );
    expect(screen.getByLabelText("Chat message")).toHaveAttribute("data-surface", "default");
    expect(screen.getByLabelText("Inspector message")).toHaveAttribute("data-surface", "default");
  });

  it("inherits surrounding surfaces and preserves edits when a section variant changes", async () => {
    const user = setupUser();
    const tree = (variant: "surface" | "transparent") => (
      <Surface variant="secondary">
        <SplitView>
          <SplitView.Pane aria-label="Navigation" variant={variant}>
            <input aria-label="Search" defaultValue="Query" />
            <MessageBubble aria-label="Navigation message" />
          </SplitView.Pane>
          <SplitView.Content aria-label="Chat" variant={variant}>
            <input aria-label="Reply" defaultValue="Draft" />
            <MessageBubble aria-label="Chat message" />
          </SplitView.Content>
        </SplitView>
      </Surface>
    );
    const view = render(tree("transparent"));
    const search = screen.getByRole("textbox", {name: "Search"});
    const reply = screen.getByRole("textbox", {name: "Reply"});

    expect(screen.getByLabelText("Navigation message")).toHaveAttribute(
      "data-surface",
      "secondary",
    );
    expect(screen.getByLabelText("Chat message")).toHaveAttribute("data-surface", "secondary");
    await user.type(search, " edited");
    await user.type(reply, " edited");
    view.rerender(tree("surface"));
    expect(screen.getByLabelText("Navigation message")).toHaveAttribute("data-surface", "default");
    expect(screen.getByLabelText("Chat message")).toHaveAttribute("data-surface", "default");
    view.rerender(tree("transparent"));
    expect(screen.getByRole("textbox", {name: "Search"})).toBe(search);
    expect(screen.getByRole("textbox", {name: "Reply"})).toBe(reply);
    expect(search).toHaveValue("Query edited");
    expect(reply).toHaveValue("Draft edited");
    expect(screen.getByLabelText("Navigation message")).toHaveAttribute(
      "data-surface",
      "secondary",
    );
    expect(screen.getByLabelText("Chat message")).toHaveAttribute("data-surface", "secondary");
  });

  it("keeps closed pane children and edits mounted", async () => {
    const user = setupUser();
    const view = render(<WorkspaceFixture />);
    const notes = screen.getByRole("textbox", {name: "Inspector notes"});

    await user.type(notes, " edited");
    view.rerender(<WorkspaceFixture endOpen={false} />);

    expect(screen.queryByRole("region", {name: "Inspector"})).toBeNull();
    expect(notes).toBeInTheDocument();
    expect(notes).toHaveValue("Keep this note edited");

    view.rerender(<WorkspaceFixture endOpen />);
    expect(screen.getByRole("textbox", {name: "Inspector notes"})).toBe(notes);
  });

  it("renders parent updates without re-measuring the layout", () => {
    const measure = vi.spyOn(window, "getComputedStyle");
    const Page = ({draft}: {draft: string}) => (
      <SplitView activePane="content" onLayoutChange={() => {}}>
        <SplitView.Pane aria-label="List" />
        <SplitView.Content aria-label="Editor">{draft}</SplitView.Content>
      </SplitView>
    );

    try {
      const view = render(<Page draft="a" />);
      const mounted = measure.mock.calls.length;

      view.rerender(<Page draft="ab" />);
      view.rerender(<Page draft="abc" />);
      expect(measure).toHaveBeenCalledTimes(mounted);
    } finally {
      measure.mockRestore();
    }
  });

  it("calls the Back onPress without owning navigation", async () => {
    const user = setupUser();
    const onPress = vi.fn();

    render(<SplitView.Back aria-label="Return" onPress={onPress} />);
    await user.click(screen.getByRole("button", {name: "Return"}));

    expect(onPress).toHaveBeenCalledOnce();
  });

  it("exposes sizing variables, scrolling choices and native section props", () => {
    render(
      <SplitView>
        <SplitView.Content aria-label="Editor" scroll="none" />
        <SplitView.Pane
          aria-label="Tools"
          maxWidth="24rem"
          minWidth={160}
          position="end"
          width={320}
        />
      </SplitView>,
    );
    const pane = screen.getByRole("region", {name: "Tools"});

    expect(pane.style.getPropertyValue("--split-view-pane-width")).toBe("320px");
    expect(pane.style.getPropertyValue("--split-view-pane-min-width")).toBe("160px");
    expect(pane.style.getPropertyValue("--split-view-pane-max-width")).toBe("24rem");
    expect(screen.getByRole("region", {name: "Editor"})).toHaveAttribute("data-scroll", "none");
  });

  it("forwards refs and custom classes to the public parts", () => {
    const root = {current: null as HTMLDivElement | null};
    const content = {current: null as HTMLElement | null};
    const pane = {current: null as HTMLElement | null};
    const back = {current: null as HTMLButtonElement | null};

    render(
      <SplitView ref={root} className="custom-root">
        <SplitView.Pane ref={pane} aria-label="List" className="custom-pane" />
        <SplitView.Content ref={content} aria-label="Content" className="custom-content">
          <SplitView.Back ref={back} aria-label="Back" className="custom-back" />
        </SplitView.Content>
      </SplitView>,
    );

    expect(root.current).toHaveClass("custom-root");
    expect(content.current).toHaveClass("custom-content");
    expect(pane.current).toHaveClass("custom-pane");
    expect(back.current).toHaveClass("custom-back");
    expect(back.current).toHaveAttribute("data-target-pane", "start");
  });
});

import {render, screen, setupUser} from "@sy-inc/testing/helpers";

import {ContentToc, contentTocVariants} from "@/components/content-toc";

import {TocFixture, items} from "./fixtures";

describe("ContentToc", () => {
  it("renders a labelled navigation with documented slots", () => {
    render(<TocFixture />);
    const nav = screen.getByRole("navigation", {name: "On this page"});

    expect(nav).toHaveAttribute("data-slot", "content-toc");
    expect(nav).toHaveAttribute("data-presentation", "sidebar");
    expect(nav).toHaveAttribute("data-variant", "circuit");
    expect(nav).toHaveClass("content-toc");
    expect(screen.getByText("On this page", {selector: "div"})).toHaveAttribute(
      "data-slot",
      "content-toc-title",
    );
    expect(nav.querySelector('[data-slot="content-toc-list"]')).toBeInTheDocument();
    expect(contentTocVariants().item()).toBe("content-toc__item");
  });

  it("exposes the active entry and depth on each link", () => {
    render(<TocFixture variant="straight" />);
    const active = screen.getByRole("link", {name: "Anchors"});

    expect(active).toHaveAttribute("aria-current", "location");
    expect(active).toHaveAttribute("data-active", "true");
    expect(active).toHaveAttribute("data-depth", "3");
    expect(active).toHaveAttribute("href", "#details");
    expect(screen.getByRole("link", {name: "Overview"})).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("navigation")).toHaveAttribute("data-variant", "straight");
  });

  it("calls onNavigate instead of following the hash", async () => {
    const user = setupUser();
    const onNavigate = vi.fn();

    render(<TocFixture onNavigate={onNavigate} />);
    await user.click(screen.getByRole("link", {name: "Next steps"}));

    expect(onNavigate).toHaveBeenCalledExactlyOnceWith("next");
    expect(window.location.hash).toBe("");
  });

  it("supports opting out of navigation from an item's onClick", async () => {
    const user = setupUser();
    const onNavigate = vi.fn();

    render(
      <ContentToc items={items} label="Outline" onNavigate={onNavigate}>
        <ContentToc.List>
          {() => <ContentToc.Item onClick={(event) => event.preventDefault()} />}
        </ContentToc.List>
      </ContentToc>,
    );
    await user.click(screen.getByRole("link", {name: "Overview"}));

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("supports custom item content and title", () => {
    render(
      <ContentToc activeId="intro" className="sticky top-4" items={items} label="Form outline">
        <ContentToc.Title>Sections</ContentToc.Title>
        <ContentToc.List className="max-h-40">
          {(item) => (
            <ContentToc.Item>
              {item.title}
              {item.id === "next" && <span aria-label="Has errors" role="img" />}
            </ContentToc.Item>
          )}
        </ContentToc.List>
      </ContentToc>,
    );

    expect(screen.getByRole("navigation", {name: "Form outline"})).toHaveClass("sticky");
    expect(screen.getByText("Sections")).toBeInTheDocument();
    expect(screen.getByRole("img", {name: "Has errors"}).closest("a")).toHaveAttribute(
      "href",
      "#next",
    );
    expect(
      screen.getByRole("navigation").querySelector('[data-slot="content-toc-list"]'),
    ).toHaveClass("max-h-40");
  });

  it("renders nothing without entries", () => {
    const {container} = render(<TocFixture items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the floating trigger with the current position", () => {
    render(<TocFixture presentation="floating" />);
    const trigger = screen.getByRole("button", {name: /On this page/});

    expect(trigger).toHaveAttribute("data-slot", "content-toc-trigger");
    expect(trigger).toHaveTextContent("2 / 3");
    expect(trigger).toHaveTextContent("Anchors");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("throws when parts are used outside ContentToc", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<ContentToc.List />)).toThrow(/ContentToc\.List/);
  });
});

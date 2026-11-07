import type {ContentTocEntry} from "@/components/content-toc";

import {render} from "@sy-inc/testing/browser";
import {useRef} from "react";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {ContentToc, useContentTocSpy} from "@/components/content-toc";

const items: ContentTocEntry[] = [
  {depth: 2, id: "intro", title: "概览"},
  {depth: 3, id: "details", title: "标题与锚点"},
  {depth: 2, id: "next", title: "下一节"},
];

describe("ContentToc (browser)", () => {
  it.each(["straight", "circuit"] as const)(
    "supports %s floating navigation and Escape focus restoration",
    async (variant) => {
      await render(
        <ContentToc
          activeId="details"
          items={items}
          label="本页目录"
          presentation="floating"
          variant={variant}
          onNavigate={vi.fn()}
        >
          <ContentToc.Title />
          <ContentToc.List />
        </ContentToc>,
      );
      const trigger = page.getByRole("button", {name: /本页目录/});

      await expect.element(trigger).toHaveTextContent("标题与锚点");
      await trigger.click();
      const dialog = page.getByRole("dialog", {name: "本页目录"});

      await expect.element(dialog).toBeInTheDocument();
      expect(dialog.element().contains(document.activeElement)).toBe(true);
      await expect.element(page.getByRole("navigation", {name: "本页目录"})).toBeInTheDocument();
      expect(document.querySelector('[data-slot="content-toc"]')).toHaveAttribute(
        "data-variant",
        variant,
      );
      await expect
        .element(page.getByRole("link", {name: "标题与锚点"}))
        .toHaveAttribute("aria-current", "location");

      await userEvent.keyboard("{Escape}");
      await expect.element(dialog).not.toBeInTheDocument();
      await expect.element(trigger).toHaveFocus();

      await trigger.click();
      await expect.element(dialog).toBeInTheDocument();
      await expect
        .poll(() => Number(dialog.element().querySelector("clipPath rect")?.getAttribute("height")))
        .toBeGreaterThan(0);
    },
  );

  it("calls navigation once and closes the floating panel after choosing a chapter", async () => {
    const onNavigate = vi.fn();

    await render(
      <ContentToc
        activeId="intro"
        items={items}
        label="本页目录"
        presentation="floating"
        onNavigate={onNavigate}
      >
        <ContentToc.Title />
        <ContentToc.List />
      </ContentToc>,
    );

    await page.getByRole("button", {name: /本页目录/}).click();
    await page.getByRole("link", {name: "下一节"}).click();
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith("next");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports dismissing the floating panel by clicking outside", async () => {
    await render(
      <>
        <Button>正文操作</Button>
        <ContentToc
          activeId="intro"
          items={items}
          label="本页目录"
          presentation="floating"
          onNavigate={vi.fn()}
        >
          <ContentToc.Title />
          <ContentToc.List />
        </ContentToc>
      </>,
    );
    await page.getByRole("button", {name: /本页目录/}).click();
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    await page.getByRole("button", {name: "正文操作"}).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the rail highlight across every visible entry", async () => {
    await render(
      <ContentToc activeId="intro" items={items} label="本页目录" visibleIds={["intro", "next"]}>
        <ContentToc.List />
      </ContentToc>,
    );
    const links = [...document.querySelectorAll<HTMLElement>('[data-slot="content-toc-item"]')];
    const span = links.at(-1)!.offsetTop + links.at(-1)!.offsetHeight - links[0]!.offsetTop;

    await expect
      .poll(() => Number(document.querySelector("clipPath rect")?.getAttribute("height")))
      .toBe(span);
  });

  it("supports tracking and navigating a scroll container with useContentTocSpy", async () => {
    const SpyFixture = () => {
      const root = useRef<HTMLDivElement>(null);
      const spy = useContentTocSpy({ids: items.map((item) => item.id), root});

      return (
        <>
          <div ref={root} data-testid="reader" style={{height: 200, overflowY: "auto"}}>
            {items.map((item) => (
              <section key={item.id} style={{height: 300}}>
                <h2 id={item.id} tabIndex={-1}>
                  {item.title}
                </h2>
              </section>
            ))}
          </div>
          <ContentToc {...spy} items={items} label="本页目录">
            <ContentToc.List />
          </ContentToc>
        </>
      );
    };

    await render(<SpyFixture />);
    const reader = page.getByTestId("reader").element() as HTMLElement;
    const link = (name: string) => page.getByRole("link", {name});

    await expect.element(link("概览")).toHaveAttribute("aria-current", "location");
    await expect.element(link("标题与锚点")).toHaveAttribute("data-visible", "false");

    reader.scrollTop = 200;
    await expect.element(link("概览")).toHaveAttribute("data-visible", "true");
    await expect.element(link("标题与锚点")).toHaveAttribute("data-visible", "true");

    reader.scrollTop = reader.scrollHeight;
    await expect.element(link("下一节")).toHaveAttribute("aria-current", "location");

    await link("标题与锚点").click();
    await expect.element(link("标题与锚点")).toHaveAttribute("aria-current", "location");
    const heading = page.getByRole("heading", {name: "标题与锚点"});

    await expect.element(heading).toHaveFocus();
    await expect
      .poll(
        () => heading.element().getBoundingClientRect().top - reader.getBoundingClientRect().top,
      )
      .toBeCloseTo(80, 0);
  });
});

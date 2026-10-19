import type {ContentTocEntry} from "@/components/content-toc";

import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {ContentToc} from "@/components/content-toc";

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

    const screen = await render(
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
    await screen.rerender(
      <ContentToc
        activeId="next"
        items={items}
        label="本页目录"
        presentation="floating"
        onNavigate={onNavigate}
      >
        <ContentToc.Title />
        <ContentToc.List />
      </ContentToc>,
    );
    await expect.element(page.getByRole("button", {name: /本页目录/})).toHaveTextContent("下一节");
    await page.getByRole("button", {name: /本页目录/}).click();
    await expect
      .element(page.getByRole("link", {name: "下一节"}))
      .toHaveAttribute("aria-current", "location");
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

  it("preserves the active chapter when switching from sidebar to floating presentation", async () => {
    const onNavigate = vi.fn();
    const screen = await render(
      <ContentToc activeId="details" items={items} label="本页目录" onNavigate={onNavigate}>
        <ContentToc.Title />
        <ContentToc.List />
      </ContentToc>,
    );

    await expect
      .element(page.getByRole("link", {name: "标题与锚点"}))
      .toHaveAttribute("aria-current", "location");
    await screen.rerender(
      <ContentToc
        activeId="details"
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
    await expect
      .element(page.getByRole("link", {name: "标题与锚点"}))
      .toHaveAttribute("aria-current", "location");
  });
});

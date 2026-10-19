import type {ContentTocItem} from "@/stories/content-toc/content-toc";

import {render} from "@sy-inc/testing/browser";
import {page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {ContentToc} from "@/stories/content-toc/content-toc";

const items: ContentTocItem[] = [
  {depth: 2, id: "intro", title: "概览"},
  {depth: 3, id: "details", title: "标题与锚点"},
  {depth: 2, id: "next", title: "下一节"},
];

describe("Content TOC story (browser)", () => {
  it.each(["straight", "circuit"] as const)(
    "supports %s floating navigation and Escape focus restoration",
    async (highlightVariant) => {
      await render(
        <ContentToc
          activeId="details"
          highlightVariant={highlightVariant}
          items={items}
          presentation="floating"
          onNavigate={vi.fn()}
        />,
      );
      const trigger = page.getByRole("button", {name: "展开本页目录"});

      await expect.element(trigger).toHaveTextContent("标题与锚点");
      await trigger.click();
      const dialog = page.getByRole("dialog", {name: "本页目录"});

      await expect.element(dialog).toBeInTheDocument();
      expect(dialog.element().contains(document.activeElement)).toBe(true);
      await expect
        .element(page.getByRole("navigation", {name: "本页目录"}))
        .toHaveAttribute("data-highlight-variant", highlightVariant);
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
      <ContentToc activeId="intro" items={items} presentation="floating" onNavigate={onNavigate} />,
    );

    await page.getByRole("button", {name: "展开本页目录"}).click();
    await page.getByRole("link", {name: "下一节"}).click();
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith("next");
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    await screen.rerender(
      <ContentToc activeId="next" items={items} presentation="floating" onNavigate={onNavigate} />,
    );
    await expect
      .element(page.getByRole("button", {name: "展开本页目录"}))
      .toHaveTextContent("下一节");
    await page.getByRole("button", {name: "展开本页目录"}).click();
    await expect
      .element(page.getByRole("link", {name: "下一节"}))
      .toHaveAttribute("aria-current", "location");
  });

  it("supports dismissing the floating panel by clicking outside", async () => {
    await render(
      <>
        <Button>正文操作</Button>
        <ContentToc activeId="intro" items={items} presentation="floating" onNavigate={vi.fn()} />
      </>,
    );
    await page.getByRole("button", {name: "展开本页目录"}).click();
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    await page.getByRole("button", {name: "正文操作"}).click();
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserves the active chapter when switching from sidebar to floating presentation", async () => {
    const onNavigate = vi.fn();
    const screen = await render(
      <ContentToc activeId="details" items={items} onNavigate={onNavigate} />,
    );

    await expect
      .element(page.getByRole("link", {name: "标题与锚点"}))
      .toHaveAttribute("aria-current", "location");
    await screen.rerender(
      <ContentToc
        activeId="details"
        items={items}
        presentation="floating"
        onNavigate={onNavigate}
      />,
    );
    await page.getByRole("button", {name: "展开本页目录"}).click();
    await expect
      .element(page.getByRole("link", {name: "标题与锚点"}))
      .toHaveAttribute("aria-current", "location");
  });
});

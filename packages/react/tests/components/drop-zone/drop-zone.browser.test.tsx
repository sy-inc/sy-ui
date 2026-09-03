import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {UploadDropZone} from "./fixtures";

const select = async (name: string, type = "image/png") => {
  const input = page
    .getByRole("button", {name: "Select files"})
    .element()
    .parentElement!.querySelector<HTMLInputElement>("input[type=file]")!;
  const transfer = new DataTransfer();

  transfer.items.add(new File(["content"], name, {type}));
  Object.defineProperty(input, "files", {configurable: true, value: transfer.files});
  input.dispatchEvent(new Event("change", {bubbles: true}));
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// These run against real CSS and the real browser layout engine.
describe("DropZone (browser)", () => {
  it("centers the empty square trigger, then widens the added card to full width", async () => {
    await render(<UploadDropZone maxFiles={2} />);
    const rowBefore = page
      .getByRole("button", {name: "Select files"})
      .element()
      .closest<HTMLElement>('[data-slot="drop-zone-row"]')!;
    const capsuleBefore = rowBefore.querySelector<HTMLElement>('[data-slot="drop-zone-capsule"]')!;
    const rectBefore = capsuleBefore.getBoundingClientRect();
    const rowRectBefore = rowBefore.getBoundingClientRect();

    // Centered: equal space on both sides of the empty square.
    expect(Math.round(rectBefore.left - rowRectBefore.left)).toBeCloseTo(
      Math.round(rowRectBefore.right - rectBefore.right),
      0,
    );

    await select("photo.png");
    await expect.element(page.getByText("photo.png")).toBeInTheDocument();
    await wait(300);

    const rowAfter = page
      .getByText("photo.png")
      .element()
      .closest<HTMLElement>('[data-slot="drop-zone-row"]')!;
    const capsuleAfter = rowAfter.querySelector<HTMLElement>('[data-slot="drop-zone-capsule"]')!;
    const rectAfter = capsuleAfter.getBoundingClientRect();
    const rowRectAfter = rowAfter.getBoundingClientRect();

    expect(Math.round(rectAfter.width)).toBeCloseTo(Math.round(rowRectAfter.width), -1);
  });

  it("keeps a card's height fixed to the square's size until its preview opens", async () => {
    await render(<UploadDropZone maxFiles={3} />);
    const rowHeight = () =>
      Math.round(
        document.querySelector<HTMLElement>('[data-slot="drop-zone-row"]')!.getBoundingClientRect()
          .height,
      );
    const emptyHeight = rowHeight();

    await select("photo.png");
    await wait(300);
    expect(rowHeight()).toBe(emptyHeight);

    await select("notes.pdf", "application/pdf");
    await wait(300);
    const rows = document.querySelectorAll<HTMLElement>('[data-slot="drop-zone-row"]');

    expect(Math.round(rows[1]!.getBoundingClientRect().height)).toBe(emptyHeight);

    await page.getByRole("button", {name: "Toggle preview"}).click();
    await wait(300);
    expect(Math.round(rows[0]!.getBoundingClientRect().height)).toBeGreaterThan(emptyHeight);
  });

  it("grows every card at once on a multi-file drop and adds one trailing empty square", async () => {
    await render(<UploadDropZone maxFiles={4} />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const transfer = new DataTransfer();

    transfer.items.add(new File(["a"], "one.png", {type: "image/png"}));
    transfer.items.add(new File(["b"], "two.png", {type: "image/png"}));
    transfer.items.add(new File(["c"], "three.png", {type: "image/png"}));
    Object.defineProperty(input, "files", {configurable: true, value: transfer.files});
    input.dispatchEvent(new Event("change", {bubbles: true}));

    await expect.element(page.getByText("three.png")).toBeInTheDocument();
    await wait(300);

    const rows = document.querySelectorAll<HTMLElement>('[data-slot="drop-zone-row"]');

    expect(rows).toHaveLength(4);
    const rowWidth = rows[0]!.getBoundingClientRect().width;

    for (const row of [rows[0]!, rows[1]!, rows[2]!]) {
      const capsule = row.querySelector<HTMLElement>('[data-slot="drop-zone-capsule"]')!;

      expect(Math.round(capsule.getBoundingClientRect().width)).toBeCloseTo(
        Math.round(rowWidth),
        -1,
      );
    }
    expect(rows[3]!.querySelector('[data-slot="drop-zone-trigger"]')).toBeInTheDocument();
  });

  it("brings back the upload trigger after removing the sole remaining card", async () => {
    await render(<UploadDropZone maxFiles={1} />);
    await select("solo.png");

    await page.getByRole("button", {name: "Remove solo.png"}).click();
    await wait(300);

    expect(document.querySelectorAll('[data-slot="drop-zone-row"]')).toHaveLength(1);
    expect(document.querySelector('[data-slot="drop-zone-trigger"]')).toBeInTheDocument();

    // The trigger opens the file picker again.
    await select("again.png");
    await expect.element(page.getByText("again.png")).toBeInTheDocument();
  });

  it("removes a middle card, leaving the trailing empty row untouched", async () => {
    await render(<UploadDropZone maxFiles={3} />);
    await select("first.png");
    await select("second.png");

    await page.getByRole("button", {name: "Remove first.png"}).click();

    await expect.element(page.getByText("first.png")).not.toBeInTheDocument();
    await expect.element(page.getByText("second.png")).toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="drop-zone-trigger"]')).toHaveLength(1);
  });

  it("moves focus to the next remove button after deletion", async () => {
    await render(<UploadDropZone maxFiles={2} />);
    await select("first.png");
    await select("second.png");
    const first = page.getByRole("button", {name: "Remove first.png"});

    await first.click();

    await expect.element(page.getByRole("button", {name: "Remove second.png"})).toHaveFocus();
  });

  it("moves focus to the last card when selecting fills capacity", async () => {
    await render(<UploadDropZone />);
    const trigger = page.getByRole("button", {name: "Select files"});

    trigger.element().focus();
    await select("full.png");

    await expect.element(page.getByRole("button", {name: "Remove full.png"})).toHaveFocus();
  });

  it("expands and collapses an image preview", async () => {
    await render(<UploadDropZone />);
    await select("preview.png");
    const toggle = page.getByRole("button", {name: "Toggle preview"});

    await toggle.click();
    await expect.element(toggle).toHaveAttribute("aria-expanded", "true");
    await expect.element(page.getByRole("img", {name: "preview.png"})).toBeVisible();
    await toggle.click();
    await expect.element(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("removes a card without error while its preview is still expanded", async () => {
    await render(<UploadDropZone maxFiles={2} />);
    await select("expanded.png");
    await page.getByRole("button", {name: "Toggle preview"}).click();
    await expect.element(page.getByRole("img", {name: "expanded.png"})).toBeVisible();

    await page.getByRole("button", {name: "Remove expanded.png"}).click();

    await expect.element(page.getByText("expanded.png")).not.toBeInTheDocument();
  });
});

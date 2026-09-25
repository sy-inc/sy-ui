import type {DropZoneUploadContext} from "@/components/drop-zone";

import {render} from "@sy-inc/testing/browser";
import {useState} from "react";
import {page, userEvent} from "vitest/browser";

import {ImageField} from "@/components/image-field";
import story from "@/components/image-field/image-field.stories";

import "../../../../styles/dist/sy-inc.min.css";

const source = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><circle cx="256" cy="256" r="240" fill="blue"/></svg>')}`;
const frame = () => document.querySelector<HTMLElement>('[data-slot="image-field-frame"]')!;
const dimensions = () => {
  const {height, width} = frame().getBoundingClientRect();

  return [width, height];
};
const paste = (element: Element) => {
  const transfer = new DataTransfer();

  transfer.items.add(
    new File(['<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"/>'], "pasted.svg", {
      type: "image/svg+xml",
    }),
  );
  element.dispatchEvent(
    new ClipboardEvent("paste", {bubbles: true, cancelable: true, clipboardData: transfer}),
  );
};

describe("ImageField (browser)", () => {
  beforeEach(async () => {
    await page.viewport(900, 700);
  });
  it("shows the selected image after the Story upload and releases replaced or removed previews", async () => {
    const Story = story.render;
    const revoke = vi.spyOn(URL, "revokeObjectURL");

    await render(<Story {...story.args} />);
    const select = async (width: number) => {
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = 40;
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((result) => resolve(result!)),
      );
      const transfer = new DataTransfer();

      transfer.items.add(new File([blob], `own-${width}.png`, {type: "image/png"}));
      const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;

      input.files = transfer.files;
      input.dispatchEvent(new Event("change", {bubbles: true}));
    };

    await select(80);
    await page.getByRole("button", {name: "Cancel upload"}).click();
    await expect
      .element(page.getByRole("button", {name: "Drop, paste or click to upload"}))
      .toBeVisible();
    await select(80);
    await expect.element(page.getByRole("button", {name: "Remove image"})).toBeVisible();
    const image = () => page.getByRole("img", {name: "Banner"}).element() as HTMLImageElement;

    await expect.poll(() => image().naturalWidth).toBe(80);
    const first = image().src;
    const handoff = () => document.querySelector('[data-slot="image-field-handoff"]');

    // The local handoff leaves once the stored image has loaded, and its URL is released.
    await expect.poll(handoff).toBeNull();

    expect(first).toMatch(/^blob:/);
    await select(120);
    await expect.element(page.getByRole("button", {name: "Remove image"})).toBeVisible();
    await expect.poll(() => image().naturalWidth).toBe(120);
    const second = image().src;

    expect(second).not.toBe(first);
    expect(revoke).toHaveBeenCalledWith(first);
    await page.getByRole("button", {name: "Remove image"}).click();
    expect(revoke).toHaveBeenCalledWith(second);
    await expect
      .element(page.getByRole("button", {name: "Drop, paste or click to upload"}))
      .toBeVisible();
  });

  it.each(["inline", "tile", "banner"] as const)(
    "keeps %s geometry stable through paste, progress, completion and removal",
    async (layout) => {
      let finish: (path: string) => void;
      let context: DropZoneUploadContext;
      const onUpload = vi.fn((_: File, next: DropZoneUploadContext) => {
        context = next;

        return new Promise<string>((resolve) => {
          finish = resolve;
        });
      });

      function Example() {
        const [value, setValue] = useState("");

        return (
          <div style={{width: 560}}>
            <ImageField
              accept="image/*"
              aspectRatio={layout === "banner" ? 16 / 5 : 1}
              label="Logo"
              layout={layout}
              resolveSrc={() => source}
              value={value}
              onChange={setValue}
              onUpload={onUpload}
            />
          </div>
        );
      }
      await render(<Example />);
      const before = dimensions();
      const trigger = page.getByRole("button", {name: "Drop, paste or click to upload"});

      trigger.element().focus();
      paste(trigger.element());
      await expect.poll(() => onUpload.mock.calls.length).toBe(1);
      context!.onProgress(0.64);
      await expect.element(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "64");
      expect(dimensions()).toEqual(before);
      finish!("/logo.svg");
      await expect.element(page.getByRole("button", {name: "Remove image"})).toBeVisible();
      expect(dimensions()).toEqual(before);
      const image = page.getByRole("img", {name: "Logo"}).element();

      expect(getComputedStyle(image).objectFit).toBe("contain");
      await page.getByRole("button", {name: "Remove image"}).click();
      await expect.element(trigger).toBeVisible();
      expect(dimensions()).toEqual(before);
    },
  );

  it.each(["inline", "tile", "banner"] as const)(
    "keeps the %s image usable and geometry stable after invalid selection and upload failure",
    async (layout) => {
      const onUpload = vi.fn(async () => {
        throw new Error("server failed");
      });

      await render(
        <div style={{width: 560}}>
          <ImageField
            aspectRatio={1}
            label="Logo"
            layout={layout}
            resolveSrc={() => source}
            value="/logo.svg"
            onChange={() => {}}
            onUpload={onUpload}
          />
        </div>,
      );
      await expect
        .poll(
          () => (page.getByRole("img", {name: "Logo"}).element() as HTMLImageElement).naturalWidth,
        )
        .toBe(512);
      const before = dimensions();
      const select = (file: File) => {
        const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
        const transfer = new DataTransfer();

        transfer.items.add(file);
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", {bubbles: true}));
      };

      select(new File(["text"], "bad.txt", {type: "text/plain"}));
      await expect.element(page.getByRole("alert")).toHaveTextContent("Unsupported image format");
      expect(onUpload).not.toHaveBeenCalled();
      expect(dimensions()).toEqual(before);
      await page.getByRole("img", {name: "Logo"}).click();
      await expect.element(page.getByRole("dialog", {name: "Logo"})).toBeVisible();
      await userEvent.keyboard("{Escape}");
      select(new File(["png"], "image.png", {type: "image/png"}));
      await expect.element(page.getByRole("alert")).toHaveTextContent("Upload failed");
      expect(dimensions()).toEqual(before);
      const retry = page.getByRole("button", {name: "Retry upload"});

      await expect.element(retry).toBeVisible();
      await expect.element(page.getByRole("button", {name: "Remove image"})).toBeVisible();
      if (layout !== "inline") {
        const bounds = frame().getBoundingClientRect();

        for (const button of document.querySelectorAll(
          '[data-slot="image-field-actions"] button',
        )) {
          const rect = button.getBoundingClientRect();

          expect(rect.left).toBeGreaterThanOrEqual(bounds.left);
          expect(rect.right).toBeLessThanOrEqual(bounds.right);
          expect(rect.bottom).toBeLessThanOrEqual(bounds.bottom);
        }
      }
      await retry.click();
      await expect.poll(() => onUpload.mock.calls.length).toBe(2);
    },
  );

  it.each(["inline", "tile", "banner"] as const)(
    "keeps the %s empty upload picker usable after failure with only retry in the toolbar",
    async (layout) => {
      const onUpload = vi.fn(async () => {
        throw new Error("failed");
      });

      await render(
        <div style={{width: 560}}>
          <ImageField
            accept="image/*"
            aspectRatio={1}
            label="Logo"
            layout={layout}
            value=""
            onChange={() => {}}
            onUpload={onUpload}
          />
        </div>,
      );
      const before = dimensions();
      const picker = page.getByRole("button", {name: "Drop, paste or click to upload"});
      const target = page.getByRole("button", {name: /Logo/});

      await expect.element(target).toHaveAccessibleName(/Logo/);
      paste(picker.element());
      await expect.element(page.getByRole("alert")).toHaveTextContent("Upload failed");
      await expect.element(picker).toBeVisible();
      await expect.element(picker).toBeEnabled();
      await expect
        .element(page.getByRole("button", {name: "Remove image"}))
        .not.toBeInTheDocument();
      expect(document.querySelectorAll('[data-slot="image-field-actions"] button')).toHaveLength(1);
      expect(dimensions()).toEqual(before);
      await page.getByRole("button", {name: "Retry upload"}).click();
      await expect.poll(() => onUpload.mock.calls.length).toBe(2);
      await expect.element(page.getByRole("alert")).toHaveTextContent("Upload failed");
      paste(picker.element());
      await expect.poll(() => onUpload.mock.calls.length).toBe(3);
    },
  );

  it("uses 56px inline and 176px tile frames and preserves a failed URL frame", async () => {
    const view = await render(
      <ImageField
        aspectRatio={1}
        label="Logo"
        layout="inline"
        resolveSrc={() => source}
        value="/logo.svg"
        onChange={() => {}}
        onUpload={async () => "/logo.svg"}
      />,
    );

    expect(dimensions()).toEqual([56, 56]);
    await view.rerender(
      <ImageField
        aspectRatio={1}
        label="Logo"
        layout="tile"
        resolveSrc={() => source}
        value="/logo.svg"
        onChange={() => {}}
        onUpload={async () => "/logo.svg"}
      />,
    );
    expect(dimensions()).toEqual([176, 176]);
    await view.rerender(
      <ImageField
        aspectRatio={1}
        label="Logo"
        layout="tile"
        value="/does-not-exist.png"
        onChange={() => {}}
        onUpload={async () => "/logo.svg"}
      />,
    );
    await expect.element(page.getByText("Image could not be loaded")).toBeVisible();
    expect(dimensions()).toEqual([176, 176]);
    await expect.element(page.getByRole("button", {name: "Replace image"})).toBeVisible();
  });

  it("opens the preview from the image and closes with Escape", async () => {
    await render(
      <ImageField
        aspectRatio={1}
        label="Logo"
        layout="tile"
        resolveSrc={() => source}
        value="/logo.svg"
        onChange={() => {}}
        onUpload={async () => "/logo.svg"}
      />,
    );
    await expect
      .poll(
        () => (page.getByRole("img", {name: "Logo"}).element() as HTMLImageElement).naturalWidth,
      )
      .toBe(512);
    const preview = page.getByRole("button", {name: "Preview image: Logo"});

    preview.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("dialog", {name: "Logo"})).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog", {name: "Logo"})).not.toBeInTheDocument();
    await expect.element(preview).toHaveFocus();
  });

  it("accepts native file drops and changes the frame proportion without cropping the image", async () => {
    const onUpload = vi.fn(async () => "/logo.svg");
    const view = await render(
      <div style={{width: 560}}>
        <ImageField
          accept="image/*"
          aspectRatio={1}
          label="Logo"
          resolveSrc={() => source}
          value="/logo.svg"
          onChange={() => {}}
          onUpload={onUpload}
        />
      </div>,
    );
    const area = document.querySelector('[data-slot="drop-zone-area"]')!;
    const transfer = new DataTransfer();

    transfer.items.add(new File(["svg"], "logo.svg", {type: "image/svg+xml"}));
    const entry = vi
      .spyOn(DataTransferItem.prototype, "webkitGetAsEntry")
      .mockReturnValue({isFile: true} as FileSystemEntry);

    area.dispatchEvent(new DragEvent("dragenter", {bubbles: true, dataTransfer: transfer}));
    area.dispatchEvent(new DragEvent("dragover", {bubbles: true, dataTransfer: transfer}));
    await expect.element(page.getByText("Release to upload")).toBeVisible();
    area.dispatchEvent(new DragEvent("drop", {bubbles: true, dataTransfer: transfer}));
    entry.mockRestore();
    await expect.poll(() => onUpload.mock.calls.length).toBe(1);
    await view.rerender(
      <div style={{width: 560}}>
        <ImageField
          aspectRatio={16 / 5}
          label="Logo"
          resolveSrc={() => source}
          value="/logo.svg"
          onChange={() => {}}
          onUpload={onUpload}
        />
      </div>,
    );
    await expect.element(page.getByText(/Image proportions differ/)).toBeVisible();
    const [width, height] = dimensions();

    expect(width! / height!).toBeCloseTo(16 / 5, 1);
  });
});

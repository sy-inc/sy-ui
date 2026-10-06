import type {DropZoneUploadContext} from "@/components/drop-zone";
import type {CSSProperties} from "react";

import {render} from "@sy-inc/testing/browser";
import {useState} from "react";
import {page, userEvent} from "vitest/browser";

import {Label} from "@/components";
import {ImageField} from "@/components/image-field";
import story from "@/components/image-field/image-field.stories";

import "../../../../styles/dist/sy-inc.min.css";

const source = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><circle cx="256" cy="256" r="240" fill="blue"/></svg>')}`;
// A consumer-sized frame (`className="[--image-field-size:8rem]"`) that keeps its ratio and fits every default toolbar.
const sized = {"--image-field-size": "8rem"} as CSSProperties;
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
    const image = () => page.getByRole("img", {name: "Logo"}).element() as HTMLImageElement;

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

  it.each([1, 16 / 5])(
    "keeps the %d ratio frame stable through paste, progress, completion and removal",
    async (ratio) => {
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
              aria-label="Logo"
              aspectRatio={ratio}
              resolveSrc={() => source}
              style={sized}
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

  it("keeps the image usable and geometry stable after invalid selection and upload failure", async () => {
    const onUpload = vi.fn(async () => {
      throw new Error("server failed");
    });

    await render(
      <div style={{width: 560}}>
        <ImageField
          aria-label="Logo"
          aspectRatio={1}
          resolveSrc={() => source}
          style={sized}
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
    const retry = page.getByRole("button", {name: "Retry upload"});

    await expect.element(retry).toBeVisible();
    await expect.element(page.getByRole("button", {name: "Remove image"})).toBeVisible();
    // Retry, replace and remove still fit the sized square.
    expect(dimensions()).toEqual(before);
    const bounds = frame().getBoundingClientRect();

    for (const button of document.querySelectorAll('[data-slot="image-field-actions"] button')) {
      const rect = button.getBoundingClientRect();

      expect(rect.width).toBe(rect.height);
      expect(rect.left).toBeGreaterThanOrEqual(bounds.left);
      expect(rect.right).toBeLessThanOrEqual(bounds.right);
      expect(rect.bottom).toBeLessThanOrEqual(bounds.bottom);
    }
    await retry.click();
    await expect.poll(() => onUpload.mock.calls.length).toBe(2);
  });

  it("keeps a custom toolbar button on the empty frame clickable above the upload picker", async () => {
    const onPick = vi.fn();

    await render(
      <div style={{width: 560}}>
        <ImageField
          aria-label="Logo"
          aspectRatio={1}
          value=""
          onChange={() => {}}
          onUpload={async () => "/uploaded.png"}
        >
          <ImageField.Frame>
            <ImageField.Actions>
              <ImageField.ReplaceTrigger />
              <button type="button" onClick={onPick}>
                Choose from library
              </button>
            </ImageField.Actions>
          </ImageField.Frame>
          <ImageField.Meta />
        </ImageField>
      </div>,
    );
    const pick = page.getByRole("button", {name: "Choose from library"});

    await expect.element(pick).toBeVisible();
    await expect
      .element(page.getByRole("button", {name: "Drop, paste or click to upload"}))
      .toBeVisible();
    await pick.click();
    expect(onPick).toHaveBeenCalledOnce();
  });

  it("hides the default toolbar on an empty frame", async () => {
    await render(
      <ImageField
        aria-label="Logo"
        aspectRatio={1}
        value=""
        onChange={() => {}}
        onUpload={async () => "/uploaded.png"}
      />,
    );
    const actions = document.querySelector<HTMLElement>('[data-slot="image-field-actions"]')!;

    expect(getComputedStyle(actions).display).toBe("none");
  });

  it("keeps the empty upload picker usable after failure with only retry in the toolbar", async () => {
    const onUpload = vi.fn(async () => {
      throw new Error("failed");
    });

    await render(
      <div style={{width: 560}}>
        <ImageField
          accept="image/*"
          aria-label="Logo"
          aspectRatio={1}
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
    await expect.element(page.getByRole("button", {name: "Remove image"})).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="image-field-actions"] button')).toHaveLength(1);
    expect(dimensions()).toEqual(before);
    await page.getByRole("button", {name: "Retry upload"}).click();
    await expect.poll(() => onUpload.mock.calls.length).toBe(2);
    await expect.element(page.getByRole("alert")).toHaveTextContent("Upload failed");
    paste(picker.element());
    await expect.poll(() => onUpload.mock.calls.length).toBe(3);
  });

  it("renders a 100px icon-only square by default, sized by the consumer, and keeps a failed URL frame", async () => {
    const field = (value: string, size?: CSSProperties) => (
      <ImageField
        aria-label="Logo"
        aspectRatio={1}
        resolveSrc={(path) => (path === "/logo.svg" ? source : path)}
        value={value}
        onChange={() => {}}
        onUpload={async () => "/logo.svg"}
      >
        <ImageField.Frame style={size}>
          <ImageField.Actions />
        </ImageField.Frame>
      </ImageField>
    );
    const view = await render(field(""));

    expect(dimensions()).toEqual([100, 100]);
    expect(frame().textContent).toBe("");
    // The default two-button pill fits the 100px square.
    await view.rerender(field("/logo.svg"));
    await expect.element(page.getByRole("button", {name: "Remove image"})).toBeVisible();
    expect(dimensions()).toEqual([100, 100]);
    await view.rerender(field("/logo.svg", {height: 144, width: 144}));
    expect(dimensions()).toEqual([144, 144]);
    await view.rerender(field("/does-not-exist.png", {height: 144, width: 144}));
    await expect.element(page.getByText("Image could not be loaded")).toBeInTheDocument();
    expect(dimensions()).toEqual([144, 144]);
    await expect.element(page.getByRole("button", {name: "Replace image"})).toBeVisible();
  });

  it("keeps the default 100px square inside an auto-width table cell", async () => {
    const field = (value: string) => (
      <table>
        <tbody>
          <tr>
            <td>
              <ImageField
                aria-label="Logo"
                aspectRatio={1}
                resolveSrc={() => source}
                value={value}
                onChange={() => {}}
                onUpload={async () => "/logo.svg"}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
    const view = await render(field(""));

    expect(dimensions()).toEqual([100, 100]);
    await view.rerender(field("/logo.svg"));
    await expect.element(page.getByRole("button", {name: "Remove image"})).toBeVisible();
    expect(dimensions()).toEqual([100, 100]);
  });

  it("replaces the upload icon with composed Placeholder content", async () => {
    await render(
      <ImageField aria-label="Logo" value="" onChange={() => {}} onUpload={async () => "/logo.svg"}>
        <ImageField.Frame>
          <ImageField.Placeholder>Upload logo</ImageField.Placeholder>
        </ImageField.Frame>
      </ImageField>,
    );
    const icon = document.querySelector('[data-slot="drop-zone-trigger"] svg')!;

    await expect.element(page.getByText("Upload logo")).toBeVisible();
    expect(getComputedStyle(icon).display).toBe("none");
  });

  it("stretches the square into a rectangle when the toolbar is wider", async () => {
    await render(
      <div style={{width: 560}}>
        <ImageField
          aria-label="Logo"
          aspectRatio={1}
          resolveSrc={() => source}
          value="/logo.svg"
          onChange={() => {}}
          onUpload={async () => "/logo.svg"}
        >
          <ImageField.Frame>
            <ImageField.Actions>
              <ImageField.ReplaceTrigger>Replace</ImageField.ReplaceTrigger>
              <ImageField.RemoveButton>Remove</ImageField.RemoveButton>
            </ImageField.Actions>
          </ImageField.Frame>
        </ImageField>
      </div>,
    );
    const [width, height] = dimensions();
    const actions = document
      .querySelector('[data-slot="image-field-actions"]')!
      .getBoundingClientRect();

    expect(height).toBe(100);
    expect(width).toBeGreaterThan(100);
    expect(actions.right).toBeLessThanOrEqual(frame().getBoundingClientRect().right);
  });

  it("places a composed Label above the frame and Meta below it", async () => {
    await render(
      <div style={{width: 560}}>
        <ImageField
          aspectRatio={1}
          recommendedWidth={512}
          value=""
          onChange={() => {}}
          onUpload={async () => "/logo.svg"}
        >
          <Label>Logo</Label>
          <ImageField.Frame>
            <ImageField.Actions />
          </ImageField.Frame>
          <ImageField.Meta />
        </ImageField>
      </div>,
    );
    await expect.element(page.getByRole("group", {name: "Logo"})).toBeVisible();
    const label = document.querySelector('[data-slot="label"]')!.getBoundingClientRect();
    const meta = document.querySelector('[data-slot="image-field-meta"]')!.getBoundingClientRect();
    const box = frame().getBoundingClientRect();

    expect(label.bottom).toBeLessThanOrEqual(box.top);
    expect(meta.top).toBeGreaterThanOrEqual(box.bottom);
  });

  it("renders Actions composed beside the frame as plain buttons next to it", async () => {
    await render(
      <div style={{width: 560}}>
        <ImageField
          aria-label="Logo"
          aspectRatio={1}
          resolveSrc={() => source}
          value="/logo.svg"
          onChange={() => {}}
          onUpload={async () => "/logo.svg"}
        >
          <ImageField.Frame />
          <ImageField.Actions />
        </ImageField>
      </div>,
    );
    const actions = document.querySelector<HTMLElement>('[data-slot="image-field-actions"]')!;

    await expect.element(page.getByRole("button", {name: "Remove image"})).toBeVisible();
    expect(dimensions()).toEqual([100, 100]);
    expect(actions.getBoundingClientRect().left).toBeGreaterThan(
      frame().getBoundingClientRect().right,
    );
    expect(getComputedStyle(actions).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("opens the preview from the image and closes with Escape", async () => {
    await render(
      <ImageField
        aria-label="Logo"
        aspectRatio={1}
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
          aria-label="Logo"
          aspectRatio={1}
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
    await expect.element(page.getByText("Release to upload")).toBeInTheDocument();
    area.dispatchEvent(new DragEvent("drop", {bubbles: true, dataTransfer: transfer}));
    entry.mockRestore();
    await expect.poll(() => onUpload.mock.calls.length).toBe(1);
    await view.rerender(
      <div style={{width: 560}}>
        <ImageField
          aria-label="Logo"
          aspectRatio={16 / 5}
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

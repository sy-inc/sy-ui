import {render} from "@sy-inc/testing/browser";
import {cdp, page, userEvent} from "vitest/browser";

import {Button} from "@/components/button";
import {ImagePreview} from "@/components/image-preview";
import {Modal} from "@/components/modal";

import "../../../../styles/dist/sy-inc.min.css";

import {ImagePreviewFixture, imageSrc, previewSrc} from "./fixtures";

const waitForMotion = async (image: Element) => {
  await Promise.all(image.getAnimations().map((animation) => animation.finished));
};

describe("ImagePreview (browser)", () => {
  beforeEach(async () => {
    await page.viewport(1000, 700);
  });

  it("supports keyboard opening, focus containment, Escape, and one callback per change", async () => {
    const onOpenChange = vi.fn();
    const previousOverflow = document.body.style.overflow;

    await render(
      <>
        <ImagePreviewFixture onOpenChange={onOpenChange} />
        <button>Outside</button>
      </>,
    );
    const trigger = page.getByRole("button", {name: "Open image: Mountain lake"});

    await expect.element(trigger).toBeInTheDocument();
    await userEvent.tab();
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    const dialog = page.getByRole("dialog", {name: "Mountain lake"});

    await expect.element(dialog).toBeVisible();
    expect(document.body.style.overflow).toBe("hidden");
    const close = page.getByRole("button", {name: "Close image"});

    await expect.element(close).toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    expect(dialog.element().contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe(previousOverflow);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("animates from an offset cropped thumbnail into the viewport and back", async () => {
    await render(
      <div style={{paddingTop: 110, paddingLeft: 170}}>
        <ImagePreview>
          <img
            alt="Cropped mountain"
            src={imageSrc}
            style={{width: 180, height: 180, objectFit: "cover"}}
          />
        </ImagePreview>
      </div>,
    );
    const trigger = page.getByRole("button", {name: "Open image: Cropped mountain"});

    await expect.element(trigger).toBeInTheDocument();
    const thumbnail = page.getByRole("img", {name: "Cropped mountain"}).element();
    const origin = thumbnail.getBoundingClientRect();
    const frames: DOMRect[] = [];
    let tracking = true;
    const record = () => {
      const img = document.querySelector("dialog[open] img");

      if (img) frames.push(img.getBoundingClientRect());
      if (tracking) requestAnimationFrame(record);
    };

    requestAnimationFrame(record);
    (trigger.element() as HTMLButtonElement).click();
    const dialog = page.getByRole("dialog", {name: "Cropped mountain"});

    await expect.element(dialog).toBeVisible();
    const image = dialog.getByRole("img", {name: "Cropped mountain"});

    await expect.poll(() => image.element().getBoundingClientRect().width).toBeGreaterThan(900);
    await waitForMotion(image.element());
    tracking = false;
    const final = image.element().getBoundingClientRect();

    expect(frames.some((frame) => frame.width < final.width * 0.8)).toBe(true);
    expect(frames.some((frame) => Math.abs(frame.top - origin.top) < 30)).toBe(true);
    expect(Math.abs(final.left + final.width / 2 - window.innerWidth / 2)).toBeLessThan(2);
    expect(Math.abs(final.top + final.height / 2 - window.innerHeight / 2)).toBeLessThan(2);
    expect(final.width).toBeLessThanOrEqual(window.innerWidth + 1);
    expect(final.height).toBeLessThanOrEqual(window.innerHeight + 1);
    await page.getByRole("button", {name: "Close image"}).click();
    await expect.element(dialog).not.toBeInTheDocument();
    const restored = thumbnail.getBoundingClientRect();

    expect(restored.top).toBeCloseTo(origin.top);
    expect(restored.left).toBeCloseTo(origin.left);
    expect(restored.width).toBeCloseTo(origin.width);
  });

  it("supports default-open and initial controlled-open after image decoding", async () => {
    const view = await render(<ImagePreviewFixture defaultOpen previewSrc={previewSrc} />);
    const dialog = page.getByRole("dialog", {name: "Mountain lake"});

    await expect.element(dialog).toBeVisible();
    const image = dialog.getByRole("img", {name: "Mountain lake"});

    await expect.element(image).toHaveAttribute("src", previewSrc);
    await page.getByRole("button", {name: "Close image"}).click();
    await expect.element(dialog).not.toBeInTheDocument();
    await view.unmount();
    await render(<ImagePreviewFixture isOpen />);
    await expect.element(page.getByRole("dialog", {name: "Mountain lake"})).toBeVisible();
  });

  it.each([
    {width: 180, height: 180, objectPosition: "right center"},
    {width: 240, height: 80, objectPosition: "center top"},
  ])(
    "clips the closing image to a $width × $height thumbnail before handing it back",
    async ({height, objectPosition, width}) => {
      await render(
        <div style={{paddingTop: 150, paddingLeft: 170}}>
          <ImagePreview>
            <img
              alt="Cropped return"
              src={imageSrc}
              style={{width, height, objectPosition, objectFit: "cover", borderRadius: 24}}
            />
          </ImagePreview>
        </div>,
      );
      const thumbnail = page.getByRole("img", {name: "Cropped return"}).element();
      const origin = thumbnail.getBoundingClientRect();

      await expect
        .element(page.getByRole("button", {name: "Open image: Cropped return"}))
        .toBeInTheDocument();
      await page.getByRole("img", {name: "Cropped return"}).click();
      const dialog = page.getByRole("dialog", {name: "Cropped return"});

      await expect.element(dialog).toBeVisible();
      const image = dialog.getByRole("img", {name: "Cropped return"}).element();

      await expect.poll(() => image.getBoundingClientRect().width).toBeGreaterThan(900);
      await waitForMotion(image);
      // Sample before the engine hides the dialog: a final DOM-only assertion misses
      // the oversized, uncropped frame that flashes immediately before handoff.
      const handoff = new Promise<{outside: boolean; center: boolean; corner: boolean}>(
        (resolve) => {
          image.addEventListener("transitionend", (event) => {
            if ((event as TransitionEvent).propertyName !== "transform") return;
            if (
              thumbnail.closest('[data-slot="image-preview"]')?.getAttribute("data-open") !==
              "false"
            )
              return;
            const hitsImage = (x: number, y: number) => document.elementFromPoint(x, y) === image;

            resolve({
              outside: [
                [origin.left - 10, origin.top + origin.height / 2],
                [origin.right + 10, origin.top + origin.height / 2],
                [origin.left + origin.width / 2, origin.top - 10],
                [origin.left + origin.width / 2, origin.bottom + 10],
              ].some(([x, y]) => hitsImage(x!, y!)),
              center: hitsImage(origin.left + origin.width / 2, origin.top + origin.height / 2),
              corner: hitsImage(origin.left + 1, origin.top + 1),
            });
          });
        },
      );

      await page.getByRole("button", {name: "Close image"}).click();
      expect(await handoff).toEqual({outside: false, center: true, corner: false});
      await expect.element(dialog).not.toBeInTheDocument();
    },
  );

  it("keeps the thumbnail usable if the full-resolution image fails", async () => {
    await render(<ImagePreviewFixture previewSrc="data:image/png;base64,broken" />);
    const trigger = page.getByRole("button", {name: "Open image: Mountain lake"});

    await expect.element(trigger).toBeInTheDocument();
    await page.getByRole("img", {name: "Mountain lake"}).click();
    const dialog = page.getByRole("dialog", {name: "Mountain lake"});
    const image = dialog.getByRole("img", {name: "Mountain lake"});

    await expect.element(image).toBeVisible();
    await waitForMotion(image.element());
    expect(image.element()).toHaveAttribute("src", imageSrc);
    await userEvent.keyboard("{Escape}");
    await expect.element(dialog).not.toBeInTheDocument();
  });

  it("preserves an outer Modal when closing the image preview", async () => {
    await render(
      <Modal>
        <Button>Open gallery dialog</Button>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog aria-label="Gallery">
              <Modal.CloseTrigger />
              <ImagePreviewFixture />
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>,
    );
    await page.getByRole("button", {name: "Open gallery dialog"}).click();
    const trigger = page.getByRole("button", {name: "Open image: Mountain lake"});

    await expect.element(trigger).toBeInTheDocument();
    (trigger.element() as HTMLButtonElement).focus();
    await userEvent.keyboard("{Enter}");
    const preview = page.getByRole("dialog", {name: "Mountain lake"});

    await expect.element(preview).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(preview).not.toBeInTheDocument();
    await expect.element(page.getByRole("dialog", {name: "Gallery"})).toBeVisible();
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog", {name: "Gallery"})).not.toBeInTheDocument();
  });

  it("releases scroll locking when disabled or unmounted while open", async () => {
    const previousOverflow = document.body.style.overflow;
    const view = await render(<ImagePreviewFixture defaultOpen />);

    await expect.element(page.getByRole("dialog")).toBeVisible();
    await view.rerender(<ImagePreviewFixture defaultOpen isDisabled />);
    await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe(previousOverflow);
    await view.rerender(<ImagePreviewFixture defaultOpen />);
    await expect.element(page.getByRole("dialog")).toBeVisible();
    await view.unmount();
    expect(document.body.style.overflow).toBe(previousOverflow);
  });
  it("supports reduced motion on a mobile viewport and still closes cleanly", async () => {
    const session = cdp();

    await session.send("Emulation.setEmulatedMedia", {
      features: [{name: "prefers-reduced-motion", value: "reduce"}],
    });
    try {
      await page.viewport(390, 844);
      expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
      await render(<ImagePreviewFixture defaultOpen />);
      const dialog = page.getByRole("dialog", {name: "Mountain lake"});

      await expect.element(dialog).toBeVisible();
      const image = dialog.getByRole("img", {name: "Mountain lake"}).element();

      expect(parseFloat(getComputedStyle(image).transitionDuration)).toBeLessThan(0.001);
      await waitForMotion(image);
      expect(image.getBoundingClientRect().width).toBeLessThanOrEqual(391);
      const close = page.getByRole("button", {name: "Close image"});

      expect(close.element().getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      await close.click();
      await expect.element(dialog).not.toBeInTheDocument();
      expect(document.body.style.overflow).not.toBe("hidden");
    } finally {
      await session.send("Emulation.setEmulatedMedia", {features: []});
    }
  });
});

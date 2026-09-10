import {act, fireEvent, render, screen, setupUser, waitFor} from "@sy-inc/testing/helpers";
import {createRef} from "react";

import {ImagePreview} from "@/components/image-preview";

import {ImagePreviewFixture, imageSrc} from "./fixtures";

describe("ImagePreview", () => {
  beforeEach(() => {
    // jsdom does not decode images or implement modal dialogs. Layout, animation,
    // native focus and scroll locking are exercised against Chromium separately.
    Object.defineProperty(HTMLImageElement.prototype, "decode", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    vi.spyOn(HTMLImageElement.prototype, "currentSrc", "get").mockImplementation(function (
      this: HTMLImageElement,
    ) {
      return this.src;
    });
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(1200);
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(800);
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value() {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value() {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLImageElement.prototype, "decode");
    Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  });

  it("renders native image props and refs, root props, and stable hooks", async () => {
    const rootRef = createRef<HTMLDivElement>();
    const imageRef = createRef<HTMLImageElement>();
    const onLoad = vi.fn();

    render(
      <ImagePreview ref={rootRef} className="custom-root" dir="rtl">
        <img
          ref={imageRef}
          alt="Lake"
          height={160}
          loading="lazy"
          src={imageSrc}
          width={240}
          onLoad={onLoad}
        />
      </ImagePreview>,
    );

    await screen.findByRole("button", {name: "Open image: Lake"});
    expect(rootRef.current).toHaveAttribute("data-slot", "image-preview");
    expect(rootRef.current).toHaveAttribute("data-open", "false");
    expect(rootRef.current).toHaveAttribute("dir", "rtl");
    expect(rootRef.current).toHaveClass("image-preview", "custom-root");
    expect(imageRef.current).toBe(screen.getByRole("img", {name: "Lake"}));
    expect(imageRef.current).toHaveAttribute("loading", "lazy");
    expect(imageRef.current).toHaveAttribute("width", "240");
    await act(async () => {
      fireEvent.load(imageRef.current!);
    });
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange for open and close without duplicating native close events", async () => {
    const onOpenChange = vi.fn();
    const user = setupUser();

    render(<ImagePreviewFixture onOpenChange={onOpenChange} />);

    await user.click(await screen.findByRole("button", {name: "Open image: Mountain lake"}));
    const dialog = await screen.findByRole("dialog");

    fireEvent.transitionEnd(dialog.querySelector("img")!);
    await user.click(screen.getByRole("button", {name: "Close image"}));
    fireEvent.transitionEnd(dialog.querySelector("img")!);
    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("supports controlled state without opening until the parent accepts the request", async () => {
    const onOpenChange = vi.fn();
    const user = setupUser();
    const view = render(<ImagePreviewFixture isOpen={false} onOpenChange={onOpenChange} />);

    await user.click(await screen.findByRole("button", {name: "Open image: Mountain lake"}));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    view.rerender(<ImagePreviewFixture isOpen onOpenChange={onOpenChange} />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("supports custom accessible labels and dialog/close button classes", async () => {
    const user = setupUser();

    render(
      <ImagePreviewFixture
        classNames={{dialog: "custom-dialog", closeButton: "custom-close"}}
        closeLabel="关闭图片"
        openLabel="查看图片"
      />,
    );
    await user.click(await screen.findByRole("button", {name: "查看图片: Mountain lake"}));
    expect(await screen.findByRole("dialog")).toHaveClass("custom-dialog");
    const close = screen.getByRole("button", {name: "关闭图片"});

    expect(close).toHaveClass("custom-close");
    expect(close).toHaveAttribute("data-slot", "image-preview-close-button");
  });

  it("renders disabled images without preview buttons or open requests", async () => {
    const user = setupUser();
    const onOpenChange = vi.fn();

    render(<ImagePreviewFixture defaultOpen isDisabled onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("img", {name: "Mountain lake"}));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

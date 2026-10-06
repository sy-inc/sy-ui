import type {DropZoneUploadContext} from "@/components/drop-zone";
import type {ImageFieldProps} from "@/components/image-field";

import {act, fireEvent, render, screen, setupUser, waitFor} from "@sy-inc/testing/helpers";
import {useState} from "react";
import {expectTypeOf} from "vitest";

import {Description, FieldError, Label} from "@/components";
import {ImageField} from "@/components/image-field";

const png = (name = "image.png") => new File(["image"], name, {type: "image/png"});
const upload = (file = png()) =>
  fireEvent.change(document.querySelector('input[type="file"]')!, {target: {files: [file]}});
const frame = () => document.querySelector('[data-slot="image-field-frame"]');
const handoff = () => document.querySelector('[data-slot="image-field-handoff"]');
const stub = () => {
  const calls: {
    context: DropZoneUploadContext;
    resolve: (path: string) => void;
    reject: (error: Error) => void;
  }[] = [];
  const onUpload = vi.fn(
    (_: File, context: DropZoneUploadContext) =>
      new Promise<string>((resolve, reject) => calls.push({context, reject, resolve})),
  );

  return {calls, onUpload};
};
const props = {
  "aria-label": "Banner",
  aspectRatio: 1,
  onChange: vi.fn(),
  onUpload: async () => "/uploaded.png",
  value: "",
};

function Controlled({onChange, value: initialValue = "", ...rest}: ImageFieldProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <ImageField
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe("ImageField", () => {
  it("shows readable size guidance without a decimal ratio", () => {
    render(<ImageField {...props} aspectRatio={16 / 5} recommendedWidth={1600} />);
    expect(screen.getByText("Recommended 1600 × 500")).toBeInTheDocument();
    expect(screen.queryByText("3.2:1")).not.toBeInTheDocument();
    expect(screen.getByRole("group", {name: "Banner"})).toHaveStyle({"--image-field-ratio": "3.2"});
  });

  it("supports omitting aspectRatio by following the image's proportions without a ratio warning", () => {
    expectTypeOf<ImageFieldProps["aspectRatio"]>().toEqualTypeOf<number | undefined>();
    const {aspectRatio: _, ...rest} = props;
    const view = render(<ImageField {...rest} recommendedWidth={1600} />);
    const group = screen.getByRole("group", {name: "Banner"});

    expect(screen.getByText("Recommended 1600px")).toBeInTheDocument();
    expect(group.style.getPropertyValue("--image-field-ratio")).toBe("");
    expect(frame()).toHaveAttribute("data-auto-ratio", "true");

    view.rerender(<ImageField {...rest} value="/poster.png" />);
    const image = screen.getByRole("img", {name: "Banner"});

    Object.defineProperties(image, {naturalHeight: {value: 1500}, naturalWidth: {value: 1000}});
    fireEvent.load(image);
    expect(group).toHaveStyle({"--image-field-ratio": String(1000 / 1500)});
    expect(screen.queryByText(/Image proportions differ/)).not.toBeInTheDocument();
    expect(screen.getByText("1000 × 1500 · PNG")).toBeInTheDocument();

    view.rerender(<ImageField {...rest} value="" />);
    expect(group.style.getPropertyValue("--image-field-ratio")).toBe("");
  });

  it("supports validateRatio={false} by keeping the declared frame without a ratio warning", () => {
    render(<ImageField {...props} validateRatio={false} value="/wide.png" />);
    const image = screen.getByRole("img", {name: "Banner"});

    Object.defineProperties(image, {naturalHeight: {value: 100}, naturalWidth: {value: 400}});
    fireEvent.load(image);
    expect(screen.getByRole("group", {name: "Banner"})).toHaveStyle({"--image-field-ratio": "1"});
    expect(frame()).not.toHaveAttribute("data-auto-ratio");
    expect(frame()).not.toHaveAttribute("data-warning");
    expect(screen.queryByText(/Image proportions differ/)).not.toBeInTheDocument();
  });

  it("renders an empty meta live region when there is no guidance to show", () => {
    render(<ImageField {...props} />);
    const meta = document.querySelector('[data-slot="image-field-meta"]');

    expect(meta).toBeEmptyDOMElement();
    expect(meta).toHaveAttribute("aria-live", "polite");
  });

  it("reads the image format from its saved path even when the display URL has no extension", () => {
    render(
      <ImageField
        {...props}
        resolveSrc={() => "/download/123"}
        value="/media/logo.webp?version=2#preview"
      />,
    );
    const image = screen.getByRole("img", {name: "Banner"});

    Object.defineProperties(image, {naturalHeight: {value: 512}, naturalWidth: {value: 512}});
    fireEvent.load(image);
    expect(screen.getByText("512 × 512 · WEBP")).toBeInTheDocument();
  });

  it.each(["banner", "tile", "inline"] as const)(
    "allows retrying or replacing a failed initial upload in %s",
    async (layout) => {
      const pending = stub();
      const user = setupUser();

      render(<Controlled {...props} {...pending} layout={layout} />);
      upload();
      await act(async () => pending.calls[0]!.reject(new Error("failed")));
      expect(screen.getByRole("alert")).toHaveTextContent("Upload failed");
      // Announced once: the drop zone's own live region stays silent.
      expect(screen.getAllByText("Upload failed")).toHaveLength(1);
      expect(screen.getByRole("button", {name: "Retry upload"})).toBeEnabled();
      expect(screen.getByRole("button", {name: "Drop, paste or click to upload"})).toBeEnabled();
      expect(screen.queryByRole("button", {name: "Replace image"})).not.toBeInTheDocument();
      expect(screen.queryByRole("button", {name: "Remove image"})).not.toBeInTheDocument();
      const actions = document.querySelector('[data-slot="image-field-actions"]')!;

      expect(actions.querySelectorAll("button")).toHaveLength(1);
      await user.click(screen.getByRole("button", {name: "Retry upload"}));
      expect(pending.calls).toHaveLength(2);
      await act(async () => pending.calls[1]!.reject(new Error("again")));
      upload(png("replacement.png"));
      await waitFor(() => expect(pending.calls).toHaveLength(3));
      expect(pending.onUpload.mock.calls[2]![0].name).toBe("replacement.png");
      await act(async () => pending.calls[2]!.resolve("/new.png"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByRole("img", {name: "Banner"})).toHaveAttribute("src", "/new.png");
    },
  );

  it.each(["banner", "tile", "inline"] as const)(
    "keeps saved image controls usable after rejected replacement in %s",
    async (layout) => {
      const onChange = vi.fn();
      const user = setupUser();

      render(
        <Controlled
          {...props}
          aspectRatio={1}
          layout={layout}
          value="/saved.png"
          onChange={onChange}
        />,
      );
      upload(new File(["text"], "invalid.txt", {type: "text/plain"}));
      await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent("Unsupported image format"),
      );
      expect(screen.getByRole("img", {name: "Banner"})).toHaveAttribute("src", "/saved.png");
      expect(screen.getByRole("button", {name: "Replace image"})).toBeEnabled();
      expect(screen.getByRole("button", {name: "Remove image"})).toBeEnabled();
      expect(screen.getByRole("alert").closest('[data-slot="image-field-meta"]')).not.toBeNull();
      expect(frame()).not.toContainElement(screen.getByRole("alert"));
      expect(onChange).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", {name: "Remove image"}));
      expect(onChange).toHaveBeenLastCalledWith("");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    },
  );

  it("supports composing a custom toolbar from the action parts", async () => {
    const onChange = vi.fn();
    const user = setupUser();

    render(
      <Controlled {...props} value="/saved.png" onChange={onChange}>
        <ImageField.Frame />
        <ImageField.Actions className="custom-toolbar">
          <ImageField.ReplaceTrigger>Replace</ImageField.ReplaceTrigger>
          <ImageField.RetryButton />
          <ImageField.RemoveButton variant="danger">Remove</ImageField.RemoveButton>
        </ImageField.Actions>
        <ImageField.Meta />
      </Controlled>,
    );
    const actions = document.querySelector('[data-slot="image-field-actions"]')!;

    expect(actions).toHaveClass("image-field__actions", "custom-toolbar");
    expect(actions).toHaveTextContent("ReplaceRemove");
    expect(screen.getByRole("button", {name: "Replace image"})).toBeEnabled();
    expect(screen.queryByRole("button", {name: "Retry upload"})).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", {name: "Remove image"}));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(screen.queryByRole("button", {name: "Remove image"})).not.toBeInTheDocument();
  });

  it.each(["banner", "tile", "inline"] as const)(
    "supports per-state toolbar buttons through the Actions render function in %s",
    async (layout) => {
      const onPick = vi.fn();
      const user = setupUser();
      const pending = stub();

      render(
        <Controlled {...props} {...pending} layout={layout}>
          <ImageField.Frame />
          <ImageField.Actions>
            {({isEmpty, isUploading}) => (
              <>
                <ImageField.CancelButton />
                <ImageField.RemoveButton />
                {!isUploading && (
                  <button type="button" onClick={onPick}>
                    Choose from library
                  </button>
                )}
                {!isEmpty && <button type="button">Edit</button>}
              </>
            )}
          </ImageField.Actions>
          <ImageField.Meta />
        </Controlled>,
      );
      const actions = document.querySelector('[data-slot="image-field-actions"]');

      expect(actions).toHaveAttribute("data-empty", "true");
      expect(actions).not.toHaveAttribute("data-uploading");
      expect(screen.getByRole("button", {name: "Drop, paste or click to upload"})).toBeEnabled();
      expect(screen.queryByRole("button", {name: "Edit"})).not.toBeInTheDocument();
      expect(screen.queryByRole("button", {name: "Remove image"})).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", {name: "Choose from library"}));
      expect(onPick).toHaveBeenCalledOnce();

      upload();
      await waitFor(() => expect(pending.calls).toHaveLength(1));
      expect(screen.getByRole("button", {name: "Cancel upload"})).toBeEnabled();
      expect(screen.queryByRole("button", {name: "Choose from library"})).not.toBeInTheDocument();
      expect(actions).toHaveAttribute("data-uploading", "true");

      await act(async () => pending.calls[0]!.resolve("/new.png"));
      expect(screen.getByRole("button", {name: "Choose from library"})).toBeEnabled();
      expect(screen.getByRole("button", {name: "Edit"})).toBeEnabled();
      expect(screen.getByRole("button", {name: "Remove image"})).toBeEnabled();
      expect(actions).not.toHaveAttribute("data-empty");
    },
  );

  it.each(["banner", "tile", "inline"] as const)(
    "renders the default %s toolbar beside the frame and empty when nothing applies",
    (layout) => {
      render(<ImageField {...props} layout={layout} />);
      const actions = document.querySelector('[data-slot="image-field-actions"]');

      expect(actions).toBeEmptyDOMElement();
      expect(frame()).not.toContainElement(actions as HTMLElement);
    },
  );

  it("supports a composed Label as the field name and Frame children as empty-frame content", () => {
    const onChange = vi.fn();
    const {"aria-label": _, ...rest} = props;
    const field = (value: string) => (
      <ImageField {...rest} value={value} onChange={onChange}>
        <Label>Banner</Label>
        <ImageField.Frame>
          <img alt="Fallback" src="/fallback.png" />
        </ImageField.Frame>
        <ImageField.Actions />
        <ImageField.Meta />
      </ImageField>
    );
    const view = render(field(""));
    const group = screen.getByRole("group", {name: "Banner"});
    const label = document.getElementById(group.getAttribute("aria-labelledby")!)!;

    expect(label).toHaveTextContent("Banner");
    expect(label).toHaveAttribute("data-slot", "label");
    expect(screen.getByRole("button", {name: /Banner/})).toBeInTheDocument();
    expect(document.querySelector('[data-slot="drop-zone-area"]')).not.toHaveAttribute(
      "aria-label",
    );
    expect(screen.getByRole("img", {name: "Fallback"})).toBeInTheDocument();
    expect(
      screen.getByRole("button", {name: "Drop, paste or click to upload"}),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    view.rerender(field("/banner.png"));
    expect(screen.getByRole("img", {name: "Banner"})).toBeInTheDocument();
    expect(screen.queryByRole("img", {name: "Fallback"})).not.toBeInTheDocument();
  });

  it("supports naming the field with aria-label and no visible Label", () => {
    render(<ImageField {...props} value="/banner.png" />);

    expect(screen.getByRole("group", {name: "Banner"})).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("button", {name: /Banner/})).toBeInTheDocument();
    expect(screen.getByRole("img", {name: "Banner"})).toBeInTheDocument();
    expect(document.querySelector('[data-slot="label"]')).not.toBeInTheDocument();
  });

  it("supports composing Description and FieldError in Meta beside upload errors", async () => {
    const pending = stub();
    const user = setupUser();

    render(
      <ImageField {...props} {...pending} isInvalid>
        <ImageField.Frame />
        <ImageField.Actions />
        <ImageField.Meta>
          <Description>Falls back to English</Description>
          <FieldError>Required</FieldError>
        </ImageField.Meta>
      </ImageField>,
    );
    const group = screen.getByRole("group", {name: "Banner"});
    const meta = document.querySelector('[data-slot="image-field-meta"]')!;

    expect(group).toHaveAttribute("data-invalid", "true");
    expect(frame()).toHaveAttribute("data-invalid", "true");
    expect(group.getAttribute("aria-describedby")).toBe(meta.id);
    expect(meta).toContainElement(screen.getByText("Falls back to English"));
    expect(meta).toContainElement(screen.getByText("Required"));
    upload(new File(["text"], "bad.txt", {type: "text/plain"}));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Unsupported image format"),
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    upload();
    await act(async () => pending.calls[0]!.reject(new Error("server failed")));
    expect(screen.getByRole("alert")).toHaveTextContent("Upload failed");
    await user.click(screen.getByRole("button", {name: "Retry upload"}));
    await user.click(screen.getByRole("button", {name: "Cancel upload"}));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("supports composing guidance parts that render only while they apply", () => {
    const view = render(
      <ImageField {...props} aspectRatio={2} recommendedWidth={1600}>
        <ImageField.Frame />
        <ImageField.Meta>
          <ImageField.Warning />
        </ImageField.Meta>
      </ImageField>,
    );

    expect(document.querySelector('[data-slot="image-field-meta"]')).toBeEmptyDOMElement();
    view.rerender(
      <ImageField {...props} aspectRatio={2} recommendedWidth={1600}>
        <ImageField.Frame />
        <ImageField.Meta>
          <ImageField.Size />
        </ImageField.Meta>
      </ImageField>,
    );
    expect(screen.getByText("Recommended 1600 × 800")).toHaveAttribute(
      "data-slot",
      "image-field-size",
    );
  });

  it("renders the upload failure from getUploadErrorMessage and falls back to labels.uploadFailed", async () => {
    const pending = stub();
    const user = setupUser();
    const getUploadErrorMessage = (error: unknown) =>
      error instanceof Error && error.message === "UPLOAD_FILE_TYPE_INVALID"
        ? "The server could not read this image"
        : undefined;

    render(<ImageField {...props} {...pending} getUploadErrorMessage={getUploadErrorMessage} />);
    upload();
    await act(async () => pending.calls[0]!.reject(new Error("UPLOAD_FILE_TYPE_INVALID")));
    expect(screen.getByRole("alert")).toHaveTextContent("The server could not read this image");
    await user.click(screen.getByRole("button", {name: "Retry upload"}));
    await act(async () => pending.calls[1]!.reject(new Error("UNKNOWN")));
    expect(screen.getByRole("alert")).toHaveTextContent("Upload failed");
  });

  it("calls onChange with a path only after a successful upload and with empty string on removal", async () => {
    const pending = stub();
    const onChange = vi.fn();
    const user = setupUser();

    render(<Controlled {...props} {...pending} onChange={onChange} />);
    upload();
    await waitFor(() => expect(pending.calls).toHaveLength(1));
    // Until onUpload reports progress it is unknown, not 0%.
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    act(() => pending.calls[0]!.context.onProgress(0.64));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "64");
    expect(screen.getByText("Uploading 64%")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => pending.calls[0]!.resolve("/stored.png"));
    expect(onChange).toHaveBeenLastCalledWith("/stored.png");
    expect(screen.getByRole("img", {name: "Banner"})).toHaveAttribute("src", "/stored.png");
    await user.click(screen.getByRole("button", {name: "Remove image"}));
    expect(onChange).toHaveBeenLastCalledWith("");
    expect(frame()).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", {name: "Drop, paste or click to upload"})).toHaveFocus(),
    );
  });

  it.each(["banner", "tile", "inline"] as const)(
    "preserves the original value and toolbar on failure and retries in %s",
    async (layout) => {
      const pending = stub();
      const onChange = vi.fn();
      const user = setupUser();

      render(
        <ImageField {...props} {...pending} layout={layout} value="/old.png" onChange={onChange} />,
      );
      upload();
      await act(async () => pending.calls[0]!.reject(new Error("server failed")));
      expect(screen.getByRole("alert")).toHaveTextContent("Upload failed");
      expect(screen.getByRole("alert").closest('[data-slot="image-field-meta"]')).not.toBeNull();
      expect(
        screen
          .getByRole("button", {name: "Retry upload"})
          .closest('[data-slot="image-field-actions"]'),
      ).not.toBeNull();
      expect(screen.getByRole("button", {name: "Replace image"})).toBeEnabled();
      expect(screen.getByRole("button", {name: "Remove image"})).toBeEnabled();
      expect(onChange).not.toHaveBeenCalled();
      await user.click(screen.getByRole("button", {name: "Retry upload"}));
      expect(pending.calls).toHaveLength(2);
      await act(async () => pending.calls[1]!.reject(new Error("again")));
      upload(png("replacement.png"));
      await waitFor(() => expect(pending.calls).toHaveLength(3));
      await act(async () => pending.calls[2]!.resolve("/new.png"));
      expect(onChange).toHaveBeenCalledExactlyOnceWith("/new.png");
      // A controlled parent may decline the requested change.
      expect(screen.getByRole("img", {name: "Banner"})).toHaveAttribute("src", "/old.png");
      expect(handoff()).toBeNull();
    },
  );

  it.each([
    ["load", null],
    ["error", "Image could not be loaded"],
  ] as const)(
    "keeps the uploaded file on screen until the stored image fires %s",
    async (event, message) => {
      const pending = stub();

      render(<Controlled {...props} {...pending} />);
      upload();
      await waitFor(() => expect(pending.calls).toHaveLength(1));
      await act(async () => pending.calls[0]!.resolve("/stored.png"));
      const image = screen.getByRole("img", {name: "Banner"});

      expect(image).toHaveAttribute("src", "/stored.png");
      expect(handoff()).toHaveAttribute("src", expect.stringMatching(/^blob:/));
      expect(handoff()).toHaveAttribute("aria-hidden", "true");
      fireEvent[event](image);
      expect(handoff()).toBeNull();
      if (message) expect(screen.getByText(message)).toBeInTheDocument();
    },
  );

  it("aborts cancellation and ignores late resolution without changing the old value", async () => {
    const pending = stub();
    const onChange = vi.fn();
    const user = setupUser();

    render(<ImageField {...props} {...pending} value="/old.png" onChange={onChange} />);
    upload();
    await user.click(screen.getByRole("button", {name: "Cancel upload"}));
    expect(pending.calls[0]!.context.signal.aborted).toBe(true);
    await waitFor(() => expect(screen.getByRole("button", {name: "Replace image"})).toHaveFocus());
    await act(async () => pending.calls[0]!.resolve("/late.png"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("img", {name: "Banner"})).toHaveAttribute("src", "/old.png");
  });

  it("cancels pending uploads on external reset and unmount", async () => {
    const pending = stub();
    const onChange = vi.fn();
    const view = render(
      <ImageField {...props} {...pending} value="/first.png" onChange={onChange} />,
    );

    upload();
    view.rerender(<ImageField {...props} {...pending} value="/reset.png" onChange={onChange} />);
    expect(pending.calls[0]!.context.signal.aborted).toBe(true);
    await act(async () => pending.calls[0]!.resolve("/stale.png"));
    expect(onChange).not.toHaveBeenCalled();
    upload();
    view.unmount();
    expect(pending.calls[1]!.context.signal.aborted).toBe(true);
  });

  it("validates replacement format and size without altering the saved value", async () => {
    const onUpload = vi.fn();
    const onChange = vi.fn();

    render(
      <ImageField
        {...props}
        maxFileSize={2}
        value="/old.png"
        onChange={onChange}
        onUpload={onUpload}
      />,
    );
    upload(new File(["pdf"], "bad.pdf", {type: "application/pdf"}));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Unsupported image format"),
    );
    upload();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Image exceeds the size limit"),
    );
    expect(onUpload).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(frame()).toBeInTheDocument();
  });

  it("renders ratio and resolution warnings and keeps a broken URL removable", async () => {
    const user = setupUser();
    const onChange = vi.fn();
    const resolveSrc = (path: string) => `/cdn${path}`;
    const view = render(
      <ImageField
        {...props}
        aspectRatio={16 / 5}
        recommendedWidth={1600}
        resolveSrc={resolveSrc}
        value="/square.png"
        onChange={onChange}
      />,
    );
    const image = screen.getByRole("img", {name: "Banner"});

    expect(image).toHaveAttribute("src", "/cdn/square.png");
    Object.defineProperties(image, {naturalHeight: {value: 512}, naturalWidth: {value: 512}});
    fireEvent.load(image);
    expect(screen.getByText(/Image proportions differ/)).toBeInTheDocument();
    view.rerender(
      <ImageField
        {...props}
        aspectRatio={1}
        recommendedWidth={1600}
        resolveSrc={resolveSrc}
        value="/square.png"
        onChange={onChange}
      />,
    );
    expect(screen.getByText(/Image width is below/)).toBeInTheDocument();
    view.rerender(
      <ImageField
        {...props}
        aspectRatio={1}
        resolveSrc={resolveSrc}
        value="/square.png"
        onChange={onChange}
      />,
    );
    expect(screen.getByText("512 × 512 · PNG")).toBeInTheDocument();
    fireEvent.error(image);
    expect(screen.getByText("Image could not be loaded")).toBeInTheDocument();
    expect(screen.getByText("/square.png")).toBeInTheDocument();
    expect(frame()).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Replace image"})).toBeEnabled();
    await user.click(screen.getByRole("button", {name: "Remove image"}));
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("supports compound parts, translations, refs, and field errors", () => {
    const ref = {current: null as HTMLDivElement | null};

    render(
      <ImageField.Root
        {...props}
        ref={ref}
        isInvalid
        aria-describedby="help"
        className="custom-field"
        labels={{remove: "删除", replace: "替换"}}
        style={{width: 320}}
        title="Custom root"
        value="/old.png"
      >
        <ImageField.Frame />
        <ImageField.Actions />
        <ImageField.Meta>
          <FieldError>Required</FieldError>
          Custom metadata
        </ImageField.Meta>
      </ImageField.Root>,
    );
    expect(ref.current).toHaveAttribute("data-slot", "image-field");
    expect(ref.current).toHaveClass("custom-field");
    expect(ref.current).toHaveStyle({width: "320px"});
    expect(ref.current).toHaveAttribute("title", "Custom root");
    expect(ref.current).not.toHaveAttribute("value");
    expect(ref.current).not.toHaveAttribute("accept");
    expect(screen.getByRole("group", {name: "Banner"})).toBe(ref.current);
    const meta = screen.getByText("Required").closest('[data-slot="image-field-meta"]')!;

    expect(ref.current).toHaveAttribute("data-invalid", "true");
    expect(ref.current?.getAttribute("aria-describedby")?.split(" ")).toEqual(["help", meta.id]);
    expect(screen.getByRole("button", {name: "替换"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "删除"})).toBeInTheDocument();
    expect(screen.getByText("Required")).toHaveAttribute("data-slot", "field-error");
    expect(screen.getByText("Custom metadata")).toBeInTheDocument();
  });

  it("prevents uploading and editing when disabled and never submits the form", async () => {
    const pending = stub();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const view = render(
      <form onSubmit={onSubmit}>
        <ImageField {...props} {...pending} isDisabled value="/old.png" />
      </form>,
    );

    expect(document.querySelector('[data-slot="drop-zone-area"]')).toHaveAttribute("inert");
    expect(screen.getByRole("button", {name: "Replace image"})).toBeDisabled();
    expect(document.querySelector('[data-slot="image-field-actions"]')).toHaveAttribute(
      "data-disabled",
      "true",
    );
    upload();
    expect(pending.onUpload).not.toHaveBeenCalled();
    view.rerender(
      <form onSubmit={onSubmit}>
        <ImageField {...props} {...pending} value="/old.png" />
      </form>,
    );
    const user = setupUser();

    await user.click(screen.getByRole("button", {name: "Remove image"}));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

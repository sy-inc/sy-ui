import type {
  DropZoneFile,
  DropZoneUploadContext,
  UseDropZoneStateProps,
  UseDropZoneStateResult,
} from "@/components/drop-zone";

import {act, render, screen, setupUser, waitFor} from "@sy-inc/testing/helpers";
import {useEffect, useState} from "react";

import {DropZone, formatFileType, useDropZoneState} from "@/components/drop-zone";

import {createDirectoryDropItem, createDropEvent, createFileDropItem} from "./drop-items";
import {UploadDropZone} from "./fixtures";

const png = (name: string, size = 8) => new File([new Uint8Array(size)], name, {type: "image/png"});
const pdf = (name: string, size = 3) =>
  new File(["x".repeat(size)], name, {type: "application/pdf"});

const rows = () => document.querySelectorAll<HTMLElement>('[data-slot="drop-zone-row"]');
const capsules = () => document.querySelectorAll<HTMLElement>('[data-slot="drop-zone-capsule"]');

const stateProbe = () => {
  let state: UseDropZoneStateResult | undefined;

  return {
    get state() {
      return state!;
    },
    onState: (next: UseDropZoneStateResult) => {
      state = next;
    },
  };
};

const add = async (state: UseDropZoneStateResult, files: File[]) => {
  await act(async () => state.addFiles(files));
};

const StateHarness = ({
  onState,
  ...props
}: UseDropZoneStateProps & {onState: (state: UseDropZoneStateResult) => void}) => {
  const state = useDropZoneState(props);

  useEffect(() => onState(state), [onState, state]);

  return null;
};

const ControlledStateHarness = ({
  onChange,
  onState,
  ...props
}: UseDropZoneStateProps & {onState: (state: UseDropZoneStateResult) => void}) => {
  const [fileList, setFileList] = useState<DropZoneFile[]>([]);
  const state = useDropZoneState({
    ...props,
    fileList,
    onChange: (next) => {
      onChange?.(next);
      setFileList(next);
    },
  });

  useEffect(() => onState(state), [onState, state]);

  return null;
};

const createUploadStub = () => {
  const calls: {
    context: DropZoneUploadContext;
    file: File;
    reject: (error: unknown) => void;
    resolve: (result: unknown) => void;
  }[] = [];

  return {
    calls,
    onUpload: (file: File, context: DropZoneUploadContext) =>
      new Promise<unknown>((resolve, reject) => calls.push({context, file, reject, resolve})),
  };
};

describe("DropZone", () => {
  it("exposes the final Area, Slots, and square trigger", () => {
    render(<UploadDropZone />);

    expect(screen.getByLabelText("Upload files")).toBeInTheDocument();
    expect(document.querySelector('[data-slot="drop-zone-slots"]')).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Select files"})).toBeInTheDocument();
  });

  it("prefers filename extensions for format labels", () => {
    expect(
      formatFileType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "proposal.docx",
      ),
    ).toBe("DOCX");
  });

  describe("rows and removal", () => {
    it("renders one card per file plus a trailing trigger row while there is room", async () => {
      const probe = stateProbe();

      render(<UploadDropZone maxFiles={3} onState={probe.onState} />);

      await add(probe.state, [pdf("one.pdf"), pdf("two.pdf")]);

      expect(rows()).toHaveLength(3);
      expect(capsules()[2]).toHaveAttribute("data-empty", "true");
      expect(screen.getByText("one.pdf")).toBeInTheDocument();
      expect(screen.getByText("two.pdf")).toBeInTheDocument();
    });

    it("removes the trailing empty row once the list is full", async () => {
      const probe = stateProbe();

      render(<UploadDropZone maxFiles={2} onState={probe.onState} />);

      await add(probe.state, [pdf("one.pdf"), pdf("two.pdf")]);

      expect(probe.state.isFull).toBe(true);
      expect(rows()).toHaveLength(2);
      expect([...capsules()].some((capsule) => capsule.getAttribute("data-empty") === "true")).toBe(
        false,
      );
    });

    it("brings the upload trigger back after removing the only card", async () => {
      const probe = stateProbe();

      render(<UploadDropZone maxFiles={1} onState={probe.onState} />);
      await add(probe.state, [pdf("one.pdf")]);

      await act(async () => probe.state.remove(probe.state.files[0]!.id));

      expect(rows()).toHaveLength(1);
      expect(document.querySelector('[data-slot="drop-zone-trigger"]')).toBeInTheDocument();
    });

    it("removes a middle card, keeping the trailing empty row", async () => {
      const probe = stateProbe();

      render(<UploadDropZone maxFiles={3} onState={probe.onState} />);
      await add(probe.state, [pdf("one.pdf"), pdf("two.pdf")]);
      const firstId = probe.state.files[0]!.id;

      await act(async () => probe.state.remove(firstId));

      expect(screen.queryByText("one.pdf")).not.toBeInTheDocument();
      expect(rows()).toHaveLength(2);
      expect(screen.getByText("two.pdf")).toBeInTheDocument();
      expect([...capsules()].some((capsule) => capsule.getAttribute("data-empty") === "true")).toBe(
        true,
      );
    });

    it("plays a shrink-to-square exit before actually removing a clicked card", async () => {
      const onChange = vi.fn();
      const onRemove = vi.fn();
      const probe = stateProbe();
      const user = setupUser();

      render(<UploadDropZone onChange={onChange} onRemove={onRemove} onState={probe.onState} />);
      await add(probe.state, [pdf("one.pdf")]);
      onChange.mockClear();

      await user.click(screen.getByRole("button", {name: "Remove one.pdf"}));

      // Right after the click, only the exit transition has started — the file (and the
      // callbacks it drives) hasn't actually left yet.
      expect(probe.state.files).toHaveLength(1);
      expect(rows()[0]).toHaveAttribute("data-leaving", "true");
      expect(onRemove).not.toHaveBeenCalled();

      await waitFor(() => expect(probe.state.files).toHaveLength(0));
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it("moves focus to the next remove trigger after removing a card", async () => {
      const probe = stateProbe();
      const user = setupUser();

      render(<UploadDropZone maxFiles={3} onState={probe.onState} />);
      await add(probe.state, [pdf("one.pdf"), pdf("two.pdf")]);

      await user.click(screen.getByRole("button", {name: "Remove one.pdf"}));

      await waitFor(() =>
        expect(screen.getByRole("button", {name: "Remove two.pdf"})).toHaveFocus(),
      );
    });

    it("moves focus to the upload trigger after removing the last remaining card", async () => {
      const probe = stateProbe();
      const user = setupUser();

      render(<UploadDropZone maxFiles={1} onState={probe.onState} />);
      await add(probe.state, [pdf("one.pdf")]);

      await user.click(screen.getByRole("button", {name: "Remove one.pdf"}));

      await waitFor(() => expect(screen.getByRole("button", {name: "Select files"})).toHaveFocus());
    });

    it("calls removal callbacks immediately and ignores a second remove", async () => {
      const onChange = vi.fn();
      const onRemove = vi.fn();
      const probe = stateProbe();

      render(<StateHarness onChange={onChange} onRemove={onRemove} onState={probe.onState} />);
      await add(probe.state, [pdf("one.pdf")]);
      onChange.mockClear();
      const id = probe.state.files[0]!.id;

      await act(async () => probe.state.remove(id));
      await act(async () => probe.state.remove(id));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith([]);
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenLastCalledWith(expect.objectContaining({name: "one.pdf"}), []);
    });

    it("updates a controlled parent before the exiting row is finalized", async () => {
      const onChange = vi.fn();
      const probe = stateProbe();

      render(<ControlledStateHarness onChange={onChange} onState={probe.onState} />);
      await add(probe.state, [pdf("one.pdf")]);
      onChange.mockClear();

      await act(async () => probe.state.remove(probe.state.files[0]!.id));

      expect(onChange).toHaveBeenCalledWith([]);
      expect(probe.state.files).toEqual([]);
    });
  });

  describe("uploads, validation, and file sources", () => {
    it("uploads, reports progress, and announces success", async () => {
      const upload = createUploadStub();
      const probe = stateProbe();

      render(<UploadDropZone onState={probe.onState} onUpload={upload.onUpload} />);
      await add(probe.state, [png("photo.png")]);

      await act(async () => upload.calls[0]!.context.onProgress(0.5));
      await waitFor(() =>
        expect(screen.getByRole("progressbar", {name: "Uploading photo.png"})).toHaveAttribute(
          "aria-valuenow",
          "50",
        ),
      );
      await act(async () => upload.calls[0]!.resolve({id: "server-file"}));

      await waitFor(() =>
        expect(probe.state.files[0]).toMatchObject({progress: 1, status: "complete"}),
      );
      expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent(
        "photo.png uploaded.",
      );
    });

    it("keeps upload failure on the card while validation failure only invalidates the empty capsule", async () => {
      const upload = createUploadStub();
      const probe = stateProbe();

      render(
        <UploadDropZone
          accept="image/*"
          maxFiles={2}
          onState={probe.onState}
          onUpload={upload.onUpload}
        />,
      );
      await add(probe.state, [png("photo.png")]);
      await act(async () => upload.calls[0]!.reject(new Error("network down")));
      await waitFor(() => expect(probe.state.files[0]).toHaveProperty("status", "failed"));
      await add(probe.state, [pdf("proposal.pdf")]);

      expect(screen.getByText("network down")).toBeInTheDocument();
      expect(screen.getByText("Only IMAGE files are allowed.")).toBeInTheDocument();
      const [cardCapsule, emptyCapsule] = capsules();

      expect(cardCapsule).not.toHaveAttribute("data-invalid");
      expect(cardCapsule?.querySelector('[data-slot="drop-zone-file-item"]')).toHaveAttribute(
        "data-status",
        "failed",
      );
      expect(emptyCapsule).toHaveAttribute("data-invalid", "true");
    });

    it("expands directories depth first and rejects overflow", async () => {
      const nested = createDirectoryDropItem("nested", [createFileDropItem(png("deep.png"))]);
      const folder = createDirectoryDropItem("folder", [
        createFileDropItem(png("inner.png")),
        nested,
      ]);
      const probe = stateProbe();

      render(<UploadDropZone maxFiles={3} onState={probe.onState} />);

      await act(async () =>
        probe.state.addFiles(createDropEvent([createFileDropItem(png("top.png")), folder])),
      );

      expect(probe.state.files.map((item) => item.name)).toEqual([
        "top.png",
        "inner.png",
        "deep.png",
      ]);
      expect(probe.state.isFull).toBe(true);
    });

    it("rejects a drop or paste onto an already-full area via validation, not via isDisabled", async () => {
      const probe = stateProbe();

      render(<UploadDropZone maxFiles={1} onState={probe.onState} />);
      await add(probe.state, [pdf("one.pdf")]);
      expect(probe.state.isFull).toBe(true);

      await act(async () =>
        probe.state.getAreaProps().onDrop(createDropEvent([createFileDropItem(pdf("two.pdf"))])),
      );

      expect(probe.state.files.map((item) => item.name)).toEqual(["one.pdf"]);
      expect(probe.state.validationError).toMatchObject({code: "tooManyFiles"});
      expect(probe.state.getAreaProps().isDisabled).toBe(false);
    });

    it("does not offer retry for restored files and uses their server preview URL", () => {
      const restored: DropZoneFile = {
        id: "restored",
        name: "server.png",
        previewUrl: "https://cdn.example.test/server.png",
        progress: 1,
        size: 10,
        status: "failed",
        type: "image/png",
      };

      render(<UploadDropZone defaultFileList={[restored]} />);

      expect(screen.queryByRole("button", {name: "Retry"})).not.toBeInTheDocument();
      expect(screen.getByRole("button", {name: "Toggle preview"})).toBeInTheDocument();
      expect(
        document.querySelector('img[src="https://cdn.example.test/server.png"]'),
      ).toBeInTheDocument();
    });

    it("creates local image preview URLs and releases them on removal or unmount", async () => {
      const createObjectURL = vi.spyOn(URL, "createObjectURL").mockClear();
      const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockClear();
      const probe = stateProbe();
      const {unmount} = render(<StateHarness maxFiles={2} onState={probe.onState} />);

      await add(probe.state, [png("local.png")]);

      await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
      const url = createObjectURL.mock.results[0]!.value as string;
      const id = probe.state.files[0]!.id;

      expect(probe.state.previews[id]?.url).toBe(url);

      await act(async () => probe.state.remove(id));
      expect(revokeObjectURL).toHaveBeenCalledWith(url);
      expect(probe.state.previews[id]).toBeUndefined();

      await add(probe.state, [png("second.png")]);
      unmount();
      expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  describe("prop getters and composed UI", () => {
    it("wires trigger props, accepts selected files, and preserves the caller callback order", async () => {
      const onSelect = vi.fn();
      const probe = stateProbe();

      render(<UploadDropZone accept="image/*,.pdf" maxFiles={2} onState={probe.onState} />);
      const props = probe.state.getTriggerProps({onSelect});

      expect(props).toMatchObject({acceptedFileTypes: ["image/*", ".pdf"], allowsMultiple: true});
      await act(async () => props.onSelect([png("one.png")] as unknown as FileList));

      expect(probe.state.files.map((item) => item.name)).toEqual(["one.png"]);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("disables the trigger through getTriggerProps once the list is full", async () => {
      const probe = stateProbe();

      render(<UploadDropZone maxFiles={1} onState={probe.onState} />);

      expect(probe.state.getTriggerProps().isDisabled).toBe(false);
      await add(probe.state, [pdf("one.pdf")]);

      expect(probe.state.getTriggerProps().isDisabled).toBe(true);
    });

    it("makes the rendered Area inert when disabled and disables every contained action", () => {
      render(<UploadDropZone isDisabled />);

      expect(document.querySelector('[data-slot="drop-zone-area"]')).toHaveAttribute("inert");
      expect(screen.getByRole("button", {name: "Select files"})).toBeDisabled();
    });

    it("makes Area itself inert when isDisabled is passed directly", () => {
      render(
        <DropZone>
          <DropZone.Area isDisabled aria-label="Upload files" />
        </DropZone>,
      );

      expect(document.querySelector('[data-slot="drop-zone-area"]')).toHaveAttribute("inert");
    });

    it("returns only the documented Area getter props", () => {
      const probe = stateProbe();

      render(<StateHarness onState={probe.onState} />);

      expect(Object.keys(probe.state.getAreaProps()).sort()).toEqual([
        "announcement",
        "isDisabled",
        "onDrop",
      ]);
    });

    it("does not submit a surrounding form when trigger, remove, or clear controls are pressed", async () => {
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      const user = setupUser();
      const restored: DropZoneFile = {
        id: "one",
        name: "one.pdf",
        progress: 0,
        size: 1,
        status: "idle",
        type: "application/pdf",
      };

      render(
        <form onSubmit={onSubmit}>
          <UploadDropZone defaultFileList={[restored]} maxFiles={2} />
        </form>,
      );

      await user.click(screen.getByRole("button", {name: "Select files"}));
      await user.click(screen.getByRole("button", {name: "Remove one.pdf"}));
      await user.click(screen.getByRole("button", {name: "Clear"}));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("adds Area drops before invoking the supplied callback, keeping a full Area's cards interactive", async () => {
      const onDrop = vi.fn();
      const probe = stateProbe();

      render(<UploadDropZone maxFiles={1} onState={probe.onState} />);
      const area = probe.state.getAreaProps({onDrop});

      await act(async () => area.onDrop(createDropEvent([createFileDropItem(png("one.png"))])));
      await waitFor(() => expect(probe.state.isFull).toBe(true));
      // isDisabled must not fold in isFull: it also drives the Area's `inert` attribute,
      // which would cascade to every card and permanently block removal once full.
      expect(probe.state.getAreaProps().isDisabled).toBe(false);
      expect(onDrop).toHaveBeenCalledTimes(1);
    });
  });

  it("does not make arbitrary Area clicks open the picker", async () => {
    const user = setupUser();

    render(
      <DropZone>
        <DropZone.Area aria-label="Upload files">
          <span>Area copy</span>
          <DropZone.Trigger />
        </DropZone.Area>
      </DropZone>,
    );
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const click = vi.spyOn(input, "click");

    await user.click(screen.getByText("Area copy"));
    expect(click).not.toHaveBeenCalled();
  });
});

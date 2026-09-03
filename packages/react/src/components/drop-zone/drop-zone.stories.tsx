import type {DropZoneErrorMessages, DropZoneFile, DropZoneUploadContext} from "./index";
import type {Meta, StoryObj} from "@storybook/react";
import type {ReactNode} from "react";

import React, {useEffect, useState} from "react";

import {Description} from "../description";
import {ErrorMessage} from "../error-message";
import {Label} from "../label";

import {DropZone, useDropZoneState} from "./index";

const meta: Meta<typeof DropZone> = {
  component: DropZone,
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
  parameters: {layout: "centered"},
  tags: ["autodocs"],
  title: "Components/Forms/DropZone",
};

export default meta;
type Story = StoryObj<typeof DropZone>;

const fakeUpload = (file: File, {onProgress, signal}: DropZoneUploadContext) =>
  new Promise<{url: string}>((resolve, reject) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += 0.2;

      if (progress < 1) {
        onProgress(progress);

        return;
      }

      clearInterval(timer);
      if (file.name.includes("fail")) reject(new Error("The server rejected the upload."));
      else resolve({url: `https://files.example.com/${file.name}`});
    }, 400);

    signal.addEventListener("abort", () => clearInterval(timer));
  });

interface UploadDropZoneProps {
  accept?: string | string[];
  description: string;
  errorMessage?: DropZoneErrorMessages;
  isDisabled?: boolean;
  label?: string;
  maxFiles?: number;
  maxFileSize?: number;
  onUpload?: (file: File, context: DropZoneUploadContext) => Promise<{url: string}>;
  variant?: "bordered" | "faded" | "flat";
}

const UploadDropZone = ({
  description,
  label = "Attachments",
  variant,
  ...props
}: UploadDropZoneProps) => {
  const state = useDropZoneState<{url: string}>(props);

  return (
    <DropZone variant={variant}>
      <Label>{label}</Label>
      <Description>{description}</Description>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
      {!!state.validationError && <ErrorMessage>{state.validationError.message}</ErrorMessage>}
      {state.files.length > 0 && <DropZone.ClearTrigger onPress={state.clear} />}
    </DropZone>
  );
};

export const Default: Story = {
  render: () => <UploadDropZone description="PDF, DOCX, PNG, or JPG up to 10 MB." />,
};

export const MultipleFiles: Story = {
  render: () => (
    <UploadDropZone
      description="Add up to three files. A new square slot stays at the end until the limit is reached."
      maxFiles={3}
    />
  ),
};

export const UploadProgressAndRetry: Story = {
  render: () => (
    <UploadDropZone
      accept="image/*,.pdf"
      description="Uploads run concurrently. Name a file ‘fail’ to see the inline error and retry action."
      maxFiles={3}
      maxFileSize={5 * 1024 * 1024}
      onUpload={fakeUpload}
    />
  ),
};

export const ImagePreview: Story = {
  render: () => (
    <UploadDropZone
      accept="image/*"
      description="Select an image, then use the eye button on its card to expand the preview."
      maxFiles={3}
    />
  ),
};

export const RestoredFile: Story = {
  render: () => {
    const restored: DropZoneFile = {
      id: "restored-cover",
      name: "cover.png",
      previewUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=640&q=80",
      progress: 1,
      size: 2_517_000,
      status: "complete",
      type: "image/png",
    };
    const state = useDropZoneState({defaultFileList: [restored], maxFiles: 3});

    return (
      <DropZone>
        <Label>Restored attachment</Label>
        <Description>This card has no local File; its preview comes from previewUrl.</Description>
        <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
          <DropZone.Slots state={state} />
        </DropZone.Area>
      </DropZone>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [fileList, setFileList] = useState<DropZoneFile[]>([]);
    const state = useDropZoneState({fileList, maxFiles: 3, onChange: setFileList});

    return (
      <DropZone>
        <Label>Controlled attachments</Label>
        <Description>{fileList.length} of 3 selected.</Description>
        <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
          <DropZone.Slots state={state} />
        </DropZone.Area>
        {fileList.length > 0 && <DropZone.ClearTrigger onPress={state.clear} />}
      </DropZone>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <UploadDropZone
      isDisabled
      description="The area, slot, preview, retry, and remove actions are unavailable."
      label="Uploads are unavailable"
    />
  ),
};

export const ValidationError: Story = {
  render: () => (
    <UploadDropZone
      accept={["image/png", ".pdf"]}
      description="PNG or PDF, up to two files, 5 MB each. Try an unsupported file to see the error below the area."
      maxFiles={2}
      maxFileSize={5 * 1024 * 1024}
      errorMessage={{
        fileTooLarge: "Each file must stay under 5 MB.",
        invalidFileType: "Only PNG images or PDF documents are accepted.",
        tooManyFiles: "Maximum 2 files per upload.",
      }}
    />
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <UploadDropZone description="The default dashed surface." label="bordered" />
      <UploadDropZone
        description="A filled surface without the border."
        label="flat"
        variant="flat"
      />
      <UploadDropZone description="A softened border and surface." label="faded" variant="faded" />
    </div>
  ),
};

export const ClearAll: Story = {
  render: () => {
    const state = useDropZoneState({maxFiles: 3});

    return (
      <DropZone>
        <Label>Clearable attachments</Label>
        <Description>Choose several files, then remove them together.</Description>
        <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
          <DropZone.Slots state={state} />
        </DropZone.Area>
        {state.files.length > 0 && <DropZone.ClearTrigger onPress={state.clear} />}
      </DropZone>
    );
  },
};

const SlotState = ({children, label}: {children: ReactNode; label: string}) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-medium text-muted">{label}</p>
    {children}
  </div>
);

const EmptySlot = () => {
  const state = useDropZoneState({maxFiles: 1});

  return (
    <DropZone>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
};

const InvalidEmptySlot = () => {
  const state = useDropZoneState({accept: "image/*", maxFiles: 1});

  // Rejects once on mount so the trailing empty capsule renders its `data-invalid` state.
  useEffect(() => {
    void state.addFiles([new File(["notes"], "notes.txt", {type: "text/plain"})]);
  }, []);

  return (
    <DropZone>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
};

const FileSlot = ({file}: {file: DropZoneFile}) => {
  const state = useDropZoneState({defaultFileList: [file], maxFiles: 1});

  return (
    <DropZone>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
};

const failedFile = new File(["invoice"], "invoice.pdf", {type: "application/pdf"});

const PreviewExpandedSlot = () => (
  <DropZone>
    <DropZone.Area aria-label="Upload files">
      <div className="drop-zone__slots">
        <div className="drop-zone__row">
          <div className="drop-zone__capsule" data-empty="false">
            <DropZone.FileItem defaultExpanded status="complete">
              <DropZone.FileHeader>
                <DropZone.FileFormatIcon format="PNG" />
                <DropZone.FileInfo>
                  <DropZone.FileName>sunset.png</DropZone.FileName>
                  <DropZone.FileMeta>1.8 MB</DropZone.FileMeta>
                </DropZone.FileInfo>
                <DropZone.PreviewTrigger />
                <DropZone.FileRemoveTrigger aria-label="Remove sunset.png" />
              </DropZone.FileHeader>
              <DropZone.PreviewPanel
                alt="sunset.png"
                src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=640&q=80"
              />
            </DropZone.FileItem>
          </div>
        </div>
      </div>
    </DropZone.Area>
  </DropZone>
);

const LeavingSlot = () => {
  const state = useDropZoneState({
    defaultFileList: [
      {
        id: "state-leaving",
        name: "old-draft.docx",
        progress: 1,
        size: 82_000,
        status: "complete",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    ],
    maxFiles: 1,
  });

  return (
    <DropZone>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
};

export const SlotStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <SlotState label="Empty">
        <EmptySlot />
      </SlotState>
      <SlotState label="Empty, invalid">
        <InvalidEmptySlot />
      </SlotState>
      <SlotState label="Idle">
        <FileSlot
          file={{
            id: "state-idle",
            name: "draft.docx",
            progress: 0,
            size: 82_000,
            status: "idle",
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }}
        />
      </SlotState>
      <SlotState label="Uploading">
        <FileSlot
          file={{
            id: "state-uploading",
            name: "keynote.mp4",
            progress: 0.62,
            size: 18_400_000,
            status: "uploading",
            type: "video/mp4",
          }}
        />
      </SlotState>
      <SlotState label="Complete">
        <FileSlot
          file={{
            id: "state-complete",
            name: "brand-guide.pdf",
            progress: 1,
            size: 1_240_000,
            status: "complete",
            type: "application/pdf",
          }}
        />
      </SlotState>
      <SlotState label="Failed, with retry">
        <FileSlot
          file={{
            errorMessage: "Upload failed",
            file: failedFile,
            id: "state-failed",
            name: failedFile.name,
            progress: 0,
            size: failedFile.size,
            status: "failed",
            type: failedFile.type,
          }}
        />
      </SlotState>
      <SlotState label="Preview expanded">
        <PreviewExpandedSlot />
      </SlotState>
      <SlotState label="Leaving — click Remove to see the exit transition">
        <LeavingSlot />
      </SlotState>
    </div>
  ),
};

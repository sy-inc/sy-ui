import type {Meta, StoryObj} from "@storybook/react";

import {useState} from "react";

import {Button} from "../button";
import {Modal} from "../modal";

import {ImagePreview} from "./index";

const src =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85";
const thumbnail = (
  <img
    alt="Sunlit mountain landscape"
    className="h-52 w-80 rounded-2xl object-cover"
    height={208}
    src={src}
    width={320}
  />
);

const meta = {
  component: ImagePreview,
  parameters: {layout: "centered"},
  title: "Components/ImagePreview",
  args: {children: thumbnail},
} satisfies Meta<typeof ImagePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = {args: {isDisabled: true}};
export const DefaultOpen: Story = {args: {defaultOpen: true}};
export const Localized: Story = {args: {openLabel: "查看图片", closeLabel: "关闭图片"}};

export const CroppedThumbnails: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-8 p-8">
      <ImagePreview>
        <img
          alt="Square crop"
          className="size-36 rounded-2xl object-cover"
          height={144}
          src={src}
          width={144}
        />
      </ImagePreview>
      <ImagePreview>
        <img
          alt="Portrait crop"
          className="h-64 w-40 rounded-2xl object-cover object-right"
          height={256}
          src={src}
          width={160}
        />
      </ImagePreview>
      <ImagePreview>
        <img
          alt="Wide crop"
          className="h-32 w-80 rounded-2xl object-cover"
          height={128}
          src={src}
          width={320}
        />
      </ImagePreview>
    </div>
  ),
};

function ControlledExample() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-4">
      <ImagePreview isOpen={isOpen} onOpenChange={setOpen}>
        {thumbnail}
      </ImagePreview>
      <Button onPress={() => setOpen(true)}>Open preview</Button>
    </div>
  );
}
export const Controlled: Story = {render: () => <ControlledExample />};

export const InsideModal: Story = {
  render: () => (
    <Modal>
      <Button>Open gallery</Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog aria-label="Gallery">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Landscape</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <ImagePreview>{thumbnail}</ImagePreview>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  ),
};

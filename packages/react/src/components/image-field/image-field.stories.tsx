import type {ImageFieldProps} from "./index";
import type {Meta, StoryObj} from "@storybook/react";

import {useEffect, useRef, useState} from "react";

import {ImageField} from "./index";

const square = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><circle cx="256" cy="256" r="230" fill="#223d8d"/><circle cx="256" cy="256" r="150" fill="#ffdb00"/><text x="256" y="290" text-anchor="middle" font-size="100" font-family="sans-serif" fill="#223d8d">4D</text></svg>')}`;
const banner = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="500"><path fill="#342e81" d="M0 0h1600v500H0z"/><text x="100" y="220" fill="white" font-size="90" font-family="sans-serif">Daily Bonus</text><text x="100" y="330" fill="#ddddff" font-size="50" font-family="sans-serif">+20% on first deposit</text></svg>')}`;

const images: Record<string, string> = {"/banner.svg": banner, "/square.svg": square};
const resolveSrc = (path: string) => images[path] ?? path;

// Local Storybook upload: the selected file is the result, without a storage service.
const upload: ImageFieldProps["onUpload"] = async (file, {onProgress, signal}) => {
  signal.throwIfAborted();
  await new Promise<void>((resolve, reject) => {
    const cancel = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, 1500);

    signal.addEventListener("abort", cancel, {once: true});
    onProgress(0.64);
  });
  signal.throwIfAborted();

  return URL.createObjectURL(file);
};

function useStoryValue(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  useEffect(
    () => () => {
      if (value.startsWith("blob:")) URL.revokeObjectURL(value);
    },
    [value],
  );

  return [value, setValue] as const;
}

function Example(props: ImageFieldProps) {
  const [value, setValue] = useStoryValue(props.value);

  return <ImageField {...props} value={value} onChange={setValue} />;
}

const meta = {
  args: {
    aspectRatio: 16 / 5,
    label: "Banner",
    onChange: () => {},
    onUpload: upload,
    recommendedWidth: 1600,
    resolveSrc,
    value: "",
  },
  component: ImageField,
  parameters: {layout: "padded"},
  render: (args) => <Example {...args} />,
  title: "Components/ImageField",
} satisfies Meta<typeof ImageField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Uploaded: Story = {args: {value: "/banner.svg"}};
export const Disabled: Story = {args: {isDisabled: true, value: "/banner.svg"}};
export const Composition: Story = {
  args: {
    aspectRatio: 1,
    children: (
      <>
        <ImageField.Frame />
        <ImageField.Meta>Custom metadata</ImageField.Meta>
      </>
    ),
    layout: "tile",
    value: "/square.svg",
  },
};

// Recipe: the default pill restyled into a hover overlay using only the exported parts.
const overlayButton = "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25";

export const HoverOverlay: Story = {
  args: {
    children: (
      <>
        <ImageField.Frame
          className="group"
          actions={
            <ImageField.Actions className="pointer-events-none inset-0 max-w-none justify-center gap-2 rounded-none bg-black/50 opacity-0 shadow-none backdrop-blur-none transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100 [&_button]:pointer-events-auto">
              <ImageField.ReplaceTrigger className={overlayButton}>
                Replace
              </ImageField.ReplaceTrigger>
              <ImageField.RetryButton />
              <ImageField.RemoveButton variant="danger" />
            </ImageField.Actions>
          }
        />
        <ImageField.Meta />
      </>
    ),
    value: "/banner.svg",
  },
};

const states = [
  "Empty",
  "Dragging",
  "Uploading",
  "Uploaded",
  "Ratio mismatch",
  "Upload failed",
  "Placeholder",
  "Broken URL",
] as const;

function StateExample({index, layout}: {layout: ImageFieldProps["layout"]; index: number}) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useStoryValue(
    index === 3 || index === 5
      ? layout === "banner"
        ? "/banner.svg"
        : "/square.svg"
      : index === 4
        ? layout === "banner"
          ? "/square.svg"
          : "/banner.svg"
        : index === 7
          ? "/unavailable-image.png"
          : "",
  );

  useEffect(() => {
    const area = ref.current?.querySelector('[data-slot="drop-zone-area"]');

    if (index === 1) area?.setAttribute("data-drop-target", "true");
    if (index !== 2 && index !== 5) return;
    // Seed the real FileTrigger so stories exercise the same upload state as consumers.
    const input = ref.current?.querySelector<HTMLInputElement>('input[type="file"]');
    const transfer = new DataTransfer();

    transfer.items.add(
      new File(
        [
          '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="500"><path fill="#342e81" d="M0 0h1600v500H0z"/></svg>',
        ],
        "banner.svg",
        {type: "image/svg+xml"},
      ),
    );
    if (input) {
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", {bubbles: true}));
    }
  }, [index]);

  return (
    <ImageField
      ref={ref}
      accept="image/*"
      aspectRatio={layout === "banner" ? 16 / 5 : 1}
      label={states[index]!}
      labels={index === 1 ? {upload: "Release to upload"} : undefined}
      layout={layout}
      resolveSrc={resolveSrc}
      value={value}
      placeholder={
        index === 6 ? <img alt="Inherited banner supplied by the app" src={banner} /> : undefined
      }
      onChange={setValue}
      onUpload={async (file, context) => {
        if (index === 5) throw new Error("Upload failed");
        if (index === 2) {
          context.onProgress(0.64);

          return new Promise<string>(() => {});
        }

        return upload(file, context);
      }}
    />
  );
}

export const StateMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      {(["inline", "tile", "banner"] as const).map((layout) => (
        <section key={layout}>
          <h2 className="mb-4 text-lg font-semibold">{layout}</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {states.map((state, index) => (
              <StateExample key={state} index={index} layout={layout} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

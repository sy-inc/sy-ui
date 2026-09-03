import {ssrSmoke} from "@sy-inc/testing/helpers";

import {DropZone, useDropZoneState} from "@/components/drop-zone";

const RestoredDropZone = ({variant}: {variant?: "bordered" | "flat" | "faded"}) => {
  const state = useDropZoneState({
    defaultFileList: [
      {
        id: "restored-image",
        name: "restored.png",
        previewUrl: "https://cdn.example.test/restored.png",
        progress: 1,
        size: 12,
        status: "complete",
        type: "image/png",
      },
    ],
  });

  return (
    <DropZone variant={variant}>
      <DropZone.Area {...state.getAreaProps()} aria-label="Upload files">
        <DropZone.Slots state={state} />
      </DropZone.Area>
    </DropZone>
  );
};

describe("DropZone SSR", () => {
  it("renders the default capsule anatomy without a hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <DropZone>
        <DropZone.Area aria-label="Upload files">
          <DropZone.Trigger />
        </DropZone.Area>
      </DropZone>,
    );

    expect(html).toContain('data-slot="drop-zone"');
    expect(html).toContain('data-slot="drop-zone-area"');
    expect(html).toContain('data-slot="drop-zone-trigger"');
  });

  it("renders a restored image card and its preview control without a File", async () => {
    const {html} = await ssrSmoke(<RestoredDropZone />);

    expect(html).toContain("restored.png");
    expect(html).toContain('data-slot="drop-zone-preview-trigger"');
    expect(html).toContain("https://cdn.example.test/restored.png");
    expect(html).not.toContain('data-slot="drop-zone-file-retry-trigger"');
  });

  it("renders the variant modifier without a hydration mismatch", async () => {
    const {html} = await ssrSmoke(<RestoredDropZone variant="faded" />);

    expect(html).toContain("drop-zone__area--faded");
  });
});

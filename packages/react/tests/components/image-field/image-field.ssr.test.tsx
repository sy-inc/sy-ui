import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Label} from "@/components";
import {ImageField} from "@/components/image-field";

describe("ImageField SSR", () => {
  it("renders and hydrates an empty field with a stable frame", async () => {
    const {html} = await ssrSmoke(
      <ImageField aspectRatio={1} value="" onChange={() => {}} onUpload={async () => "/logo.png"}>
        <Label>Logo</Label>
        <ImageField.Frame />
        <ImageField.Actions />
        <ImageField.Meta />
      </ImageField>,
    );

    expect(html).toContain('data-slot="image-field-frame"');
    expect(html).toContain("Logo");
    expect(html).toMatch(/aria-labelledby="([^"]+)"[\s\S]*id="\1"/);
  });
});

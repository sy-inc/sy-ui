import {ssrSmoke} from "@sy-inc/testing/helpers";

import {ImageField} from "@/components/image-field";

describe("ImageField SSR", () => {
  it("renders and hydrates an empty field with a stable frame", async () => {
    const {html} = await ssrSmoke(
      <ImageField
        aspectRatio={1}
        label="Logo"
        value=""
        onChange={() => {}}
        onUpload={async () => "/logo.png"}
      />,
    );

    expect(html).toContain('data-slot="image-field-frame"');
    expect(html).toContain("Logo");
  });
});

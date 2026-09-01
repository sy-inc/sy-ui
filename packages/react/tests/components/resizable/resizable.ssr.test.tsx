import {ssrSmoke} from "@sy-inc/testing/helpers";

import {Resizable} from "@/components/resizable";

describe("Resizable SSR", () => {
  it("renders the compound slots without a hydration mismatch", async () => {
    const {html} = await ssrSmoke(
      <Resizable>
        <Resizable.Panel>Sidebar</Resizable.Panel>
        <Resizable.Handle type="drag" />
        <Resizable.Panel>Main</Resizable.Panel>
      </Resizable>,
    );

    expect(html).toContain('data-slot="resizable"');
    expect(html).toContain('data-slot="resizable-handle"');
    expect(html).toContain('data-slot="resizable-handle-indicator"');
    expect(html).toContain("resizable__handle-indicator--drag");
  });
});

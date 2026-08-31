import {ssrSmoke} from "@sy-inc/testing/helpers";
import {RichTextEditor} from "@/components/rich-text-editor";

describe("RichTextEditor SSR", () => {
  it("renders without hydration mismatch", async () => {
    await ssrSmoke(
      <RichTextEditor defaultValue={{type: "doc", content: [{type: "paragraph"}]}}>
        <RichTextEditor.Content />
      </RichTextEditor>,
    );
  });
});

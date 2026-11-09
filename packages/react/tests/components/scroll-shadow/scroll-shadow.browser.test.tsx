import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import {ScrollShadow} from "@/components/scroll-shadow";

import "../../../../styles/dist/sy-inc.min.css";

describe("ScrollShadow (browser)", () => {
  it("supports real content overflow changes and clearing through disable/re-enable", async () => {
    const view = await render(
      <ScrollShadow data-testid="shadow" style={{width: 200, height: 100}}>
        <div style={{height: 300}}>Content</div>
      </ScrollShadow>,
    );
    const el = page.getByTestId("shadow").element();

    await expect.poll(() => el.getAttribute("data-bottom-scroll")).toBe("true");
    await view.rerender(
      <ScrollShadow data-testid="shadow" isEnabled={false} style={{width: 200, height: 100}}>
        <div style={{height: 300}}>Content</div>
      </ScrollShadow>,
    );
    expect(el).not.toHaveAttribute("data-bottom-scroll");
    expect(getComputedStyle(el).maskImage).toBe("none");
    await view.rerender(
      <ScrollShadow data-testid="shadow" style={{width: 200, height: 100}}>
        <div style={{height: 300}}>Content</div>
      </ScrollShadow>,
    );
    await expect.poll(() => el.getAttribute("data-bottom-scroll")).toBe("true");
    (el.firstElementChild as HTMLElement).style.height = "50px";
    await expect.poll(() => el.getAttribute("data-bottom-scroll")).toBe("false");
  });
});

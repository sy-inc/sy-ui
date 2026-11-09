import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import {Button} from "@/components/button";
import {Modal} from "@/components/modal";

import "../../../../styles/dist/sy-inc.min.css";

function RetainedModal({isOpen, opacity}: {isOpen: boolean; opacity?: number}) {
  return (
    <Modal isOpen={isOpen}>
      <Button>Open retained modal</Button>
      <Modal.Backdrop isExiting style={{opacity}}>
        <Modal.Container>
          <Modal.Dialog aria-label="Retained modal">
            <Button>Inside</Button>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

describe("Modal motion (browser)", () => {
  it.each([undefined, 0.6])(
    "restores original opacity %s when retained content reopens",
    async (opacity) => {
      const result = await render(<RetainedModal isOpen opacity={opacity} />);
      const backdrop = document.querySelector<HTMLElement>('[data-slot="modal-backdrop"]')!;

      await result.rerender(<RetainedModal isOpen={false} opacity={opacity} />);
      await expect.poll(() => backdrop.style.opacity).toBe("0");
      await result.rerender(<RetainedModal isOpen opacity={opacity} />);
      expect(backdrop.style.opacity).toBe(opacity === undefined ? "" : String(opacity));
      await expect.element(page.getByRole("dialog", {name: "Retained modal"})).toBeInTheDocument();
    },
  );

  it("preserves newly supplied opacity when retained content reopens", async () => {
    const result = await render(<RetainedModal isOpen opacity={0.6} />);
    const backdrop = document.querySelector<HTMLElement>('[data-slot="modal-backdrop"]')!;

    await result.rerender(<RetainedModal isOpen={false} opacity={0.6} />);
    await expect.poll(() => backdrop.style.opacity).toBe("0");
    await result.rerender(<RetainedModal isOpen opacity={0.8} />);
    expect(backdrop.style.opacity).toBe("0.8");
  });
});

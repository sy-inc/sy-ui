import {render} from "@sy-inc/testing/browser";

import "../../../../styles/dist/sy-inc.min.css";

describe("Overlay motion precedence (browser)", () => {
  it.each([
    "popover",
    "tooltip",
    "color-picker__popover",
    "modal__container",
    "alert-dialog__container",
  ])("keeps %s exit motion ahead of every entering placement", async (className) => {
    await render(
      <div
        aria-label="Motion precedence"
        className={className}
        data-entering="true"
        data-exiting="true"
      />,
    );
    const element = document.querySelector<HTMLElement>("[aria-label='Motion precedence']")!;

    for (const placement of ["top", "bottom", "left", "right", "center", "auto"]) {
      element.dataset["placement"] = placement;
      expect(getComputedStyle(element).animationName).toBe(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : "sy-overlay-exit",
      );
    }
  });

  it("keeps full modal enters unscaled", async () => {
    await render(
      <div
        aria-label="Full modal enter"
        className="modal__container modal__container--full"
        data-entering="true"
        data-placement="auto"
      />,
    );
    const element = document.querySelector<HTMLElement>("[aria-label='Full modal enter']")!;

    expect(getComputedStyle(element).animationName).toBe(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "none"
        : "sy-overlay-enter-100",
    );
  });

  it.each(["modal__backdrop--blur", "alert-dialog__backdrop--blur", "drawer__backdrop--blur"])(
    "applies touch blur policy to %s",
    async (className) => {
      await render(<div aria-label="Blur policy" className={className} />);
      const element = document.querySelector<HTMLElement>("[aria-label='Blur policy']")!;
      const skipsBlur = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

      if (skipsBlur) expect(getComputedStyle(element).backdropFilter).toBe("none");
      else expect(getComputedStyle(element).backdropFilter).not.toBe("none");
    },
  );

  it("keeps full modal exits at their unscaled endpoint", async () => {
    await render(
      <div
        aria-label="Full modal motion"
        className="modal__container modal__container--full"
        data-entering="true"
        data-exiting="true"
        data-placement="auto"
      />,
    );
    const element = document.querySelector<HTMLElement>("[aria-label='Full modal motion']")!;

    expect(getComputedStyle(element).animationName).toBe(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "none"
        : "sy-overlay-exit-full",
    );
  });
});

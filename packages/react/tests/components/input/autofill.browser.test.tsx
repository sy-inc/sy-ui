import type {ReactNode} from "react";

import {render} from "@sy-inc/testing/browser";
import {cdp} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

type BrowserCDPSession = {
  send(command: string, params?: unknown): Promise<any>;
};

const browserCdp = () => cdp() as BrowserCDPSession;

const IDLE = "rgb(17, 34, 51)";
const FOCUS = "rgb(34, 51, 68)";
const SECONDARY = "rgb(51, 68, 85)";

// Plain BEM markup: the cover is pure CSS, so no RAC state is needed.
const shells: Array<[name: string, focusFill: boolean, fixture: (variant: string) => ReactNode]> = [
  ["Input", true, (v) => <input className={`input input--${v}`} data-autofill-target="" />],
  [
    "TextArea",
    true,
    (v) => <textarea className={`textarea textarea--${v}`} data-autofill-target="" />,
  ],
  [
    "InputGroup",
    true,
    (v) => (
      <div className={`input-group input-group--${v}`}>
        <span data-slot="input-group-prefix">$</span>
        <input
          className="input-group__input"
          data-autofill-target=""
          data-slot="input-group-input"
        />
      </div>
    ),
  ],
  [
    "SearchField",
    false,
    (v) => (
      <div className={`search-field search-field--${v}`}>
        <div className="search-field__group">
          <input
            className="search-field__input"
            data-autofill-target=""
            data-slot="search-field-input"
          />
        </div>
      </div>
    ),
  ],
  [
    "NumberField",
    true,
    (v) => (
      <div className={`number-field number-field--${v}`}>
        <div className="number-field__group">
          <input
            className="number-field__input"
            data-autofill-target=""
            data-slot="number-field-input"
          />
        </div>
      </div>
    ),
  ],
  [
    "ComboBox",
    true,
    (v) => (
      <div className="combo-box">
        <input className={`input input--${v}`} data-autofill-target="" data-slot="input" />
      </div>
    ),
  ],
  [
    "ColorInputGroup",
    false,
    (v) => (
      <div className={`color-input-group color-input-group--${v}`}>
        <input
          className="color-input-group__input"
          data-autofill-target=""
          data-slot="color-input-group-input"
        />
      </div>
    ),
  ],
];

const cases = (["primary", "secondary"] as const).flatMap((variant) =>
  shells.map(([name, focusFill, fixture]) => ({name, variant, focusFill, fixture})),
);

/** CDP forces Chromium's native :autofill state without a saved browser profile. */
const forceAutofill = async () => {
  const session = browserCdp();

  // `pierce` reaches the test iframe; the search then spans every frame's document.
  await session.send("DOM.getDocument", {depth: -1, pierce: true});
  const {resultCount, searchId} = await session.send("DOM.performSearch", {
    query: "[data-autofill-target]",
  });
  const {nodeIds} = await session.send("DOM.getSearchResults", {
    searchId,
    fromIndex: 0,
    toIndex: resultCount,
  });

  await session.send("DOM.discardSearchResults", {searchId});
  expect(nodeIds).toHaveLength(1);
  await session.send("CSS.forcePseudoState", {
    forcedPseudoClasses: ["autofill"],
    nodeId: nodeIds[0],
  });
};

describe("Input autofill (browser)", () => {
  const tokens = document.createElement("style");

  tokens.textContent =
    ":root{--field-background:#112233;--field-focus:#223344;--default:#334455;--field-foreground:#abcdef}";

  beforeAll(async () => {
    document.head.append(tokens);
    await browserCdp().send("DOM.enable");
    await browserCdp().send("CSS.enable");
  });

  afterAll(async () => {
    tokens.remove();
  });

  beforeEach(async () => {
    // DOM cleanup leaves the real pointer over the next fixture, which would apply hover fills.
    await browserCdp().send("Input.dispatchMouseEvent", {type: "mouseMoved", x: -1, y: -1});
  });

  it.each(cases)(
    "supports the $name $variant cover idle and focused",
    async ({fixture, focusFill, variant}) => {
      // Scoped reduced motion: global media emulation races other browser test files.
      await render(<div data-reduce-motion="true">{fixture(variant)}</div>);
      await forceAutofill();
      const field = document.querySelector<HTMLElement>("[data-autofill-target]")!;

      for (const focused of [false, true]) {
        if (focused) field.focus();
        const style = getComputedStyle(field);
        const fill = variant === "secondary" ? SECONDARY : focused && focusFill ? FOCUS : IDLE;

        expect(field.matches(":autofill")).toBe(true);
        expect(style.boxShadow).toContain(`${fill} 0px 0px 0px 1000px inset`);
        // The cover must appear immediately.
        expect(style.transitionProperty.split(", ")).not.toContain("box-shadow");
        expect(style.webkitTextFillColor).toBe("rgb(171, 205, 239)");
      }
    },
  );
});

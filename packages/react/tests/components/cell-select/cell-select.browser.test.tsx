import {render} from "@sy-inc/testing/browser";
import {page} from "vitest/browser";

import "../../../../styles/dist/sy-inc.min.css";

import {CellSelect} from "@/components/cell-select";
import {ListBox} from "@/components/list-box";

/**
 * CellSelect layers cell-select.css over select.css on the same elements, so these
 * assertions guard the cascade: if the deltas stop winning, the row layout breaks.
 */
const Fixture = ({
  label = "Theme",
  variant,
}: {label?: string; variant?: "default" | "secondary"} = {}) => (
  <CellSelect aria-label={label} defaultValue="default" variant={variant}>
    <CellSelect.Trigger>
      <CellSelect.Label>{label}</CellSelect.Label>
      <CellSelect.Value />
      <CellSelect.Indicator />
    </CellSelect.Trigger>
    <CellSelect.Popover>
      <ListBox>
        <ListBox.Item id="default" textValue="Default">
          Default
        </ListBox.Item>
      </ListBox>
    </CellSelect.Popover>
  </CellSelect>
);

describe("CellSelect (browser)", () => {
  it("renders the trigger as an inline settings row", async () => {
    await render(<Fixture />);

    const trigger = page.getByRole("button", {name: /Theme/}).element();
    const styles = getComputedStyle(trigger);

    expect(styles.display).toBe("flex");
    expect(styles.height).toBe("36px");
    expect(styles.paddingTop).toBe("0px");
    /* select__trigger reserves pe-7 for its absolute indicator; the cell indicator is inline. */
    expect(styles.paddingRight).toBe("12px");
  });

  it("renders the indicator inline instead of absolutely positioned", async () => {
    await render(<Fixture />);

    const indicator = document.querySelector('[data-slot="cell-select-indicator"]')!;
    const styles = getComputedStyle(indicator);

    expect(styles.position).toBe("static");
    expect(styles.width).toBe("12px");
    expect(styles.height).toBe("12px");
  });

  it("takes its surface treatment from the underlying select variant", async () => {
    await render(
      <>
        <Fixture />
        <Fixture label="Language" variant="secondary" />
      </>,
    );

    const defaultTrigger = page.getByRole("button", {name: /Theme/}).element();
    const secondaryTrigger = page.getByRole("button", {name: /Language/}).element();

    /* secondary is select--secondary: a different surface, no field shadow. */
    expect(getComputedStyle(secondaryTrigger).backgroundColor).not.toBe(
      getComputedStyle(defaultTrigger).backgroundColor,
    );
    expect(getComputedStyle(secondaryTrigger).boxShadow).not.toBe(
      getComputedStyle(defaultTrigger).boxShadow,
    );
  });
});

import {render, screen, setupUser} from "@sy-inc/testing/helpers";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {tv} from "tailwind-variants";

import {composeSlotClassName, composeTwRenderProps} from "@/utils/compose";

describe("composeTwRenderProps", () => {
  it.each([
    [undefined, undefined, ""],
    ["", "", ""],
    ["custom", undefined, "custom"],
    [undefined, "base", "base"],
    ["custom", "base", "base custom"],
    ["p-4", "p-2", "p-2 p-4"],
  ])("supports static className %s and styles %s", (className, styles, expected) => {
    expect(composeTwRenderProps(className, styles)).toBe(expected);
  });

  it("supports function className without evaluating it before render", () => {
    const className = vi.fn(({isPressed}: {isPressed: boolean}) =>
      isPressed ? "pressed" : "idle",
    );
    const composed = composeTwRenderProps(className, "base");

    expect(className).not.toHaveBeenCalled();
    expect(typeof composed).toBe("function");
    if (typeof composed !== "function") throw new Error("Expected a render prop");

    const state = {isPressed: true};

    expect(composed(state)).toBe("base pressed");
    expect(className).toHaveBeenCalledExactlyOnceWith(state);
    expect(composed({isPressed: false})).toBe("base idle");
  });

  it("supports function styles with static or absent className", () => {
    const styles = vi.fn(({isPressed}: {isPressed: boolean}) =>
      isPressed ? "pressed" : undefined,
    );
    const withClassName = composeTwRenderProps("custom", styles);
    const withoutClassName = composeTwRenderProps(undefined, styles);

    expect(styles).not.toHaveBeenCalled();
    if (typeof withClassName !== "function" || typeof withoutClassName !== "function") {
      throw new Error("Expected render props");
    }

    expect(withClassName({isPressed: true})).toBe("pressed custom");
    expect(withClassName({isPressed: false})).toBe("custom");
    expect(withoutClassName({isPressed: false})).toBe("");
  });

  it("calls className before styles with the same render props", () => {
    const calls: string[] = [];
    const state = {isPressed: true};
    const className = vi.fn((value: typeof state) => {
      calls.push("className");

      return value.isPressed ? "custom" : "";
    });
    const styles = vi.fn((value: typeof state) => {
      calls.push("styles");

      return value.isPressed ? "base" : "";
    });
    const composed = composeTwRenderProps(className, styles);

    if (typeof composed !== "function") throw new Error("Expected a render prop");

    expect(composed(state)).toBe("base custom");
    expect(calls).toEqual(["className", "styles"]);
    expect(className).toHaveBeenCalledExactlyOnceWith(state);
    expect(styles).toHaveBeenCalledExactlyOnceWith(state);
  });

  it("supports React Aria state, default classes, children and changing className types", async () => {
    const user = setupUser();
    const {rerender} = render(
      <ButtonPrimitive className={composeTwRenderProps("custom", "base")}>Save</ButtonPrimitive>,
    );
    const button = screen.getByRole("button", {name: "Save"});

    expect(button).toHaveClass("base", "custom");

    rerender(
      <ButtonPrimitive
        className={composeTwRenderProps(
          ({defaultClassName, isHovered}) =>
            `${defaultClassName} ${isHovered ? "hovered" : "idle"}`,
          "base",
        )}
      >
        {({isHovered}) => (isHovered ? "Hovered" : "Save")}
      </ButtonPrimitive>,
    );

    expect(button).toHaveClass("base", "react-aria-Button", "idle");
    await user.hover(button);
    expect(button).toHaveClass("hovered");
    expect(button).toHaveTextContent("Hovered");

    rerender(
      <ButtonPrimitive className={composeTwRenderProps("updated", "base")}>Save</ButtonPrimitive>,
    );
    expect(button).toHaveClass("base", "updated");
    expect(button).not.toHaveClass("hovered");
  });
});

describe("composeSlotClassName", () => {
  it("supports tailwind-variants slot merging and caller overrides", () => {
    const slots = tv({slots: {base: "p-2 text-sm"}})();

    expect(composeSlotClassName(slots.base, "p-4")).toBe("text-sm p-4");
    expect(composeSlotClassName(undefined, "custom")).toBe("custom");
    expect(composeSlotClassName(undefined)).toBeUndefined();
  });
});

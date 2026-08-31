import {render, screen, setupUser, within} from "@sy-inc/testing/helpers";
import React from "react";

import {Stepper} from "@/components/stepper";

const steps = (
  <>
    <Stepper.Item id="account">
      <Stepper.Indicator />
      <Stepper.Content>
        <Stepper.Title>Account</Stepper.Title>
      </Stepper.Content>
    </Stepper.Item>
    <Stepper.Item id="verify">
      <Stepper.Indicator />
      <Stepper.Content>
        <Stepper.Title>Verification</Stepper.Title>
        <Stepper.Description>Verify your email</Stepper.Description>
      </Stepper.Content>
    </Stepper.Item>
    <Stepper.Item id="complete">
      <Stepper.Indicator />
      <Stepper.Content>
        <Stepper.Title>Complete</Stepper.Title>
      </Stepper.Content>
    </Stepper.Item>
  </>
);

describe("Stepper", () => {
  let user: ReturnType<typeof setupUser>;

  beforeAll(() => {
    user = setupUser();
  });

  it("renders a labelled ordered list and infers linear statuses", () => {
    render(
      <Stepper aria-label="Account setup" currentKey="verify" data-testid="stepper">
        {steps}
      </Stepper>,
    );

    const root = screen.getByTestId("stepper");
    const items = screen.getAllByRole("listitem");

    expect(screen.getByRole("list", {name: "Account setup"})).toBeInTheDocument();
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("data-status", "complete");
    expect(items[1]).toHaveAttribute("data-status", "current");
    expect(items[2]).toHaveAttribute("data-status", "pending");
    expect(root).toHaveAttribute("data-slot", "stepper");
    expect(root.className).toEqual(expect.stringContaining("stepper"));
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it("is non-interactive without onCurrentChange", () => {
    render(
      <Stepper aria-label="Account setup" currentKey="account">
        {steps}
      </Stepper>,
    );

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("requests controlled changes from pointer and keyboard input", async () => {
    const onCurrentChange = vi.fn();

    render(
      <Stepper aria-label="Account setup" currentKey="account" onCurrentChange={onCurrentChange}>
        {steps}
      </Stepper>,
    );

    const verification = screen.getByRole("button", {name: /Verification/});
    const complete = screen.getByRole("button", {name: "Complete"});

    await user.click(verification);
    complete.focus();
    await user.keyboard("{Enter}");

    expect(onCurrentChange).toHaveBeenNthCalledWith(1, "verify");
    expect(onCurrentChange).toHaveBeenNthCalledWith(2, "complete");
  });

  it("does not request changes for the current or disabled steps", async () => {
    const onCurrentChange = vi.fn();

    render(
      <Stepper aria-label="Account setup" currentKey="account" onCurrentChange={onCurrentChange}>
        <Stepper.Item id="account">
          <Stepper.Indicator />
          <Stepper.Title>Account</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item isDisabled id="verify">
          <Stepper.Indicator />
          <Stepper.Title>Verification</Stepper.Title>
        </Stepper.Item>
      </Stepper>,
    );

    await user.click(screen.getByRole("button", {name: "Account"}));
    await user.click(screen.getByRole("button", {name: "Verification"}));

    expect(screen.getByRole("button", {name: "Verification"})).toBeDisabled();
    expect(onCurrentChange).not.toHaveBeenCalled();
  });

  it("disables every item when the stepper is disabled", async () => {
    const onCurrentChange = vi.fn();

    render(
      <Stepper
        isDisabled
        aria-label="Account setup"
        currentKey="account"
        onCurrentChange={onCurrentChange}
      >
        {steps}
      </Stepper>,
    );

    const buttons = screen.getAllByRole("button");

    expect(buttons).toHaveLength(3);
    buttons.forEach((button) => expect(button).toBeDisabled());
    await user.click(buttons[1]!);
    expect(onCurrentChange).not.toHaveBeenCalled();
  });

  it("supports a completed process and explicit status overrides", () => {
    render(
      <Stepper isComplete aria-label="Account setup">
        <Stepper.Item id="account">
          <Stepper.Indicator />
          <Stepper.Title>Account</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item id="verify" status="loading" statusLabel="Loading">
          <Stepper.Indicator />
          <Stepper.Title>Verification</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item id="complete" status="error" statusLabel="Error">
          <Stepper.Indicator />
          <Stepper.Title>Complete</Stepper.Title>
        </Stepper.Item>
      </Stepper>,
    );

    const items = screen.getAllByRole("listitem");
    const loadingItem = items[1]!;

    expect(items[0]).toHaveAttribute("data-status", "complete");
    expect(loadingItem).toHaveAttribute("data-status", "loading");
    expect(items[2]).toHaveAttribute("data-status", "error");
    expect(loadingItem.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(within(loadingItem).getByText("Loading")).toHaveClass("stepper__status-label");
    expect(document.querySelector('[aria-current="step"]')).toBeNull();
  });

  it("keeps numeric and string keys distinct", () => {
    render(
      <Stepper aria-label="Typed keys" currentKey={1}>
        <Stepper.Item id="1">
          <Stepper.Indicator />
          <Stepper.Title>String key</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item id={1}>
          <Stepper.Indicator />
          <Stepper.Title>Numeric key</Stepper.Title>
        </Stepper.Item>
      </Stepper>,
    );

    expect(screen.getByText("String key").closest("li")).toHaveAttribute("data-status", "complete");
    expect(screen.getByText("Numeric key").closest("li")).toHaveAttribute("data-status", "current");
  });

  it("exposes orientation, variants, and semantic slots", () => {
    render(
      <Stepper
        aria-label="Account setup"
        color="success"
        currentKey="account"
        orientation="vertical"
        variant="soft"
      >
        {steps}
      </Stepper>,
    );

    const root = screen.getByRole("list").parentElement;

    expect(root).toHaveAttribute("data-orientation", "vertical");
    expect(root?.className).toEqual(expect.stringContaining("stepper--vertical"));
    expect(root?.className).toEqual(expect.stringContaining("stepper--soft"));
    expect(root?.className).toEqual(expect.stringContaining("stepper--success"));
    expect(document.querySelectorAll('[data-slot="stepper-indicator"]')).toHaveLength(3);
    expect(document.querySelectorAll('[data-slot="stepper-separator"]')).toHaveLength(2);
  });

  it("supports dot and render-function indicators", () => {
    render(
      <Stepper aria-label="Account setup" currentKey="verify" variant="dot">
        <Stepper.Item id="account">
          <Stepper.Indicator>
            {({index, status, total}) => `${index + 1}/${total}:${status}`}
          </Stepper.Indicator>
          <Stepper.Title>Account</Stepper.Title>
        </Stepper.Item>
        <Stepper.Item id="verify">
          <Stepper.Indicator data-testid="dot" />
          <Stepper.Title>Verification</Stepper.Title>
        </Stepper.Item>
      </Stepper>,
    );

    expect(screen.getByText("1/2:complete")).toBeInTheDocument();
    expect(screen.getByTestId("dot")).toBeEmptyDOMElement();
  });

  it("forwards refs to the root and compound parts", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const indicatorRef = React.createRef<HTMLSpanElement>();

    render(
      <Stepper ref={rootRef} aria-label="Account setup" currentKey="account">
        <Stepper.Item id="account">
          <Stepper.Indicator ref={indicatorRef} />
          <Stepper.Title>Account</Stepper.Title>
        </Stepper.Item>
      </Stepper>,
    );

    expect(rootRef.current).not.toBeNull();
    expect(indicatorRef.current).not.toBeNull();
  });
});

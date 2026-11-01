import type {Key} from "react";

import {useState} from "react";

import {Button} from "@/components/button";
import {ViewStack} from "@/components/view-stack";

export type ViewStackFixtureProps = {
  initialKey?: Key;
  forceMountInfo?: boolean;
  onCurrentChange?: (key: Key) => void;
};

/** Three steps plus a branch: info → plan → confirm, or info → help. */
export const ViewStackFixture = ({
  forceMountInfo,
  initialKey = "info",
  onCurrentChange,
}: ViewStackFixtureProps = {}) => {
  const [step, setStep] = useState<Key>(initialKey);
  const go = (key: Key) => {
    setStep(key);
    onCurrentChange?.(key);
  };

  return (
    <>
      <Button onPress={() => go("info")}>Restart</Button>
      <ViewStack currentKey={step} data-testid="stack" onCurrentChange={(key) => go(key)}>
        <ViewStack.View id="info" shouldForceMount={forceMountInfo}>
          <ViewStack.Header>
            <ViewStack.Back />
            <ViewStack.Title>Details</ViewStack.Title>
          </ViewStack.Header>
          <input aria-label="Draft" />
          <Button onPress={() => go("plan")}>Next</Button>
          <Button onPress={() => go("help")}>Help</Button>
        </ViewStack.View>
        <ViewStack.View id="plan">
          <ViewStack.Header>
            <ViewStack.Back />
            <ViewStack.Title>Plan</ViewStack.Title>
          </ViewStack.Header>
          <Button onPress={() => go("confirm")}>Continue</Button>
        </ViewStack.View>
        <ViewStack.View id="confirm">
          <ViewStack.Header>
            <ViewStack.Back />
            <ViewStack.Title>Confirm</ViewStack.Title>
          </ViewStack.Header>
          <input autoFocus aria-label="Code" />
        </ViewStack.View>
        <ViewStack.View id="help">
          <ViewStack.Header>
            <ViewStack.Back />
            <ViewStack.Title>Help</ViewStack.Title>
          </ViewStack.Header>
        </ViewStack.View>
      </ViewStack>
    </>
  );
};

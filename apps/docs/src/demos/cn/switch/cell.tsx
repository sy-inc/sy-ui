import {Label, Switch, SwitchGroup} from "@sy-inc/react";

const settings = [
  {label: "无线局域网", props: {}},
  {label: "蓝牙", props: {defaultSelected: true}},
  {label: "后台应用刷新", props: {isDisabled: true}},
];

export function Cell() {
  return (
    <SwitchGroup className="w-full max-w-sm divide-y divide-default">
      {settings.map(({label, props}) => (
        <Switch key={label} variant="cell" {...props}>
          <Switch.Content>
            <Label>{label}</Label>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
        </Switch>
      ))}
    </SwitchGroup>
  );
}

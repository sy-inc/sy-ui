import {Label, Switch, SwitchGroup} from "@sy-inc/react";

const settings = [
  {label: "Wi-Fi", props: {}},
  {label: "Bluetooth", props: {defaultSelected: true}},
  {label: "Background app refresh", props: {isDisabled: true}},
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

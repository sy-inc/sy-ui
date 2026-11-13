import {Checkbox, CheckboxGroup, Label} from "@sy-inc/react";

const options = [
  {label: "Email", value: "email"},
  {label: "SMS", value: "sms"},
  {label: "Push", value: "push"},
] as const;

export function Horizontal() {
  return (
    <div className="flex items-center justify-between gap-6">
      <Label id="channels-label">Notification channels</Label>
      <CheckboxGroup
        aria-labelledby="channels-label"
        defaultValue={["email"]}
        name="channels"
        orientation="horizontal"
      >
        {options.map(({label, value}) => (
          <Checkbox key={value} value={value}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {label}
            </Checkbox.Content>
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
}

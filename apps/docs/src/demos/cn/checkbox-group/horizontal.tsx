import {Checkbox, CheckboxGroup, Label} from "@sy-inc/react";

const options = [
  {label: "电子邮件", value: "email"},
  {label: "短信", value: "sms"},
  {label: "推送", value: "push"},
] as const;

export function Horizontal() {
  return (
    <div className="flex items-center justify-between gap-6">
      <Label id="channels-label">通知渠道</Label>
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

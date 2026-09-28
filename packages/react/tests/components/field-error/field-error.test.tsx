import {render, screen} from "@sy-inc/testing/helpers";

import {FieldError} from "@/components/field-error";
import {Input} from "@/components/input";
import {Label} from "@/components/label";
import {TextField} from "@/components/textfield";

describe("FieldError", () => {
  it("renders with data-slot and BEM when the field is invalid", () => {
    render(
      <TextField isInvalid name="email">
        <Label>Email</Label>
        <Input />
        <FieldError>Enter a valid email</FieldError>
      </TextField>,
    );

    const error = document.querySelector('[data-slot="field-error"]');

    expect(error).not.toBeNull();
    expect(error?.className).toEqual(expect.stringContaining("field-error"));
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
  });

  it("renders nothing when the field is valid", () => {
    render(
      <TextField name="email">
        <Label>Email</Label>
        <Input />
        <FieldError>Enter a valid email</FieldError>
      </TextField>,
    );

    expect(screen.queryByText("Enter a valid email")).toBeNull();
    expect(document.querySelector('[data-slot="field-error"]')).toBeNull();
  });

  it("supports render props when invalid", () => {
    render(
      <TextField isInvalid name="email">
        <Label>Email</Label>
        <Input />
        <FieldError>{({isInvalid}) => (isInvalid ? "Rendered via props" : null)}</FieldError>
      </TextField>,
    );

    expect(screen.getByText("Rendered via props")).toBeInTheDocument();
  });
});

describe("FieldError outside a field", () => {
  it("renders its content as a visible error", () => {
    render(<FieldError id="code-error">Invalid code</FieldError>);

    const error = screen.getByText("Invalid code");

    expect(error).toHaveTextContent("Invalid code");
    expect(error).toHaveAttribute("id", "code-error");
    expect(error).toHaveAttribute("data-slot", "field-error");
    expect(error).toHaveAttribute("data-visible");
  });

  it.each([undefined, null, false, "", []])("renders nothing for empty content (%j)", (content) => {
    render(<FieldError>{content}</FieldError>);

    expect(document.querySelector('[data-slot="field-error"]')).toBeNull();
  });

  it("renders nothing when a render function returns nothing", () => {
    render(<FieldError>{() => null}</FieldError>);

    expect(document.querySelector('[data-slot="field-error"]')).toBeNull();
  });
});

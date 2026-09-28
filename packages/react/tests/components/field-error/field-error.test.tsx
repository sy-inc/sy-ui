import {parseDate} from "@internationalized/date";
import {render, screen} from "@sy-inc/testing/helpers";

import {Calendar} from "@/components/calendar";
import {FieldError} from "@/components/field-error";
import {Input} from "@/components/input";
import {Label} from "@/components/label";
import {Tag} from "@/components/tag";
import {TagGroup} from "@/components/tag-group";
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

describe("FieldError in components with an errorMessage slot", () => {
  it("links itself to the TagGroup grid and hides while empty", () => {
    const {rerender} = render(
      <TagGroup aria-label="Tags">
        <TagGroup.List>
          <Tag id="a">A</Tag>
        </TagGroup.List>
        <FieldError>{"Pick one"}</FieldError>
      </TagGroup>,
    );

    expect(screen.getByRole("grid")).toHaveAccessibleDescription("Pick one");

    rerender(
      <TagGroup aria-label="Tags">
        <TagGroup.List>
          <Tag id="a">A</Tag>
        </TagGroup.List>
        <FieldError>{false}</FieldError>
      </TagGroup>,
    );

    expect(screen.queryByText("Pick one")).toBeNull();
  });

  it("links itself to an invalid Calendar", () => {
    render(
      <Calendar isInvalid aria-label="Date" defaultValue={parseDate("2025-01-15")}>
        <Calendar.Grid>
          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
        </Calendar.Grid>
        <FieldError>Pick a future date</FieldError>
      </Calendar>,
    );

    expect(screen.getByText("15").closest("[aria-describedby]")).toHaveAccessibleDescription(
      expect.stringContaining("Pick a future date"),
    );
  });
});

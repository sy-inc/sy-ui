import {Typography} from "@sy-inc/react";

export const Prose = () => {
  return (
    <Typography.Prose className="flex max-w-xl flex-col gap-3">
      <h1>Prose title</h1>
      <p>
        Prose is for authored content where the markup is already semantic and SY INC applies the
        default typography rhythm.
      </p>
      <h2>Section title</h2>
      <p>
        Inline code like <code>render</code> receives the same code treatment as the Typography
        primitive.
      </p>
    </Typography.Prose>
  );
};

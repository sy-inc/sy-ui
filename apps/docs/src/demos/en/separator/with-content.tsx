import {SeparatorContent} from "@sy-inc/react";

export function WithContent() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <SeparatorContent>OR</SeparatorContent>
      <SeparatorContent variant="secondary">Continue with</SeparatorContent>
    </div>
  );
}

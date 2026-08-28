import {SeparatorContent} from "@sy-inc/react";

export function WithContent() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <SeparatorContent>或</SeparatorContent>
      <SeparatorContent variant="secondary">继续使用</SeparatorContent>
    </div>
  );
}

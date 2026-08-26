"use client";

import {Link} from "@sy-ui/react";

export function RenderFunction() {
  return (
    <Link href="#" render={(props) => <span {...props} data-custom="foo" />}>
      立即行动
      <Link.Icon />
    </Link>
  );
}

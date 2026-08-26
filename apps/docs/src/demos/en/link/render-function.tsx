"use client";

import {Link} from "@sy-ui/react";

export function RenderFunction() {
  return (
    <Link href="#" render={(props) => <span {...props} data-custom="foo" />}>
      Call to action
      <Link.Icon />
    </Link>
  );
}

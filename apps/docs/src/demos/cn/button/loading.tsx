"use client";

import {Button, Spinner} from "@sy-inc/react";
import React from "react";

export function Loading() {
  return (
    <Button isPending>
      {({isPending}) => (
        <>
          {isPending ? <Spinner color="current" size="sm" /> : null}
          上传中…
        </>
      )}
    </Button>
  );
}

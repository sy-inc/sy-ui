/* eslint-disable react-refresh/only-export-components -- Shared image data and JSX for both test environments. */
import type {ImagePreviewProps} from "@/components/image-preview";

import {ImagePreview} from "@/components/image-preview";

export const imageSrc = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#356b87"/><circle cx="900" cy="200" r="100" fill="#f6cf79"/><path d="M0 800 450 250 900 800" fill="#203c48"/></svg>')}`;
export const previewSrc = imageSrc.replace("356b87", "387d70");

export function ImagePreviewFixture(props: Omit<ImagePreviewProps, "children"> = {}) {
  return (
    <ImagePreview {...props}>
      <img alt="Mountain lake" height={160} src={imageSrc} width={240} />
    </ImagePreview>
  );
}

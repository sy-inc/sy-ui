import type {ComponentProps} from "react";

import {
  ImageFieldActions,
  ImageFieldCancelButton,
  ImageFieldFrame,
  ImageFieldMeta,
  ImageFieldRemoveButton,
  ImageFieldReplaceTrigger,
  ImageFieldRetryButton,
  ImageFieldRoot,
} from "./image-field";

export const ImageField = Object.assign(ImageFieldRoot, {
  Actions: ImageFieldActions,
  CancelButton: ImageFieldCancelButton,
  Frame: ImageFieldFrame,
  Meta: ImageFieldMeta,
  RemoveButton: ImageFieldRemoveButton,
  ReplaceTrigger: ImageFieldReplaceTrigger,
  RetryButton: ImageFieldRetryButton,
  Root: ImageFieldRoot,
});
export {
  ImageFieldRoot,
  ImageFieldFrame,
  ImageFieldActions,
  ImageFieldMeta,
  ImageFieldReplaceTrigger,
  ImageFieldRemoveButton,
  ImageFieldRetryButton,
  ImageFieldCancelButton,
};
export type {
  ImageFieldProps,
  ImageFieldFrameProps,
  ImageFieldActionsProps,
  ImageFieldMetaProps,
  ImageFieldButtonProps,
  ImageFieldReplaceTriggerProps,
  ImageFieldLabels,
} from "./image-field";
export {imageFieldVariants, type ImageFieldVariants} from "@sy-inc/styles";

export type ImageField = {
  Props: ComponentProps<typeof ImageFieldRoot>;
  RootProps: ComponentProps<typeof ImageFieldRoot>;
  FrameProps: ComponentProps<typeof ImageFieldFrame>;
  ActionsProps: ComponentProps<typeof ImageFieldActions>;
  MetaProps: ComponentProps<typeof ImageFieldMeta>;
  ButtonProps: ComponentProps<typeof ImageFieldRemoveButton>;
  ReplaceTriggerProps: ComponentProps<typeof ImageFieldReplaceTrigger>;
};

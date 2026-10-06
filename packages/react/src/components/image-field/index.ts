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
  ImageFieldSize,
  ImageFieldWarning,
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
  Size: ImageFieldSize,
  Warning: ImageFieldWarning,
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
  ImageFieldWarning,
  ImageFieldSize,
};
export type {
  ImageFieldProps,
  ImageFieldFrameProps,
  ImageFieldActionsProps,
  ImageFieldActionsRenderProps,
  ImageFieldMetaProps,
  ImageFieldGuidanceProps,
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
  GuidanceProps: ComponentProps<typeof ImageFieldWarning>;
  ButtonProps: ComponentProps<typeof ImageFieldRemoveButton>;
  ReplaceTriggerProps: ComponentProps<typeof ImageFieldReplaceTrigger>;
};

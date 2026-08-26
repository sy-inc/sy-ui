import {Label, Slider} from "@sy-ui/react";

export function Disabled() {
  return (
    <Slider isDisabled className="w-full max-w-xs" defaultValue={30}>
      <Label>音量</Label>
      <Slider.Output />
      <Slider.Track>
        <Slider.Fill />
        <Slider.Thumb />
      </Slider.Track>
    </Slider>
  );
}

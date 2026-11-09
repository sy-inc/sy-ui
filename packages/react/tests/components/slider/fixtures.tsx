import type {ComponentProps} from "react";

import {Label} from "@/components/label";
import {Slider} from "@/components/slider";

export const IndicatorSlider = (props: Omit<ComponentProps<typeof Slider>, "children">) => (
  <Slider defaultValue={0.2} maxValue={0.3} step={0.1} {...props}>
    <Label>Level</Label>
    <Slider.Output />
    <Slider.Track>
      {({state}) => (
        <>
          <Slider.Fill />
          <Slider.Steps />
          {state.values.map((_, index) => (
            <Slider.Thumb key={index} aria-label={`Level ${index + 1}`} index={index} />
          ))}
        </>
      )}
    </Slider.Track>
    <Slider.Marks>
      <Slider.Mark value={0}>Minimum</Slider.Mark>
      <Slider.Mark value={0.15} />
      <Slider.Mark value={0.3}>Maximum</Slider.Mark>
    </Slider.Marks>
  </Slider>
);

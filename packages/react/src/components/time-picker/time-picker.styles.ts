import {tv} from "tailwind-variants";

export const timePickerVariants = tv({
  slots: {
    base: "relative isolate inline-flex w-fit items-center justify-center gap-1 p-1 before:pointer-events-none before:absolute before:inset-x-1 before:top-1/2 before:z-0 before:h-8 before:-translate-y-1/2 before:rounded-lg before:bg-default before:content-[''] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
    unit: "relative z-10 h-40 w-20 cursor-grab overflow-hidden bg-transparent active:cursor-grabbing",
    item: "text-muted-foreground focus-visible:ring-primary/30 relative z-10 flex h-8 items-center justify-center bg-transparent text-sm font-medium transition-colors outline-none select-none hover:!bg-transparent focus-visible:text-foreground focus-visible:ring-2 data-[hovered=true]:!bg-transparent data-[selected=true]:font-semibold data-[selected=true]:text-foreground data-[selected=true]:opacity-100",
  },
});

"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    {...props}
    ref={ref}
    className={cn(
      "relative inline-flex h-[24px] w-[44px] cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      props.checked ? "bg-green-500" : "bg-gray-300",
      className
    )}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none absolute left-[2px] top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-lg transform transition-transform",
        props.checked ? "translate-x-[20px]" : "translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };

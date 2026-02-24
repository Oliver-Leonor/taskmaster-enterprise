import * as React from "react";
import { cn } from "../../lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none",
        "focus:ring-2 focus:ring-slate-300",
        className,
      )}
      {...props}
    />
  );
});

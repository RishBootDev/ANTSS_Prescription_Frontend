import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:font-medium placeholder:text-slate-500 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-10 min-h-10 w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-base font-medium text-slate-950 shadow-sm transition-[color,background-color,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold hover:border-primary/60 hover:bg-white hover:shadow-md disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/15',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }

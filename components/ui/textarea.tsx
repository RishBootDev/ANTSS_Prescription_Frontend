import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:font-medium placeholder:text-slate-500 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-base font-medium text-slate-950 shadow-sm transition-[color,background-color,border-color,box-shadow] outline-none hover:border-primary/60 hover:bg-white hover:shadow-md focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }

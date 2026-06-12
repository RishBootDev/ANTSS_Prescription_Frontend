import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function DatePicker({ label, error, className, id, ...props }: DatePickerProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
          {label}
        </Label>
      )}
      <Input
        type="date"
        id={id}
        className={`${className} h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
        {...props}
      />
      {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
    </div>
  );
}

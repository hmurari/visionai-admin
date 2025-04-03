import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ButtonGroupOption {
  value: string;
  label: string;
}

interface ButtonGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: ButtonGroupOption[];
  className?: string;
}

export function ButtonGroup({ value, onChange, options, className }: ButtonGroupProps) {
  return (
    <div className={cn("flex space-x-1 rounded-md border p-1", className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(option.value)}
          className="flex-1"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
} 
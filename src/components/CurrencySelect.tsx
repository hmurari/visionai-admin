import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
  rate?: number;
}

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CurrencyOption[];
  placeholder?: string;
}

export function CurrencySelect({
  value,
  onChange,
  options,
  placeholder = "Select currency"
}: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center">
              <span className="mr-2">{option.symbol}</span>
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 
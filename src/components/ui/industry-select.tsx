import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Industry list with common industries and manufacturing sectors
export const industries = [
  // Technology and IT
  { id: "technology", name: "Technology & IT" },
  { id: "software", name: "Software Development" },
  { id: "hardware", name: "Hardware & Electronics" },
  { id: "telecommunications", name: "Telecommunications" },
  { id: "cybersecurity", name: "Cybersecurity" },
  
  // Manufacturing sectors
  { id: "manufacturing", name: "General Manufacturing" },
  { id: "automotive", name: "Automotive Manufacturing" },
  { id: "aerospace", name: "Aerospace & Defense" },
  { id: "food_beverage", name: "Food & Beverage Manufacturing" },
  { id: "chemical", name: "Chemical Manufacturing" },
  { id: "pharmaceutical", name: "Pharmaceutical Manufacturing" },
  { id: "electronics", name: "Electronics Manufacturing" },
  { id: "textile", name: "Textile & Apparel Manufacturing" },
  { id: "metal", name: "Metal & Steel Manufacturing" },
  { id: "plastics", name: "Plastics & Rubber Manufacturing" },
  { id: "machinery", name: "Machinery & Equipment" },
  { id: "furniture", name: "Furniture Manufacturing" },
  { id: "paper", name: "Paper & Packaging" },
  { id: "medical_devices", name: "Medical Devices Manufacturing" },
  
  // Logistics and Warehousing
  { id: "warehousing", name: "Warehousing & Storage" },
  { id: "transportation", name: "Transportation & Logistics" },
  { id: "supply_chain", name: "Supply Chain Management" },
  
  // Other industries
  { id: "healthcare", name: "Healthcare & Medical" },
  { id: "finance", name: "Finance & Banking" },
  { id: "insurance", name: "Insurance" },
  { id: "retail", name: "Retail & E-commerce" },
  { id: "education", name: "Education" },
  { id: "government", name: "Government & Public Sector" },
  { id: "construction", name: "Construction & Engineering" },
  { id: "energy", name: "Energy & Utilities" },
  { id: "oil_gas", name: "Oil & Gas" },
  { id: "mining", name: "Mining & Resources" },
  { id: "hospitality", name: "Hospitality & Tourism" },
  { id: "media", name: "Media & Entertainment" },
  { id: "agriculture", name: "Agriculture & Farming" },
  { id: "consulting", name: "Consulting & Professional Services" },
  { id: "legal", name: "Legal Services" },
  { id: "nonprofit", name: "Nonprofit & NGO" },
  { id: "real_estate", name: "Real Estate & Property" },
  { id: "other", name: "Other" },
];

interface IndustrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function IndustrySelect({
  value,
  onChange,
  placeholder = "Select an industry",
  disabled = false,
  className,
}: IndustrySelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter industries based on search query
  const filteredIndustries = industries.filter((industry) => {
    const query = searchQuery.toLowerCase();
    return industry.name.toLowerCase().includes(query) || 
           industry.id.toLowerCase().includes(query);
  });

  // Get display value for the button
  const getDisplayValue = () => {
    if (!value) return placeholder;
    const industry = industries.find((i) => i.id === value);
    return industry ? industry.name : placeholder;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search industry..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandEmpty>No industry found.</CommandEmpty>
          <CommandList>
            <ScrollArea className="h-[300px]">
              <CommandGroup>
                {filteredIndustries.map((industry) => (
                  <CommandItem
                    key={industry.id}
                    value={industry.name}
                    onSelect={() => {
                      onChange(industry.id);
                      setOpen(false);
                    }}
                    className="flex items-center"
                  >
                    <span>{industry.name}</span>
                    {value === industry.id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 
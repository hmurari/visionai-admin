import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerSearchProps {
  onSelect: (customer: any) => void;
  onCreateNew?: () => void;
  placeholder?: string;
  buttonText?: string;
}

export function CustomerSearch({ 
  onSelect, 
  onCreateNew = () => {},
  placeholder = "Search customers...",
  buttonText = "Select customer"
}: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Get all customers
  const customers = useQuery(api.customers.list) || [];
  
  // Filter customers based on search term
  const filteredCustomers = searchTerm 
    ? customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
          (customer.companyName && customer.companyName.toLowerCase().includes(searchLower)) ||
          (customer.email && customer.email.toLowerCase().includes(searchLower))
        );
      })
    : customers;
  
  const handleSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setOpen(false);
    onSelect(customer);
  };
  
  const handleCreateNew = () => {
    setOpen(false);
    if (onCreateNew) {
      onCreateNew();
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer ? (
            <span>{selectedCustomer.companyName} ({selectedCustomer.name})</span>
          ) : (
            <span>{buttonText}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={placeholder} 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-3 px-4 text-center">
                <p className="text-sm text-gray-500">No customers found</p>
                <Button 
                  variant="ghost" 
                  className="mt-2 w-full"
                  onClick={handleCreateNew}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create new customer
                </Button>
              </div>
            </CommandEmpty>
            {filteredCustomers.length > 0 && (
              <CommandGroup heading="Customers">
                {filteredCustomers.map((customer) => (
                  <CommandItem
                    key={customer._id}
                    value={customer.companyName || customer.name || ""}
                    onSelect={() => handleSelect(customer)}
                    className="flex items-center"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{customer.companyName}</p>
                      <p className="text-sm text-gray-500">{customer.name} • {customer.email}</p>
                    </div>
                    {selectedCustomer?._id === customer._id && (
                      <Check className="ml-2 h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <div className="border-t p-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={handleCreateNew}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create new customer
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 
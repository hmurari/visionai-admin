import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Check, Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CustomerSelect({ value, onChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch customers
  const customers = useQuery(api.customers.list) || [];
  
  // Filter customers based on search term
  const filteredCustomers = searchTerm
    ? customers.filter(customer => 
        customer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1.5 h-7 w-7"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[200px] rounded-md border">
        <div className="p-1">
          {filteredCustomers.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No customers found
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <Button
                key={customer._id}
                variant="ghost"
                className={`w-full justify-start text-left mb-1 ${value?._id === customer._id ? 'bg-muted' : ''}`}
                onClick={() => onChange(customer)}
              >
                <Building className="mr-2 h-4 w-4" />
                <span className="truncate">{customer.companyName || customer.name}</span>
                {value?._id === customer._id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
      
      {value && (
        <div className="flex items-center justify-between p-2 border rounded-md bg-muted">
          <div className="flex items-center">
            <Building className="mr-2 h-4 w-4" />
            <span className="font-medium">{value.companyName || value.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 
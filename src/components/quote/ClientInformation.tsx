import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CustomerSearch } from '@/components/CustomerSearch';

interface ClientInfo {
  name: string;
  company: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface ClientInformationProps {
  clientInfo: ClientInfo;
  onClientInfoChange: (field: string, value: string) => void;
  selectedCustomer: any;
  onCustomerSelect: (customer: any) => void;
  onCreateCustomer: () => void;
  isAdmin?: boolean;
}

export function ClientInformation({
  clientInfo,
  onClientInfoChange,
  selectedCustomer,
  onCustomerSelect,
  onCreateCustomer,
  isAdmin = false
}: ClientInformationProps) {
  
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onClientInfoChange(field, e.target.value);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Client Information</h3>
      
      <div className="mb-4">
        <Label htmlFor="customer">Customer</Label>
        <CustomerSearch
          onSelect={onCustomerSelect}
          onCreateNew={onCreateCustomer}
          placeholder={isAdmin ? "Search all customers..." : "Search for a customer..."}
          buttonText={selectedCustomer ? `${selectedCustomer.companyName} (${selectedCustomer.name})` : "Select a customer"}
          isAdmin={isAdmin}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client-name">Client Name</Label>
          <Input
            id="client-name"
            value={clientInfo.name}
            onChange={handleChange('name')}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={clientInfo.company}
            onChange={handleChange('company')}
            className="mt-1"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={clientInfo.address}
          onChange={handleChange('address')}
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={clientInfo.city}
            onChange={handleChange('city')}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={clientInfo.state}
            onChange={handleChange('state')}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            value={clientInfo.zip}
            onChange={handleChange('zip')}
            className="mt-1"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={clientInfo.email}
          onChange={handleChange('email')}
          className="mt-1"
        />
      </div>
    </div>
  );
} 
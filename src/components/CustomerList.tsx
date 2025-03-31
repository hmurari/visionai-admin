import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  Check,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { countries } from "@/components/ui/country-select";
import { industries } from "@/components/ui/industry-select";
import { CountrySelect } from "@/components/ui/country-select";
import { IndustrySelect } from "@/components/ui/industry-select";
import { toast } from "sonner";

interface CustomerListProps {
  customers: any[];
  onEdit: (customer: any) => void;
  onDelete: (customerId: string) => void;
}

export function CustomerList({ customers, onEdit, onDelete }: CustomerListProps) {
  const [editingField, setEditingField] = useState<{
    customerId: string;
    field: string;
  } | null>(null);
  
  const [editValue, setEditValue] = useState<string>("");
  
  // Mutation for updating customer fields
  const updateCustomerField = useMutation(api.customers.updateField);
  
  // Helper functions
  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  const getIndustryName = (id: string) => {
    const industry = industries.find(i => i.id === id);
    return industry ? industry.name : id;
  };
  
  // Start editing a field
  const startEditing = (customerId: string, field: string, currentValue: string) => {
    setEditingField({ customerId, field });
    setEditValue(currentValue);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    setEditValue("");
  };
  
  // Save edited field
  const saveField = async () => {
    if (!editingField) return;
    
    try {
      await updateCustomerField({
        id: editingField.customerId,
        field: editingField.field,
        value: editValue
      });
      
      toast.success(`Customer ${editingField.field} updated`);
      setEditingField(null);
    } catch (error) {
      console.error("Error updating field:", error);
      toast.error("Failed to update customer");
    }
  };
  
  // Handle key press in input fields
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveField();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };
  
  // Render edit field based on field type
  const renderEditField = (customer: any) => {
    if (!editingField) return null;
    
    // Common action buttons to be placed above the input fields
    const actionButtons = (
      <div className="flex space-x-1 mb-1 justify-end">
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveField}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={cancelEditing}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
    
    switch (editingField.field) {
      case 'email':
        return (
          <div className="min-w-[200px]">
            {actionButtons}
            <div className="flex items-center">
              <div className="flex-shrink-0 w-6">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 min-w-[150px]"
                type="email"
                autoFocus
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>
        );
        
      case 'phone':
        return (
          <div className="min-w-[200px]">
            {actionButtons}
            <div className="flex items-center">
              <div className="flex-shrink-0 w-6">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8 min-w-[150px]"
                type="tel"
                autoFocus
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>
        );
        
      case 'country':
        return (
          <div className="min-w-[250px]">
            {actionButtons}
            <div className="flex items-center">
              <div className="flex-shrink-0 w-6">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <div className="w-full">
                <CountrySelect
                  value={editValue}
                  onChange={(value) => setEditValue(value)}
                  onEscape={cancelEditing}
                />
              </div>
            </div>
          </div>
        );
        
      case 'industry':
        return (
          <div className="min-w-[250px]">
            {actionButtons}
            <div className="flex items-center">
              <div className="flex-shrink-0 w-6">
                <Briefcase className="h-4 w-4 text-gray-400" />
              </div>
              <div className="w-full">
                <IndustrySelect
                  value={editValue}
                  onChange={(value) => setEditValue(value)}
                  onEscape={cancelEditing}
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-hidden">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">Company</TableHead>
              <TableHead className="w-[20%]">Email</TableHead>
              <TableHead className="w-[20%]">Phone</TableHead>
              <TableHead className="w-[20%]">Location</TableHead>
              <TableHead className="w-[20%]">Industry</TableHead>
              <TableHead className="w-[5%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell className="font-medium h-[72px]">
                  <div 
                    className="flex flex-col cursor-pointer"
                    onClick={() => onEdit(customer)}
                  >
                    <div className="flex items-center hover:text-blue-600">
                      <div className="flex-shrink-0 w-6">
                        <Building className="h-4 w-4 text-gray-400" />
                      </div>
                      <span className="font-medium">{customer.companyName}</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-400 hover:text-blue-600 pl-6">
                      <User className="h-3 w-3 text-gray-400 mr-1" />
                      {customer.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[200px] h-[72px]">
                  {editingField?.customerId === customer._id && editingField?.field === 'email' ? (
                    renderEditField(customer)
                  ) : (
                    <div 
                      className="flex items-center cursor-pointer hover:text-blue-600 h-full"
                      onClick={() => startEditing(customer._id, 'email', customer.email)}
                    >
                      <div className="flex-shrink-0 w-6">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      {customer.email}
                    </div>
                  )}
                </TableCell>
                <TableCell className="min-w-[200px] h-[72px]">
                  {editingField?.customerId === customer._id && editingField?.field === 'phone' ? (
                    renderEditField(customer)
                  ) : (
                    customer.phone ? (
                      <div 
                        className="flex items-center cursor-pointer hover:text-blue-600 h-full"
                        onClick={() => startEditing(customer._id, 'phone', customer.phone)}
                      >
                        <div className="flex-shrink-0 w-6">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        {customer.phone}
                      </div>
                    ) : (
                      <div 
                        className="text-gray-400 cursor-pointer hover:text-blue-600 h-full flex items-center"
                        onClick={() => startEditing(customer._id, 'phone', '')}
                      >
                        <div className="flex-shrink-0 w-6">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        Add phone
                      </div>
                    )
                  )}
                </TableCell>
                <TableCell className="min-w-[250px] h-[72px]">
                  {editingField?.customerId === customer._id && editingField?.field === 'country' ? (
                    renderEditField(customer)
                  ) : (
                    customer.city || customer.state || customer.country ? (
                      <div 
                        className="flex items-center cursor-pointer hover:text-blue-600 h-full"
                        onClick={() => startEditing(customer._id, 'country', customer.country || '')}
                      >
                        <div className="flex-shrink-0 w-6">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        {[
                          customer.city, 
                          customer.state,
                          customer.country ? getCountryName(customer.country) : null
                        ].filter(Boolean).join(", ")}
                      </div>
                    ) : (
                      <div 
                        className="text-gray-400 cursor-pointer hover:text-blue-600 h-full flex items-center"
                        onClick={() => startEditing(customer._id, 'country', '')}
                      >
                        <div className="flex-shrink-0 w-6">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        Add location
                      </div>
                    )
                  )}
                </TableCell>
                <TableCell className="min-w-[250px] h-[72px]">
                  {editingField?.customerId === customer._id && editingField?.field === 'industry' ? (
                    renderEditField(customer)
                  ) : (
                    customer.industry ? (
                      <div 
                        className="flex items-center cursor-pointer hover:text-blue-600 h-full"
                        onClick={() => startEditing(customer._id, 'industry', customer.industry)}
                      >
                        <div className="flex-shrink-0 w-6">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                        </div>
                        {getIndustryName(customer.industry)}
                      </div>
                    ) : (
                      <div 
                        className="text-gray-400 cursor-pointer hover:text-blue-600 h-full flex items-center"
                        onClick={() => startEditing(customer._id, 'industry', '')}
                      >
                        <div className="flex-shrink-0 w-6">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                        </div>
                        Add industry
                      </div>
                    )
                  )}
                </TableCell>
                <TableCell className="text-right h-[72px]">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(customer)}
                      title="Edit customer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(customer._id)}
                      title="Delete customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
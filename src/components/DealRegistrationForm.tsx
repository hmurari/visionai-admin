import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, ArrowRight, User, Building } from "lucide-react";
import { CustomerSearch } from "@/components/CustomerSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerForm } from "@/components/CustomerForm";

// Define the use case options
const usecaseOptions = [
  "PPE Compliance",
  "Area Controls",
  "Forklift Safety",
  "Emergency Events",
  "Hazard Warnings",
  "Behavioral Safety",
  "Mobile Phone Compliance",
  "Staircase Safety",
  "Housekeeping",
  "Headcounts",
  "Occupancy Metrics",
  "Spills & Leaks Detection"
];

export function DealRegistrationForm({ 
  isOpen, 
  onClose, 
  editingDeal = null, 
  initialData = null,
  onSuccess = () => {},
  isAdmin = false
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSelected, setCustomerSelected] = useState(!!initialData?.companyName);
  const [activeTab, setActiveTab] = useState("customer");
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  
  // Initialize form data with initialData or defaults
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || "",
    contactName: initialData?.contactName || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    customerAddress: initialData?.customerAddress || "",
    customerCity: initialData?.customerCity || "",
    customerState: initialData?.customerState || "",
    customerZip: initialData?.customerZip || "",
    customerCountry: initialData?.customerCountry || "",
    opportunityAmount: initialData?.opportunityAmount || "",
    expectedCloseDate: initialData?.expectedCloseDate || new Date().toISOString().split('T')[0],
    lastFollowup: initialData?.lastFollowup || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || "",
    status: initialData?.status || "new",
    cameraCount: initialData?.cameraCount || "",
    interestedUsecases: initialData?.interestedUsecases || [],
    commissionRate: initialData?.commissionRate || 20,
  });
  
  // Effect to update customer selected state when initialData changes
  useEffect(() => {
    if (initialData?.companyName) {
      setCustomerSelected(true);
      // If we have initial data, start on the deal tab
      setActiveTab("deal");
    }
  }, [initialData]);
  
  // Mutations
  const registerDeal = useMutation(api.deals.registerDeal);
  const updateDeal = useMutation(isAdmin ? api.admin.updateDeal : api.deals.updateDeal);
  
  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setCustomerSelected(true);
    setFormData({
      ...formData,
      companyName: customer.companyName || "",
      contactName: customer.name || "",
      contactEmail: customer.email || "",
      contactPhone: customer.phone || "",
      customerAddress: customer.address || "",
      customerCity: customer.city || "",
      customerState: customer.state || "",
      customerZip: customer.zip || "",
      customerCountry: customer.country || "",
    });
    
    // Automatically switch to deal tab after customer selection
    setActiveTab("deal");
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle checkbox changes for use cases
  const handleCheckboxChange = (usecase) => {
    const updatedUsecases = formData.interestedUsecases.includes(usecase)
      ? formData.interestedUsecases.filter(item => item !== usecase)
      : [...formData.interestedUsecases, usecase];
    
    setFormData({
      ...formData,
      interestedUsecases: updatedUsecases,
    });
  };
  
  // Validate customer information
  const validateCustomerInfo = () => {
    return (
      formData.companyName.trim() !== "" &&
      formData.contactName.trim() !== "" &&
      formData.contactEmail.trim() !== ""
    );
  };
  
  // Validate deal information
  const validateDealInfo = () => {
    return (
      formData.opportunityAmount.trim() !== "" &&
      formData.expectedCloseDate.trim() !== ""
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCustomerInfo() || !validateDealInfo()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Only include fields that the API expects
      const payload = {
        customerName: formData.companyName,
        contactName: formData.contactName,
        customerEmail: formData.contactEmail,
        customerPhone: formData.contactPhone,
        customerAddress: formData.customerAddress,
        customerCity: formData.customerCity,
        customerState: formData.customerState,
        customerZip: formData.customerZip,
        customerCountry: formData.customerCountry,
        opportunityAmount: parseFloat(formData.opportunityAmount),
        expectedCloseDate: new Date(formData.expectedCloseDate).getTime(),
        notes: formData.notes,
        cameraCount: formData.cameraCount ? parseInt(formData.cameraCount) : undefined,
        interestedUsecases: formData.interestedUsecases,
        lastFollowup: formData.lastFollowup ? new Date(formData.lastFollowup).getTime() : undefined,
        status: formData.status,
      };
      
      // Only include commissionRate if it's set and the user is an admin
      if (isAdmin && formData.commissionRate) {
        payload.commissionRate = parseFloat(formData.commissionRate);
      }
      
      if (editingDeal) {
        // Update existing deal
        if (isAdmin) {
          await updateDeal({
            dealId: editingDeal, // Use dealId for admin
            ...payload
          });
        } else {
          await updateDeal({
            id: editingDeal, // Use id for partners
            ...payload
          });
        }
        toast({
          title: "Deal Updated",
          description: "The deal has been updated successfully.",
        });
      } else {
        // Register new deal
        await registerDeal(payload);
        toast({
          title: "Deal Registered",
          description: "The deal has been registered successfully.",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error("Error submitting deal:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting the deal.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle opening the customer form
  const handleOpenCustomerForm = () => {
    setCustomerFormOpen(true);
  };
  
  // Handle customer creation success
  const handleCustomerCreated = (customer) => {
    setCustomerFormOpen(false);
    if (customer) {
      handleCustomerSelect(customer);
    }
  };
  
  return (
    <>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {editingDeal ? "Edit Deal Registration" : "Register New Deal"}
          </DialogTitle>
          <DialogDescription>
            Enter customer and deal information to register a new opportunity.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer Information</TabsTrigger>
              <TabsTrigger value="deal" disabled={!validateCustomerInfo()}>Deal Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer" className="space-y-4 pt-2">
              {/* Customer Search Section */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Find Existing Customer</h3>
                <CustomerSearch
                  onSelect={handleCustomerSelect}
                  onCreateNew={handleOpenCustomerForm}
                  placeholder="Search for a customer..."
                  buttonText={customerSelected ? formData.companyName : "Select a customer"}
                />
                {customerSelected && (
                  <div className="mt-3 text-sm text-blue-700">
                    <p>Selected: <strong>{formData.companyName}</strong> ({formData.contactName})</p>
                  </div>
                )}
              </div>
              
              {/* Customer Information Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Customer Information</h3>
                  {customerSelected && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setCustomerSelected(false);
                        setFormData({
                          ...formData,
                          companyName: "",
                          contactName: "",
                          contactEmail: "",
                          contactPhone: "",
                          customerAddress: "",
                          customerCity: "",
                          customerState: "",
                          customerZip: "",
                          customerCountry: "",
                        });
                      }}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
                
                {/* Company Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Name *</label>
                    <Input
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Enter contact name"
                      required
                    />
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email *</label>
                    <Input
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="Enter contact email"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <Input
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="Enter contact phone"
                    />
                  </div>
                </div>
                
                {/* Address Information */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Input
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    placeholder="Enter street address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <Input
                      name="customerCity"
                      value={formData.customerCity}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">State/Province</label>
                    <Input
                      name="customerState"
                      value={formData.customerState}
                      onChange={handleChange}
                      placeholder="Enter state or province"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <Input
                      name="customerZip"
                      value={formData.customerZip}
                      onChange={handleChange}
                      placeholder="Enter postal code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Input
                      name="customerCountry"
                      value={formData.customerCountry}
                      onChange={handleChange}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="button" 
                  onClick={() => setActiveTab("deal")}
                  disabled={!validateCustomerInfo()}
                >
                  Next: Deal Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="deal" className="space-y-6 pt-2">
              {/* Customer Badge */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    <div>
                      <span className="font-medium">{formData.companyName}</span>
                      {formData.contactName && (
                        <span className="ml-2 text-sm text-gray-600">
                          Contact: {formData.contactName}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    onClick={() => setActiveTab("customer")}
                  >
                    Change Customer
                  </Button>
                </div>
              </div>
              
              {/* Row 1: Opportunity Amount and Commission Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Opportunity Amount *</label>
                  <Input
                    name="opportunityAmount"
                    value={formData.opportunityAmount}
                    onChange={handleChange}
                    placeholder="$10000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
                  <Input
                    name="commissionRate"
                    type="number"
                    value={formData.commissionRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    disabled={!isAdmin}
                  />
                  {!isAdmin && (
                    <p className="text-xs text-gray-500 mt-1">
                      Standard rate: 20%
                    </p>
                  )}
                </div>
              </div>
              
              {/* Row 2: Expected Close Date and Last Follow-up Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Close Date *</label>
                  <Input
                    name="expectedCloseDate"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Last Follow-up Date</label>
                  <Input
                    name="lastFollowup"
                    type="date"
                    value={formData.lastFollowup}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Row 3: Camera Count, Status, and Notes */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Camera Count</label>
                  <Input
                    name="cameraCount"
                    type="number"
                    value={formData.cameraCount}
                    onChange={handleChange}
                    placeholder="Number of cameras"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      {isAdmin && <SelectItem value="registered">Registered</SelectItem>}
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Use Cases Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Interested Use Cases</label>
                <div className="grid grid-cols-2 gap-2 mt-1 border rounded-md p-3 bg-gray-50">
                  {usecaseOptions.map(usecase => (
                    <div key={usecase} className="flex items-center space-x-2">
                      <Checkbox
                        id={`usecase-${usecase}`}
                        checked={formData.interestedUsecases.includes(usecase)}
                        onCheckedChange={() => handleCheckboxChange(usecase)}
                      />
                      <label
                        htmlFor={`usecase-${usecase}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {usecase}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notes Section */}
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional notes about this opportunity"
                  rows={3}
                />
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("customer")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Customer
                </Button>
                <Button type="submit" disabled={isSubmitting || !validateDealInfo()}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingDeal ? "Updating..." : "Registering..."}
                    </>
                  ) : (
                    editingDeal ? "Update Deal" : "Register Deal"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
      
      {/* Add the CustomerForm component */}
      <CustomerForm
        isOpen={customerFormOpen}
        onClose={() => setCustomerFormOpen(false)}
        onSuccess={handleCustomerCreated}
      />
    </>
  );
} 
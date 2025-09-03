import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, ArrowRight, User, Building, Users } from "lucide-react";
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
  
  // Get approved partners for admin assignment
  const partners = isAdmin ? useQuery(api.admin.getAllUsers) || [] : [];
  const approvedPartners = partners.filter(user => user.role === "partner");
  
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
    assignedPartnerId: initialData?.partnerId || "",
    assignmentNotes: initialData?.assignmentNotes || "",
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
  const assignExistingDeal = useMutation(api.admin.assignExistingDeal);
  
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
        commissionRate: undefined as number | undefined,
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
        
        // Handle assignment separately if admin is assigning
        if (isAdmin && formData.assignedPartnerId && formData.assignedPartnerId !== initialData?.partnerId) {
          await assignExistingDeal({
            dealId: editingDeal,
            partnerId: formData.assignedPartnerId,
            assignmentNotes: formData.assignmentNotes,
          });
        }
        
        toast({
          title: "Deal Updated",
          description: "The deal has been updated successfully.",
        });
      } else {
        // Register new deal
        const newDealId = await registerDeal(payload);
        
        // Handle assignment if admin is creating and assigning in one step
        if (isAdmin && formData.assignedPartnerId && newDealId) {
          await assignExistingDeal({
            dealId: newDealId,
            partnerId: formData.assignedPartnerId,
            assignmentNotes: formData.assignmentNotes,
          });
          toast({
            title: "Deal Created & Assigned",
            description: `The deal has been created and assigned to the selected partner.`,
          });
        } else {
          toast({
            title: "Deal Registered",
            description: "The deal has been registered successfully.",
          });
        }
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingDeal ? "Edit Deal Registration" : "Register New Deal"}
          </DialogTitle>
          <DialogDescription>
            Enter customer and deal information to register a new opportunity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="deal" disabled={!validateCustomerInfo()}>Deal Details</TabsTrigger>
                <TabsTrigger value="reseller" disabled={!validateCustomerInfo() || !validateDealInfo()}>
                  {isAdmin ? "Reseller" : "Review"}
                </TabsTrigger>
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
                    isAdmin={isAdmin}
                  />
                  {customerSelected && (
                    <div className="mt-3 text-sm text-blue-700">
                      <p>Selected: <strong>{formData.companyName}</strong> ({formData.contactName})</p>
                    </div>
                  )}
                </div>
                
                {/* Customer Information Section */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Customer Details</h3>
                  
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
                      placeholder="Enter full address"
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
                        placeholder="Enter state/province"
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
              
              <TabsContent value="deal" className="space-y-4 pt-2">
                {/* Deal Information */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Deal Details</h3>
                  
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
                  <div className="grid grid-cols-2 gap-4 mt-4">
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

                  {/* Row 3: Camera Count and Status */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Number of Cameras</label>
                      <Input
                        name="cameraCount"
                        type="number"
                        value={formData.cameraCount}
                        onChange={handleChange}
                        placeholder="e.g., 10"
                        min="1"
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
                          <SelectItem value="1st_call">1st Call</SelectItem>
                          <SelectItem value="2plus_calls">2+ Calls</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Use Cases */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Interested Use Cases</label>
                    <div className="grid grid-cols-2 gap-2">
                      {usecaseOptions.map((useCase) => (
                        <label key={useCase} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.interestedUsecases.includes(useCase)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  interestedUsecases: [...prev.interestedUsecases, useCase]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  interestedUsecases: prev.interestedUsecases.filter(uc => uc !== useCase)
                                }));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{useCase}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Deal Notes</label>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional notes about this deal..."
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("customer")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customer
                  </Button>
                  {isAdmin ? (
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("reseller")}
                      disabled={!validateDealInfo()}
                    >
                      Next: Reseller Assignment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
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
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reseller" className="space-y-4 pt-2">
                {isAdmin ? (
                  <>
                    {/* Admin Assignment Section */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="text-sm font-medium text-purple-800 mb-3">Partner Assignment</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Assign to Partner</label>
                          <Select
                            value={formData.assignedPartnerId || "none"}
                            onValueChange={(value) => handleSelectChange("assignedPartnerId", value === "none" ? "" : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a partner to assign this deal" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Don't assign to anyone</SelectItem>
                              {approvedPartners.map((partner) => (
                                <SelectItem key={partner.tokenIdentifier} value={partner.tokenIdentifier}>
                                  {partner.companyName || "Unknown Company"} - {partner.name || partner.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {formData.assignedPartnerId && formData.assignedPartnerId !== "" && (
                          <div>
                            <label className="block text-sm font-medium mb-1">Assignment Notes</label>
                            <Textarea
                              name="assignmentNotes"
                              value={formData.assignmentNotes}
                              onChange={handleChange}
                              placeholder="Why are you assigning this deal to this partner?"
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                      
                      {formData.assignedPartnerId && formData.assignedPartnerId !== "" && (
                        <div className="mt-3 text-xs text-purple-700">
                          <p>This deal will be assigned to the selected partner after creation/update.</p>
                        </div>
                      )}
                    </div>

                    {/* Form Actions for Admin */}
                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("deal")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Deal Details
                      </Button>
                      <Button type="submit" disabled={isSubmitting || !validateDealInfo()}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingDeal ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          editingDeal ? "Update Deal" : "Create & Assign Deal"
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Review section for non-admin users */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-sm font-medium text-gray-800 mb-3">Review Your Deal</h3>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Customer</p>
                            <p className="text-sm font-medium">{formData.companyName}</p>
                            <p className="text-xs text-gray-600">{formData.contactName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Opportunity Amount</p>
                            <p className="text-sm font-medium">${parseFloat(formData.opportunityAmount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Expected Close</p>
                            <p className="text-sm">{formData.expectedCloseDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <p className="text-sm">{formData.status}</p>
                          </div>
                        </div>

                        {formData.interestedUsecases?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Use Cases</p>
                            <div className="flex flex-wrap gap-1">
                              {formData.interestedUsecases.map((useCase, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {useCase}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form Actions for Partners */}
                    <div className="flex justify-between pt-2">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("deal")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Deal Details
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
                  </>
                )}
              </TabsContent>
            </Tabs>
          </form>
        </div>
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
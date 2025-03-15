import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(1);
  
  // Initialize form data
  const defaultFormData = {
    // Step 1: Company & Contact Details
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    customerAddress: "",
    customerCity: "",
    customerState: "",
    customerZip: "",
    customerCountry: "",
    
    // Step 2: Deal Details
    opportunityAmount: "",
    expectedCloseDate: "",
    lastFollowup: new Date().toISOString().split('T')[0],
    approvalStatus: "new", // Registration status - New or Registered
    progressStatus: "new", // Progress stage - New, In Progress, Won, Lost
    cameraCount: "",
    interestedUsecases: [],
    notes: ""
  };
  
  // Map old field names to new ones for backward compatibility
  const mapOldFieldsToNew = (data) => {
    if (!data) return defaultFormData;
    
    return {
      ...data,
      // Map customer fields to contact fields if needed
      companyName: data.companyName || data.customerName || "",
      contactName: data.contactName || data.customerName || "",
      contactEmail: data.contactEmail || data.customerEmail || "",
      contactPhone: data.contactPhone || data.customerPhone || "",
      // Ensure status fields are set
      approvalStatus: data.approvalStatus || "new",
      progressStatus: data.progressStatus || "new",
    };
  };
  
  const [formData, setFormData] = useState(
    mapOldFieldsToNew(initialData)
  );
  
  // Mutations
  const registerDeal = useMutation(api.deals.registerDeal);
  const updateDeal = useMutation(isAdmin ? api.admin.updateDeal : api.deals.updateDeal);
  
  // Navigation between steps
  const goToNextStep = () => {
    setCurrentStep(2);
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(1);
  };
  
  // Form validation
  const validateStep1 = () => {
    if (!formData.companyName.trim()) return false;
    if (!formData.contactName.trim()) return false;
    if (!formData.contactEmail.trim()) return false;
    return true;
  };
  
  const validateStep2 = () => {
    if (!formData.opportunityAmount) return false;
    if (!formData.expectedCloseDate) return false;
    return true;
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format opportunity amount to remove non-numeric characters except for the first $
    if (name === "opportunityAmount") {
      // Remove all non-numeric characters except the first $
      let formattedValue = value.replace(/[^0-9$]/g, "");
      
      // Ensure only one $ at the beginning
      formattedValue = formattedValue.replace(/\$/g, "");
      if (formattedValue) {
        formattedValue = "$" + formattedValue;
      }
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle checkbox changes for use cases
  const handleCheckboxChange = (usecase) => {
    setFormData(prev => {
      const currentUsecases = prev.interestedUsecases || [];
      if (currentUsecases.includes(usecase)) {
        return {
          ...prev,
          interestedUsecases: currentUsecases.filter(item => item !== usecase)
        };
      } else {
        return {
          ...prev,
          interestedUsecases: [...currentUsecases, usecase]
        };
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Extract numeric value from opportunity amount (remove $ and commas)
      const amountString = formData.opportunityAmount.replace(/[$,]/g, "");
      const amount = parseInt(amountString, 10);
      const closeDate = new Date(formData.expectedCloseDate).getTime();
      const lastFollowup = formData.lastFollowup ? new Date(formData.lastFollowup).getTime() : Date.now();
      const cameraCount = formData.cameraCount ? parseInt(formData.cameraCount, 10) : 0;
      
      if (isNaN(amount)) {
        throw new Error("Please enter a valid opportunity amount");
      }
      
      if (isNaN(closeDate)) {
        throw new Error("Please enter a valid expected close date");
      }
      
      const dealData = {
        // Map new field names to backend field names
        customerName: formData.companyName,
        customerEmail: formData.contactEmail,
        customerPhone: formData.contactPhone || "",
        contactName: formData.contactName || "",
        customerAddress: formData.customerAddress || "",
        customerCity: formData.customerCity || "",
        customerState: formData.customerState || "",
        customerZip: formData.customerZip || "",
        customerCountry: formData.customerCountry || "",
        opportunityAmount: amount,
        expectedCloseDate: closeDate,
        lastFollowup,
        cameraCount,
        approvalStatus: formData.approvalStatus || "new",
        progressStatus: formData.progressStatus || "new",
        interestedUsecases: formData.interestedUsecases,
        notes: formData.notes || ""
      };
      
      if (editingDeal) {
        // Update existing deal
        if (isAdmin) {
          await updateDeal({
            dealId: editingDeal,
            ...dealData
          });
        } else {
          await updateDeal({
            id: editingDeal,
            ...dealData
          });
        }
        
        toast({
          title: "Deal Updated",
          description: "The deal has been successfully updated.",
          variant: "success",
        });
      } else {
        // Register new deal
        await registerDeal(dealData);
        
        toast({
          title: "Deal Registered",
          description: "Your deal has been successfully registered.",
          variant: "success",
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "There was an error processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {editingDeal ? "Edit Deal" : "Register New Deal"}
        </DialogTitle>
        <DialogDescription>
          {currentStep === 1 
            ? "Enter company and contact information" 
            : "Provide details about the opportunity"}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {currentStep === 1 ? (
          <div className="space-y-4">
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
                placeholder="Enter contact phone number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                placeholder="Enter street address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  name="customerCity"
                  value={formData.customerCity}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">State/Province</label>
                <Input
                  name="customerState"
                  value={formData.customerState}
                  onChange={handleChange}
                  placeholder="State/Province"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Postal/ZIP Code</label>
                <Input
                  name="customerZip"
                  value={formData.customerZip}
                  onChange={handleChange}
                  placeholder="ZIP/Postal code"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Input
                  name="customerCountry"
                  value={formData.customerCountry}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Opportunity Amount *</label>
              <Input
                name="opportunityAmount"
                value={formData.opportunityAmount}
                onChange={handleChange}
                placeholder="$0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Number of Cameras</label>
              <Input
                name="cameraCount"
                type="number"
                value={formData.cameraCount}
                onChange={handleChange}
                placeholder="Enter number of cameras"
              />
            </div>
            
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Registration Status</label>
                <Select 
                  value={formData.approvalStatus} 
                  onValueChange={(value) => handleSelectChange("approvalStatus", value)}
                  disabled={!isAdmin}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="registered">Registered</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {isAdmin ? "As admin, you can change the registration status" : "This is managed by Visionify admins"}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Progress Stage</label>
                <Select 
                  value={formData.progressStatus} 
                  onValueChange={(value) => handleSelectChange("progressStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Interested Use Cases</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1 border rounded-md p-3">
                {usecaseOptions.map(usecase => (
                  <div key={usecase} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`usecase-${usecase}`}
                      checked={formData.interestedUsecases?.includes(usecase)}
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
            
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional details about this opportunity..."
                rows={3}
              />
            </div>
          </div>
        )}
        
        <DialogFooter className="flex justify-between">
          {currentStep === 1 ? (
            <div className="w-full flex justify-end">
              <Button 
                type="button" 
                onClick={goToNextStep}
                disabled={!validateStep1()}
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={goToPreviousStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || !validateStep2()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingDeal ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  editingDeal ? "Update Deal" : "Register Deal"
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </form>
    </DialogContent>
  );
} 
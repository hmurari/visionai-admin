import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DealCard } from "@/components/DealCard";

export default function DealRegistration() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  
  const initialFormData = {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    opportunityAmount: "",
    expectedCloseDate: "",
    notes: "",
    status: "pending",
    dealStage: "new",
    lastFollowup: new Date().toISOString().split('T')[0],
    cameraCount: "",
    interestedUsecases: []
  };
  
  const [formData, setFormData] = useState(initialFormData);
  
  const registerDeal = useMutation(api.deals.registerDeal);
  const updateDeal = useMutation(api.deals.updateDeal);
  const deleteDeal = useMutation(api.deals.deleteDeal);
  const deals = useQuery(api.deals.getPartnerDeals) || [];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const openNewDealDialog = () => {
    setFormData(initialFormData);
    setEditingDeal(null);
    setIsDialogOpen(true);
  };
  
  const openEditDealDialog = (deal) => {
    setFormData({
      customerName: deal.customerName,
      customerEmail: deal.customerEmail,
      customerPhone: deal.customerPhone || "",
      customerAddress: deal.customerAddress || "",
      opportunityAmount: deal.opportunityAmount.toString(),
      expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0],
      notes: deal.notes || "",
      status: deal.status || "pending",
      dealStage: deal.dealStage || "initial",
      lastFollowup: deal.lastFollowup ? new Date(deal.lastFollowup).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      cameraCount: deal.cameraCount?.toString() || "",
      interestedUsecases: deal.interestedUsecases || []
    });
    setEditingDeal(deal._id);
    setIsDialogOpen(true);
  };
  
  const confirmDeleteDeal = (dealId) => {
    setDealToDelete(dealId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDeal = async () => {
    try {
      await deleteDeal({ id: dealToDelete });
      toast({
        title: "Deal Deleted",
        description: "The deal has been successfully deleted.",
        variant: "success",
      });
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || "There was an error deleting the deal.",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert amount to number and dates to timestamp
      const amount = parseFloat(formData.opportunityAmount);
      const closeDate = new Date(formData.expectedCloseDate).getTime();
      const lastFollowup = formData.lastFollowup ? new Date(formData.lastFollowup).getTime() : Date.now();
      const cameraCount = formData.cameraCount ? parseInt(formData.cameraCount) : 0;
      
      if (isNaN(amount)) {
        throw new Error("Please enter a valid opportunity amount");
      }
      
      if (isNaN(closeDate)) {
        throw new Error("Please enter a valid expected close date");
      }
      
      const dealData = {
        ...formData,
        opportunityAmount: amount,
        expectedCloseDate: closeDate,
        lastFollowup,
        cameraCount
      };
      
      if (editingDeal) {
        await updateDeal({ id: editingDeal, ...dealData });
        toast({
          title: "Deal Updated",
          description: "Your deal has been successfully updated.",
          variant: "success",
        });
      } else {
        await registerDeal(dealData);
        toast({
          title: "Deal Registered",
          description: "Your deal has been successfully registered.",
          variant: "success",
        });
      }
      
      // Reset form and close dialog
      setFormData(initialFormData);
      setIsDialogOpen(false);
      
    } catch (error) {
      toast({
        title: editingDeal ? "Update Failed" : "Registration Failed",
        description: error.message || "There was an error with your deal.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="h-3 w-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getDealStageBadge = (stage) => {
    switch (stage) {
      case "new":
        return <Badge className="bg-gray-100 text-gray-700">New</Badge>;
      case "demo_complete":
        return <Badge className="bg-purple-100 text-purple-700">Demo Complete</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case "pilot":
        return <Badge className="bg-blue-100 text-blue-700">Pilot</Badge>;
      case "commercial":
        return <Badge className="bg-green-100 text-green-700">Commercial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{stage}</Badge>;
    }
  };
  
  const isFollowupOverdue = (lastFollowup) => {
    if (!lastFollowup) return true;
    
    const followupDate = new Date(lastFollowup);
    const currentDate = new Date();
    const diffTime = currentDate - followupDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 7;
  };
  
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
  
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Deal Registration</h1>
              <p className="text-gray-600">
                Register and track your deals with Visionify
              </p>
            </div>
            <Button 
              onClick={openNewDealDialog}
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Register New Deal
            </Button>
          </div>
          
          <div className="mt-6">
            <div className="grid gap-6">
              {deals.length > 0 ? (
                deals.map(deal => (
                  <DealCard 
                    key={deal._id}
                    deal={deal}
                    isAdmin={false}
                    refreshDeals={() => {
                      // Refresh deals after an update
                      // This will depend on how you're fetching deals in this component
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <div className="mb-4">
                    <PlusCircle className="h-12 w-12 mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No deals registered yet</h3>
                  <p className="text-gray-500 mb-4">Register your first deal to start tracking opportunities</p>
                  <Button onClick={openNewDealDialog}>
                    Register Your First Deal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal ? "Edit Deal" : "Register New Deal"}</DialogTitle>
            <DialogDescription>
              {editingDeal 
                ? "Update the details of your registered deal" 
                : "Submit details about your new opportunity with a customer"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name *</label>
              <Input
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Customer Email *</label>
              <Input
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Phone</label>
                <Input
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Opportunity Amount ($) *</label>
                <Input
                  name="opportunityAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.opportunityAmount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Customer Address</label>
              <Input
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
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
            
            <div className="grid md:grid-cols-2 gap-4">
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Deal Stage</label>
                <Select 
                  value={formData.dealStage} 
                  onValueChange={(value) => handleSelectChange("dealStage", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="demo_complete">Demo Complete</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="pilot">Pilot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Camera Count</label>
              <Input
                name="cameraCount"
                type="number"
                min="0"
                value={formData.cameraCount}
                onChange={handleChange}
                placeholder="Number of cameras"
              />
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
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeal} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
} 
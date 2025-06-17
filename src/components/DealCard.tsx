import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Pencil,
  Trash2,
  AlertCircle,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  MapPin,
  Camera,
  Tag,
  CalendarClock,
  Percent,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { DealComments } from "./DealComments";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";
import { differenceInDays } from "date-fns";
import { DealRegistrationForm } from "./DealRegistrationForm";
import { ConfettiCelebration } from "@/components/ConfettiCelebration";
import { toast } from "sonner";

// Define the deal stages for our simplified workflow
const dealStages = [
  { key: "new", label: "New" },
  { key: "registered", label: "Registered" },
  { key: "in_progress", label: "In Progress" },
  { key: "outcome", label: "Outcome" } // Combined Won/Lost
];

// Keep the original stages for editing
const editableStages = [
  { key: "new", label: "New" },
  { key: "registered", label: "Registered" },
  { key: "in_progress", label: "In Progress" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" }
];

// Define the admin approval stages
const approvalStages = [
  { key: "new", label: "New" },
  { key: "registered", label: "Registered" }
];

// Add this helper function to calculate commission
const calculateCommission = (amount, rate = 20) => {
  return (amount * rate) / 100;
};

export function DealCard({ 
  deal, 
  isAdmin = false, 
  onPartnerClick = null,
  getPartnerName = null,
  refreshDeals = null
}) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  
  // State for comments
  const [commentsOpen, setCommentsOpen] = useState(false);
  
  // Mutations
  const updateDeal = useMutation(isAdmin ? api.admin.updateDeal : api.deals.updateDeal);
  const deleteDeal = useMutation(isAdmin ? api.admin.deleteDeal : api.deals.deleteDeal);
  const updateDealStatus = useMutation(isAdmin ? api.admin.updateDealStatus : api.deals.updateDealStatus);
  const adminRegisterDeal = isAdmin ? useMutation(api.admin.registerDeal) : null;
  
  // Queries
  const comments = useQuery(api.dealComments.getComments, { dealId: deal._id });
  const latestComment = comments && comments.length > 0 ? comments[0] : null;
  
  // Open edit dialog
  const openEditDialog = () => {
    setEditFormData({
      customerName: deal.customerName,
      contactName: deal.contactName,
      customerEmail: deal.customerEmail,
      customerPhone: deal.customerPhone || "",
      customerAddress: deal.customerAddress || "",
      customerCity: deal.customerCity || "",
      customerState: deal.customerState || "",
      customerZip: deal.customerZip || "",
      customerCountry: deal.customerCountry || "",
      opportunityAmount: deal.opportunityAmount.toString(),
      commissionRate: deal.commissionRate || 20,
      expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0],
      lastFollowup: deal.lastFollowup ? new Date(deal.lastFollowup).toISOString().split('T')[0] : "",
      notes: deal.notes || "",
      status: deal.status || "new",
      cameraCount: deal.cameraCount?.toString() || "",
      interestedUsecases: deal.interestedUsecases || [],
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle edit submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editFormData,
        opportunityAmount: Number(editFormData.opportunityAmount),
        expectedCloseDate: new Date(editFormData.expectedCloseDate).getTime(),
        cameraCount: Number(editFormData.cameraCount) || 0,
        status: deal.status || "new",
      };
      
      // Only include commissionRate in the payload if the user is an admin
      if (isAdmin) {
        payload.commissionRate = Number(editFormData.commissionRate) || 20;
      }
      
      if (isAdmin) {
        // For admin, use dealId instead of id
        await updateDeal({
          dealId: deal._id,
          ...payload
        });
      } else {
        // For regular users, use id
        await updateDeal({
          id: deal._id,
          ...payload
        });
      }
      
      toast.success(
        "Deal updated",
        {
          description: "The deal has been successfully updated",
          duration: 3000,
        }
      );
      
      setIsEditDialogOpen(false);
      if (refreshDeals) refreshDeals();
      
    } catch (error) {
      toast.error(
        "Error",
        {
          description: "Failed to update deal",
          duration: 3000,
        }
      );
      console.error(error);
    }
  };
  
  // Handle delete
  const handleDeleteDeal = async () => {
    if (deleteConfirmName !== deal.customerName) {
      setDeleteError("The name you entered doesn't match the customer name.");
      return;
    }
    
    try {
      if (isAdmin) {
        await deleteDeal({ dealId: deal._id });
      } else {
        await deleteDeal({ id: deal._id });
      }
      
      toast.success(
        "Deal deleted",
        {
          description: "The deal has been successfully deleted.",
          duration: 3000,
        }
      );
      
      setIsDeleteDialogOpen(false);
      if (refreshDeals) refreshDeals();
      
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error(
        "Error",
        {
          description: "Failed to delete the deal.",
          duration: 3000,
        }
      );
    }
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      if (isAdmin) {
        // For admin, use dealId parameter
        await updateDealStatus({
          dealId: deal._id,
          status: newStatus
        });
      } else {
        // For partners, use id parameter
        await updateDealStatus({
          id: deal._id,
          status: newStatus
        });
      }
      
      // Show confetti if the deal is marked as won
      if (newStatus === "won") {
        setShowConfetti(true);
        
        // Show a celebratory toast message using sonner directly
        toast.success(
          "Congratulations!",
          {
            description: `You've successfully closed the deal with ${deal.customerName}!`,
            duration: 5000,
          }
        );
      } else {
        // Regular status update toast
        toast.info(
          "Status updated",
          {
            description: `Deal status updated to ${newStatus}`,
            duration: 3000,
          }
        );
      }
      
      if (refreshDeals) refreshDeals();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(
        "Error",
        {
          description: "Failed to update deal status",
          duration: 3000,
        }
      );
    }
  };
  
  // Register a deal (admin only)
  const registerDeal = async () => {
    try {
      if (isAdmin) {
        await adminRegisterDeal({ dealId: deal._id });
      } else {
        throw new Error("Only admins can register deals");
      }
      
      toast.success(
        "Deal registered",
        {
          description: "The deal has been successfully registered",
          duration: 3000,
        }
      );
      
      if (refreshDeals) refreshDeals();
    } catch (error) {
      console.error("Error registering deal:", error);
      toast.error(
        "Error",
        {
          description: "Failed to register deal",
          duration: 3000,
        }
      );
    }
  };
  
  // Move deal to in progress
  const moveToInProgress = async () => {
    await handleStatusChange("in_progress");
  };
  
  // Get approval status badge
  const getApprovalStatusBadge = (status) => {
    switch(status) {
      case "new":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">New</Badge>;
      case "registered":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Registered</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };
  
  // Get progress status badge
  const getProgressStatusBadge = (status) => {
    switch(status) {
      case "new":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">New</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>;
      case "won":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Won</Badge>;
      case "lost":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Lost</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Unknown</Badge>;
    }
  };
  
  // Render progress timeline
  const renderProgressTimeline = (currentStatus) => {
    // Find the index of the current status in the original stages
    const currentIndex = editableStages.findIndex(stage => stage.key === currentStatus);
    
    // Map won/lost to the outcome stage for display purposes
    const displayStatus = (currentStatus === "won" || currentStatus === "lost") 
      ? "outcome" 
      : currentStatus;
    
    return (
      <div className="relative flex items-center h-6">
        {/* The line connecting all circles */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
        
        {/* Status circles */}
        <div className="relative flex justify-between w-full">
          {dealStages.map((stage, index) => {
            // Determine if this stage is active, completed, or upcoming
            const isActive = stage.key === displayStatus;
            const isCompleted = (stage.key === "new" && currentIndex > 0) || 
                               (stage.key === "registered" && currentIndex > 1) ||
                               (stage.key === "in_progress" && currentIndex > 2);
            
            // Set the appropriate color based on status
            let bgColor = "bg-gray-200"; // default for upcoming
            let borderColor = "border-gray-200";
            
            if (isActive) {
              if (stage.key === "outcome") {
                // Use green for won, red for lost
                if (currentStatus === "won") {
                  bgColor = "bg-green-500";
                  borderColor = "border-green-500";
                } else if (currentStatus === "lost") {
                  bgColor = "bg-red-500";
                  borderColor = "border-red-500";
                }
              } else {
                bgColor = "bg-blue-500";
                borderColor = "border-blue-500";
              }
            } else if (isCompleted) {
              bgColor = "bg-green-500";
              borderColor = "border-green-500";
            }
            
            // Special case for "In Progress" status
            if (stage.key === "in_progress" && currentStatus === "in_progress") {
              bgColor = "bg-yellow-500";
              borderColor = "border-yellow-500";
            }
            
            return (
              <div key={stage.key} className="relative group">
                {/* Circle - positioned on the line with border to ensure visibility */}
                <div 
                  className={`w-3 h-3 rounded-full ${bgColor} border-2 ${borderColor} z-10`}
                ></div>
                
                {/* Tooltip content - visible on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                  {stage.key === "outcome" 
                    ? (currentStatus === "won" ? "Won" : currentStatus === "lost" ? "Lost" : "Outcome") 
                    : stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Helper function to get status badge with appropriate color
  const getStatusBadge = (deal) => {
    const status = deal.status || "new";
    
    switch (status) {
      case "new":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">New</Badge>;
      case "registered":
        return <Badge variant="default" className="bg-green-50 text-green-700">Registered</Badge>;
      case "won":
        return <Badge variant="default" className="bg-green-50 text-green-700">Won</Badge>;
      case "lost":
        return <Badge variant="destructive">Lost</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Check if follow-up is overdue
  const isFollowupOverdue = (timestamp) => {
    if (!timestamp) return false;
    const followupDate = new Date(timestamp);
    const today = new Date();
    
    // Consider follow-up overdue if it's more than 7 days old
    return (today.getTime() - followupDate.getTime()) > 7 * 24 * 60 * 60 * 1000;
  };
  
  return (
    <>
      <ConfettiCelebration 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)}
      />
      
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{deal.customerName}</CardTitle>
              <div className="flex flex-wrap gap-x-4 mt-1">
                <CardDescription className="flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  {deal.customerEmail}
                </CardDescription>
                
                {deal.customerPhone && (
                  <CardDescription className="flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    {deal.customerPhone}
                  </CardDescription>
                )}
              </div>
              
              {deal.customerAddress && (
                <CardDescription className="flex items-center mt-1">
                  <Building className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  {deal.customerAddress}
                </CardDescription>
              )}
              
              <div className="mt-2 flex space-x-2">
                {getStatusBadge(deal)}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Progress timeline */}
              <div className="w-40">
                {renderProgressTimeline(deal.status || "new")}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={openEditDialog}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Opportunity Details */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 mb-1">Opportunity</h3>
              <div className="space-y-1">
                <p className="text-sm flex items-center">
                  <DollarSign className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <span className="font-medium">${deal.opportunityAmount.toLocaleString()}</span>
                </p>
                
                <p className="text-sm flex items-center text-green-600 group relative">
                  <Percent className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                  <span className="font-medium">
                    ${calculateCommission(deal.opportunityAmount, deal.commissionRate || 20).toLocaleString()}
                  </span>
                  {/* Tooltip that appears on hover */}
                  <span className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Commission ({deal.commissionRate || 20}%)
                  </span>
                </p>
                
                {deal.cameraCount && (
                  <p className="text-sm flex items-center">
                    <Camera className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span>{deal.cameraCount} Cameras</span>
                  </p>
                )}
              </div>
            </div>
            
            {/* Column 2: Use Cases */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 mb-1">Use Cases</h3>
              {deal.interestedUsecases && deal.interestedUsecases.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {deal.interestedUsecases.map((useCase, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No use cases specified</p>
              )}
            </div>
            
            {/* Column 3: Registration Timeline */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 mb-1">Registration</h3>
              <div className="space-y-1">
                <p className="text-sm flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <span className="font-medium mr-1">Registered:</span>
                  {format(deal.createdAt, "MMM d, yyyy")}
                </p>
                
                <p className="text-sm flex items-center">
                  <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <span className="font-medium mr-1">Expected Close:</span>
                  {format(deal.expectedCloseDate, "MMM d, yyyy")}
                </p>
                
                {/* Show partner information for admin */}
                {isAdmin && deal.partnerId && getPartnerName && (
                  <div className="text-sm flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <span className="font-medium mr-1">Assigned to:</span>
                    <Badge 
                      variant="outline" 
                      className="bg-purple-50 text-purple-700 border-purple-200 cursor-pointer hover:bg-purple-100"
                      onClick={() => onPartnerClick && onPartnerClick({ type: 'partner', id: deal.partnerId })}
                    >
                      {getPartnerName(deal.partnerId)}
                    </Badge>
                  </div>
                )}
                
                {deal.lastFollowup && (
                  <p className={`text-sm flex items-center ${
                    differenceInDays(Date.now(), deal.lastFollowup) > 14 
                      ? "text-red-500" 
                      : ""
                  }`}>
                    <MessageCircle className={`h-3.5 w-3.5 mr-1.5 ${
                      differenceInDays(Date.now(), deal.lastFollowup) > 14 
                        ? "text-red-400" 
                        : "text-gray-400"
                    }`} />
                    <span className="font-medium mr-1">Last Touchbase:</span>
                    {formatDistanceToNow(deal.lastFollowup, { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Notes section */}
          {deal.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm">{deal.notes}</p>
            </div>
          )}
          
          {/* Comment summary section */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500 flex items-center">
                <MessageCircle className="h-4 w-4 mr-1 text-gray-400" />
                Comments ({comments?.length || 0})
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommentsOpen(true)}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
              >
                {comments?.length ? "View all" : "Add comment"}
              </Button>
            </div>
            
            {latestComment && (
              <div className="bg-gray-50 p-2 rounded-md text-sm">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  {latestComment.sentiment === "positive" && (
                    <ThumbsUp className="h-3 w-3 text-green-500" />
                  )}
                  {latestComment.sentiment === "negative" && (
                    <ThumbsDown className="h-3 w-3 text-red-500" />
                  )}
                  {latestComment.sentiment === "neutral" && (
                    <Minus className="h-3 w-3 text-gray-500" />
                  )}
                  <span>{formatDistanceToNow(latestComment.createdAt, { addSuffix: true })}</span>
                </div>
                <p className="line-clamp-2">{latestComment.text}</p>
              </div>
            )}
          </div>
          
          {/* Action buttons based on current status */}
          <div className="mt-4 flex justify-end space-x-2">
            {/* Admin registration action */}
            {isAdmin && deal.status === "new" && (
              <Button 
                size="sm" 
                onClick={registerDeal}
              >
                Register Deal
              </Button>
            )}
            
            {/* Progress status actions */}
            {deal.status === "registered" && (
              <Button 
                size="sm" 
                onClick={moveToInProgress}
              >
                Move to In Progress
              </Button>
            )}
            
            {deal.status === "in_progress" && (
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleStatusChange("won")}
                >
                  Won
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStatusChange("lost")}
                >
                  Lost
                </Button>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommentsOpen(true)}
              className="ml-auto"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DealRegistrationForm
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            editingDeal={deal._id}
            isAdmin={isAdmin}
            initialData={{
              companyName: deal.customerName,
              contactName: deal.contactName,
              contactEmail: deal.customerEmail,
              contactPhone: deal.customerPhone || "",
              customerAddress: deal.customerAddress || "",
              customerCity: deal.customerCity || "",
              customerState: deal.customerState || "",
              customerZip: deal.customerZip || "",
              customerCountry: deal.customerCountry || "",
              opportunityAmount: deal.opportunityAmount.toString(),
              commissionRate: deal.commissionRate || 20,
              expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0],
              lastFollowup: deal.lastFollowup ? new Date(deal.lastFollowup).toISOString().split('T')[0] : "",
              notes: deal.notes || "",
              status: deal.status || "new",
              cameraCount: deal.cameraCount?.toString() || "",
              interestedUsecases: deal.interestedUsecases || [],
              partnerId: deal.partnerId || "",
              assignmentNotes: deal.assignmentNotes || "",
            }}
            onSuccess={() => {
              if (refreshDeals) refreshDeals();
            }}
          />
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Deal</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the deal
                for {deal.customerName}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4 text-sm">
                To confirm, please type the customer name <strong>{deal.customerName}</strong> below:
              </p>
              
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Type customer name here"
                className={deleteError ? "border-red-500" : ""}
              />
              
              {deleteError && (
                <p className="mt-2 text-sm text-red-500">{deleteError}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDeleteDeal}
                disabled={deleteConfirmName !== deal.customerName}
              >
                Delete Deal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Comments Dialog */}
      {commentsOpen && (
        <DealComments
          dealId={deal._id}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      )}
    </>
  );
} 
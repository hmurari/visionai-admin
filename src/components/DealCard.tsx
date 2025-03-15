import { useState } from "react";
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
} from "lucide-react";
import { DealComments } from "./DealComments";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";
import { differenceInDays } from "date-fns";

// Define the deal progress stages for display (combined Won/Lost)
const progressStagesDisplay = [
  { key: "new", label: "New" },
  { key: "in_progress", label: "In Progress" },
  { key: "outcome", label: "Outcome" } // Combined Won/Lost
];

// Keep the original progress stages for editing
const progressStages = [
  { key: "new", label: "New" },
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
  const { toast } = useToast();
  
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
  
  // Query
  const comments = useQuery(api.dealComments.getComments, { dealId: deal._id });
  const latestComment = comments && comments.length > 0 ? comments[0] : null;
  
  // Open edit dialog
  const openEditDialog = () => {
    setEditFormData({
      customerName: deal.customerName,
      customerEmail: deal.customerEmail,
      customerPhone: deal.customerPhone || "",
      customerAddress: deal.customerAddress || "",
      opportunityAmount: deal.opportunityAmount,
      commissionRate: deal.commissionRate || 20, // Default to 20% if not set
      expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0],
      notes: deal.notes || "",
      approvalStatus: deal.approvalStatus || "new",
      progressStatus: deal.progressStatus || "new",
      cameraCount: deal.cameraCount || 0,
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
        approvalStatus: deal.approvalStatus || "new",
        progressStatus: editFormData.progressStatus || deal.progressStatus || "new",
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
      
      toast({
        title: "Deal updated",
        description: "The deal has been successfully updated",
      });
      
      setIsEditDialogOpen(false);
      if (refreshDeals) refreshDeals();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  // Handle delete
  const handleDeleteDeal = async () => {
    if (deleteConfirmName !== deal.customerName) {
      setDeleteError("Customer name doesn't match. Please try again.");
      return;
    }
    
    try {
      if (isAdmin) {
        await deleteDeal({ dealId: deal._id });
      } else {
        await deleteDeal({ id: deal._id });
      }
      
      toast({
        title: "Deal deleted",
        description: "The deal has been successfully deleted",
      });
      
      setIsDeleteDialogOpen(false);
      if (refreshDeals) refreshDeals();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      await updateDealStatus({
        id: deal._id,
        status: newStatus,
        statusType: "progressStatus" // Specify that we're updating the progressStatus
      });
      
      toast({
        title: "Status updated",
        description: `Deal status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update deal status",
        variant: "destructive",
      });
    }
  };
  
  // Register a deal (change approval status from New to Registered)
  const registerDeal = async () => {
    await handleStatusChange("registered");
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
    const currentIndex = progressStages.findIndex(stage => stage.key === currentStatus);
    
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
          {progressStagesDisplay.map((stage, index) => {
            // Determine if this stage is active, completed, or upcoming
            const isActive = stage.key === displayStatus;
            const isCompleted = (stage.key === "new" && currentIndex > 0) || 
                               (stage.key === "in_progress" && currentIndex > 1);
            
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
  const getStatusBadge = (status, type) => {
    let color = "";
    let label = "";
    
    if (type === "approval") {
      switch(status) {
        case "new":
          color = "bg-gray-100 text-gray-800 border-gray-200";
          label = "New";
          break;
        case "registered":
          color = "bg-blue-100 text-blue-800 border-blue-200";
          label = "Registered";
          break;
        default:
          color = "bg-gray-100 text-gray-800 border-gray-200";
          label = status.charAt(0).toUpperCase() + status.slice(1);
      }
    } else { // progress status
      switch(status) {
        case "new":
          color = "bg-gray-100 text-gray-800 border-gray-200";
          label = "New";
          break;
        case "in_progress":
          color = "bg-amber-100 text-amber-800 border-amber-200";
          label = "In Progress";
          break;
        case "won":
          color = "bg-green-100 text-green-800 border-green-200";
          label = "Won";
          break;
        case "lost":
          color = "bg-red-100 text-red-800 border-red-200";
          label = "Lost";
          break;
        default:
          color = "bg-gray-100 text-gray-800 border-gray-200";
          label = status.charAt(0).toUpperCase() + status.slice(1);
      }
    }
    
    return <Badge className={`${color} mr-2`}>{label}</Badge>;
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
                {getApprovalStatusBadge(deal.approvalStatus || "new")}
                {getProgressStatusBadge(deal.progressStatus || "new")}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Progress timeline */}
              <div className="w-40">
                {renderProgressTimeline(deal.progressStatus || "new")}
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
            {/* Admin approval actions */}
            {isAdmin && deal.approvalStatus === "new" && (
              <Button 
                size="sm" 
                onClick={registerDeal}
              >
                Register Deal
              </Button>
            )}
            
            {/* Progress status actions */}
            {deal.progressStatus === "new" && (
              <Button 
                size="sm" 
                onClick={moveToInProgress}
              >
                Move to In Progress
              </Button>
            )}
            
            {deal.progressStatus === "in_progress" && (
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Deal</DialogTitle>
              <DialogDescription>
                Update the deal information below.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={editFormData.customerName}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={editFormData.customerEmail}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Customer Phone</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      value={editFormData.customerPhone}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Customer Address</Label>
                    <Input
                      id="customerAddress"
                      name="customerAddress"
                      value={editFormData.customerAddress}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opportunityAmount">Opportunity Amount ($)</Label>
                    <Input
                      id="opportunityAmount"
                      name="opportunityAmount"
                      type="number"
                      value={editFormData.opportunityAmount}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                      <Input
                        id="commissionRate"
                        name="commissionRate"
                        type="number"
                        min="0"
                        max="100"
                        value={editFormData.commissionRate}
                        onChange={handleEditFormChange}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Commission: ${calculateCommission(
                          Number(editFormData.opportunityAmount) || 0, 
                          Number(editFormData.commissionRate) || 20
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {!isAdmin && (
                    <div className="space-y-2">
                      <Label>Commission</Label>
                      <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-100 text-sm">
                        ${calculateCommission(Number(editFormData.opportunityAmount) || 0, 20).toLocaleString()} (20%)
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                    <Input
                      id="expectedCloseDate"
                      name="expectedCloseDate"
                      type="date"
                      value={editFormData.expectedCloseDate}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cameraCount">Camera Count</Label>
                    <Input
                      id="cameraCount"
                      name="cameraCount"
                      type="number"
                      value={editFormData.cameraCount}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="progressStatus">Deal Progress</Label>
                    <Select 
                      name="progressStatus" 
                      value={editFormData.progressStatus}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, progressStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select progress status" />
                      </SelectTrigger>
                      <SelectContent>
                        {progressStages.map(stage => (
                          <SelectItem key={stage.key} value={stage.key}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="approvalStatus">Approval Status</Label>
                    <Select 
                      name="approvalStatus" 
                      value={editFormData.approvalStatus}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, approvalStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select approval status" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvalStages.map(stage => (
                          <SelectItem key={stage.key} value={stage.key}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={editFormData.notes}
                    onChange={handleEditFormChange}
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
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
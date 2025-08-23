import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Grid3X3, 
  List, 
  Clock, 
  DollarSign, 
  Camera, 
  MessageCircle, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Building,
  Plus,
  CheckCircle,
  XCircle,
  TrendingUp,
  Pause,
  Copy,
  FileText,
  Clipboard,
  Phone
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import { DealComments } from "./DealComments";
import { useMutation } from "convex/react";

interface Deal {
  _id: string;
  customerName: string;
  contactName?: string;
  opportunityAmount: number;
  cameraCount?: number;
  status: string;
  lastFollowup?: number;
  lastCommentAt?: number;
  lastCommentSentiment?: string;
  notes?: string;
  partnerId?: string;
  updatedAt?: number;
  customerEmail?: string;
  flairs?: {
    quote?: boolean;
    orderForm?: boolean;
    tech?: boolean;
    pricing?: boolean;
    callsCount?: number;
  };
}

interface DealsListViewProps {
  deals: Deal[];
  isAdmin?: boolean;
  getPartnerName?: (partnerId: string) => string;
  onDealClick: (dealId: string) => void;
}

export function DealsListView({ deals, isAdmin = false, getPartnerName, onDealClick }: DealsListViewProps) {
  const [sortBy, setSortBy] = useState<"newest_touched" | "oldest_touched">("oldest_touched");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get latest comments for each deal to show last comment and next steps
  const dealComments = useQuery(api.dealComments.getAllComments) || [];
  
  // Mutations for updating deal status
  const updateDealStatusAdmin = useMutation(api.admin.updateDealStatus);
  const updateDealStatusPartner = useMutation(api.deals.updateDealStatus);

  // Helper functions
  const getDaysSinceLastTouch = (deal: any, latestComment: any) => {
    const dealUpdated = new Date(deal._creationTime);
    const commentDate = latestComment ? new Date(latestComment._creationTime) : null;
    const lastTouch = commentDate && commentDate > dealUpdated ? commentDate : dealUpdated;
    return differenceInDays(new Date(), lastTouch);
  };

  const formatLastTouch = (deal: any, latestComment: any) => {
    const dealUpdated = new Date(deal._creationTime);
    const commentDate = latestComment ? new Date(latestComment._creationTime) : null;
    const lastTouch = commentDate && commentDate > dealUpdated ? commentDate : dealUpdated;
    return formatDistanceToNow(lastTouch, { addSuffix: true });
  };

  const getNextSteps = (deal: any, daysSinceTouch: number) => {
    if (deal.status === 'won') return 'Deal closed successfully';
    if (deal.status === 'lost') return 'Deal marked as lost';
    if (deal.status === 'waiting') return 'Follow up when ready';
    
    if (daysSinceTouch >= 7) return 'Urgent: Follow up immediately';
    if (daysSinceTouch >= 3) return 'Schedule follow-up call';
    if (daysSinceTouch >= 1) return 'Send status update';
    return 'Continue nurturing';
  };

  // Get status badge with proper colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">New</Badge>;
      case "1st_call":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">1st Call</Badge>;
      case "2plus_calls":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">2+ Calls</Badge>;
      case "waiting":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Waiting</Badge>;
      case "won":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Won</Badge>;
      case "lost":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Lost</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Render status with click-to-edit functionality
  const renderStatusBadge = (deal: Deal) => {
    if (editingStatusId === deal._id) {
      return (
        <div className="w-32">
          <Select
            value={deal.status}
            onValueChange={(newStatus) => handleStatusChange(deal._id, newStatus)}
            onOpenChange={(open) => {
              if (!open) setEditingStatusId(null);
            }}
            open={true}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="1st_call">1st Call</SelectItem>
              <SelectItem value="2plus_calls">2+ Calls</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={(e) => handleStatusClick(e, deal._id)}
        title="Click to edit status"
      >
        {getStatusBadge(deal.status)}
      </div>
    );
  };

  // Function to copy text to clipboard
  const copyToClipboard = async (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent deal card click
    
    if (!text || text.trim() === '') {
      toast({
        title: "No content available",
        description: `This ${label.toLowerCase()} is not available.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${label} copied!`,
        description: `${text} has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: `Could not copy ${label.toLowerCase()} to clipboard.`,
        variant: "destructive",
      });
    }
  };

  const handleCommentClick = (e: React.MouseEvent, dealId: string) => {
    e.stopPropagation(); // Prevent triggering the deal click
    setSelectedDealId(dealId);
    setCommentsOpen(true);
  };

  const handleStatusClick = (e: React.MouseEvent, dealId: string) => {
    e.stopPropagation(); // Prevent triggering the deal click
    setEditingStatusId(dealId);
  };

  const handleStatusChange = async (dealId: string, newStatus: string) => {
    try {
      // Use correct API based on user role
      if (isAdmin) {
        await updateDealStatusAdmin({ dealId: dealId, status: newStatus });
      } else {
        await updateDealStatusPartner({ id: dealId, status: newStatus });
      }
      setEditingStatusId(null);
      toast({
        title: "Status updated",
        description: "Deal status has been updated successfully",
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

  // Render flairs in a compact way
  const renderFlairs = (deal: Deal) => {
    const flairs = deal.flairs || {};
    const activeFlairs = [];
    
    if (flairs.quote) activeFlairs.push({ 
      icon: FileText, 
      color: "text-blue-500", 
      tooltip: "Quote Sent" 
    });
    if (flairs.orderForm) activeFlairs.push({ 
      icon: Clipboard, 
      color: "text-green-500", 
      tooltip: "Order Form Sent" 
    });
    if (flairs.tech) activeFlairs.push({ 
      icon: CheckCircle, 
      color: "text-purple-500", 
      tooltip: "Technical Approval" 
    });
    if (flairs.pricing) activeFlairs.push({ 
      icon: DollarSign, 
      color: "text-yellow-500", 
      tooltip: "Pricing Approved" 
    });
    if (flairs.callsCount && flairs.callsCount > 0) {
      activeFlairs.push({ 
        icon: Phone, 
        color: "text-indigo-500", 
        tooltip: `${flairs.callsCount} Calls Made`,
        count: flairs.callsCount 
      });
    }
    
    if (activeFlairs.length === 0) return null;
    
    return (
      <div className="flex items-center gap-2 mt-1">
        {activeFlairs.map((flair, index) => {
          const IconComponent = flair.icon;
          return (
            <div 
              key={index} 
              className={`flex items-center ${flair.color} cursor-pointer hover:opacity-70 transition-opacity`} 
              title={flair.tooltip}
              onClick={(e) => handleCommentClick(e, deal._id)}
            >
              <IconComponent className="h-4 w-4" />
              {flair.count && (
                <span className="text-xs ml-1 font-medium">{flair.count}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Sort deals based on last touchpoint
  const sortedDeals = [...deals].sort((a, b) => {
    const aComments = dealComments.filter(c => c.dealId === a._id);
    const bComments = dealComments.filter(c => c.dealId === b._id);
    
    const aLatestComment = aComments.length > 0 ? aComments[0] : null;
    const bLatestComment = bComments.length > 0 ? bComments[0] : null;
    
    const aDaysSince = getDaysSinceLastTouch(a, aLatestComment);
    const bDaysSince = getDaysSinceLastTouch(b, bLatestComment);
    
    if (sortBy === "oldest_touched") {
      return bDaysSince - aDaysSince; // Most days since touch first (needs attention)
    } else {
      return aDaysSince - bDaysSince; // Least days since touch first (recently touched)
    }
  });

  return (
    <div className="space-y-4">
      {/* Header with sorting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest_touched" | "oldest_touched")}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="oldest_touched">Oldest Touched (Need Attention)</option>
              <option value="newest_touched">Recently Touched</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deals Display */}
      {sortedDeals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="mb-4">
            <Building className="h-12 w-12 mx-auto text-gray-300" />
          </div>
          <h3 className="text-lg font-medium mb-2">No deals found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column Headers */}
          <Card className="bg-gray-50">
            <CardContent className="p-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
                <div className="col-span-3">Customer & Contact</div>
                <div className="col-span-2">Amount & Cameras</div>
                <div className="col-span-2">Last Comment & Next Steps</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-3 text-right">Last Touchpoint & Actions</div>
              </div>
            </CardContent>
          </Card>

          {/* Deal Rows */}
          {sortedDeals.map((deal) => {
            const dealCommentsList = dealComments.filter(c => c.dealId === deal._id);
            const latestComment = dealCommentsList.length > 0 ? dealCommentsList[0] : null;
            const daysSinceTouch = getDaysSinceLastTouch(deal, latestComment);
            const isOverdue = daysSinceTouch >= 7;
            const nextSteps = getNextSteps(deal, daysSinceTouch);

            return (
              <Card 
                key={deal._id} 
                className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                  isOverdue ? 'border-red-300 border-2' : 'hover:border-blue-300'
                }`}
                onClick={() => onDealClick(deal._id)}
              >
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Customer & Contact */}
                    <div className="col-span-3">
                      <div 
                        className="font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer transition-colors duration-200 flex items-center group"
                        onClick={(e) => copyToClipboard(deal.customerName || '', 'Company Name', e)}
                        title={`Click to copy: ${deal.customerName || 'No company name'}`}
                      >
                        {deal.customerName}
                        <Copy className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div 
                        className="text-sm text-gray-600 truncate hover:text-blue-600 cursor-pointer transition-colors duration-200 flex items-center group"
                        onClick={(e) => copyToClipboard(deal.contactName || '', 'Contact Name', e)}
                        title={`Click to copy: ${deal.contactName || 'No contact name'}`}
                      >
                        {deal.contactName}
                        <Copy className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div 
                        className="text-xs text-gray-500 truncate hover:text-blue-600 cursor-pointer transition-colors duration-200 flex items-center group"
                        onClick={(e) => copyToClipboard(deal.customerEmail || '', 'Email', e)}
                        title={`Click to copy: ${deal.customerEmail || 'No email'}`}
                      >
                        {deal.customerEmail}
                        <Copy className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Amount & Cameras */}
                    <div className="col-span-2">
                      <div className="font-semibold text-green-600">
                        ${deal.opportunityAmount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {deal.cameraCount || 0} cameras
                      </div>
                      {renderFlairs(deal)}
                    </div>

                    {/* Last Comment & Next Steps */}
                    <div className="col-span-2">
                      <div className="text-sm text-gray-700 line-clamp-1 mb-1">
                        {latestComment?.text || "No comments yet"}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">{nextSteps}</div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <div className="flex justify-center">
                        {renderStatusBadge(deal)}
                      </div>
                      {isAdmin && deal.partnerId && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {getPartnerName(deal.partnerId)}
                        </div>
                      )}
                    </div>

                    {/* Last Touchpoint & Actions */}
                    <div className="col-span-3 text-right">
                      <div className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                        {formatLastTouch(deal, latestComment)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {daysSinceTouch === 0 ? 'Today' : `${daysSinceTouch} days ago`}
                        {isOverdue && <span className="text-red-500 ml-1">⚠️ Overdue</span>}
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="flex justify-end items-center mt-2 space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleCommentClick(e, deal._id)}
                          className="h-6 px-2 text-xs"
                        >
                          {dealCommentsList.length > 0 ? (
                            <>
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {dealCommentsList.length}
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3 mr-1" />
                              Comment
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comments Dialog */}
      {selectedDealId && (
        <>
          <DealComments
            dealId={selectedDealId}
            isOpen={commentsOpen}
            onClose={() => {
              setCommentsOpen(false);
              setSelectedDealId(null);
            }}
          />
        </>
      )}
    </div>
  );
} 
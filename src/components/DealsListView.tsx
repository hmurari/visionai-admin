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
  Copy
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { formatCurrency } from "@/utils/formatters";
import { DealComments } from "./DealComments";

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
}

interface DealsListViewProps {
  deals: Deal[];
  isAdmin?: boolean;
  getPartnerName?: (partnerId: string) => string;
  onDealClick?: (dealId: string) => void;
}

// Status configuration
const statusConfig = {
  new: { 
    label: 'New', 
    color: 'bg-blue-100 text-blue-800', 
    icon: Plus 
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock 
  },
  won: { 
    label: 'Won', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle 
  },
  lost: { 
    label: 'Lost', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle 
  },
  on_hold: { 
    label: 'On Hold', 
    color: 'bg-gray-100 text-gray-800', 
    icon: Pause 
  }
};

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
  if (deal.status === 'on_hold') return 'Follow up when ready';
  
  if (daysSinceTouch >= 7) return 'Urgent: Follow up immediately';
  if (daysSinceTouch >= 3) return 'Schedule follow-up call';
  if (daysSinceTouch >= 1) return 'Send status update';
  return 'Continue nurturing';
};

const getStatusBadge = (status: string) => {
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} flex items-center space-x-1`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

export function DealsListView({ deals, isAdmin = false, getPartnerName, onDealClick }: DealsListViewProps) {
  const [sortBy, setSortBy] = useState<"newest_touched" | "oldest_touched">("oldest_touched");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get latest comments for each deal to show last comment and next steps
  const dealComments = useQuery(api.dealComments.getAllComments) || [];

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
                        {getStatusBadge(deal.status)}
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
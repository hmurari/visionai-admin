import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MessageCircle, ThumbsUp, ThumbsDown, Minus, Trash2, FileText, Clipboard, CheckCircle, DollarSign, Phone } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

export function DealComments({ dealId, isOpen, onClose }) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [sentiment, setSentiment] = useState("neutral");
  
  const comments = useQuery(api.dealComments.getComments, { dealId });
  const addComment = useMutation(api.dealComments.addComment);
  const deleteComment = useMutation(api.dealComments.deleteComment);
  const updateFlairs = useMutation(api.deals.updateDealFlairs);
  
  // Get deal data for flairs
  const deal = useQuery(api.deals.getDeal, { dealId });
  
  // Local flair state
  const [flairs, setFlairs] = useState({
    quote: deal?.flairs?.quote || false,
    orderForm: deal?.flairs?.orderForm || false,
    tech: deal?.flairs?.tech || false,
    pricing: deal?.flairs?.pricing || false,
    callsCount: deal?.flairs?.callsCount || 0,
  });
  
  // Update local state when deal data changes
  React.useEffect(() => {
    if (deal?.flairs) {
      setFlairs({
        quote: deal.flairs.quote || false,
        orderForm: deal.flairs.orderForm || false,
        tech: deal.flairs.tech || false,
        pricing: deal.flairs.pricing || false,
        callsCount: deal.flairs.callsCount || 0,
      });
    }
  }, [deal]);

  const handleFlairChange = async (flairType, value) => {
    const newFlairs = { ...flairs, [flairType]: value };
    setFlairs(newFlairs);
    
    try {
      await updateFlairs({
        dealId,
        flairs: newFlairs
      });
      
      toast({
        title: "Flairs updated",
        description: "Deal flairs have been updated successfully",
      });
    } catch (error) {
      console.error("Error updating flairs:", error);
      toast({
        title: "Error",
        description: "Failed to update deal flairs",
        variant: "destructive",
      });
      // Revert local state
      setFlairs(deal?.flairs || {});
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await addComment({
        dealId,
        text: newComment,
        sentiment,
      });
      
      setNewComment("");
      setSentiment("neutral");
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (commentId) => {
    try {
      await deleteComment({ commentId });
      
      toast({
        title: "Comment deleted",
        description: "Comment has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };
  
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {deal ? `${deal.customerName} - Communication History` : "Deal Communication History"}
          </DialogTitle>
          <DialogDescription>
            {deal ? `Track interactions with ${deal.contactName || deal.customerName}` : "Track all customer interactions and sentiment over time."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Deal Flairs */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
            <Label className="text-sm font-medium mb-3 block">Deal Progress</Label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quote"
                  checked={flairs.quote}
                  onCheckedChange={(checked) => handleFlairChange('quote', checked)}
                />
                <FileText className="h-4 w-4 text-blue-600" />
                <Label htmlFor="quote" className="text-sm">Quote</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="orderForm"
                  checked={flairs.orderForm}
                  onCheckedChange={(checked) => handleFlairChange('orderForm', checked)}
                />
                <Clipboard className="h-4 w-4 text-green-600" />
                <Label htmlFor="orderForm" className="text-sm">Order Form</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tech"
                  checked={flairs.tech}
                  onCheckedChange={(checked) => handleFlairChange('tech', checked)}
                />
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <Label htmlFor="tech" className="text-sm">Tech OK</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pricing"
                  checked={flairs.pricing}
                  onCheckedChange={(checked) => handleFlairChange('pricing', checked)}
                />
                <DollarSign className="h-4 w-4 text-yellow-600" />
                <Label htmlFor="pricing" className="text-sm">Pricing OK</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-indigo-600" />
                <Label htmlFor="calls" className="text-sm">Calls:</Label>
                <Input
                  id="calls"
                  type="number"
                  min="0"
                  value={flairs.callsCount}
                  onChange={(e) => handleFlairChange('callsCount', parseInt(e.target.value) || 0)}
                  className="w-16 h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex gap-2 mb-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-1">
              <ThumbsUp className="h-3 w-3 mr-1" /> {comments?.filter(c => c.sentiment === "positive").length || 0}
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 px-2 py-1">
              <Minus className="h-3 w-3 mr-1" /> {comments?.filter(c => c.sentiment === "neutral").length || 0}
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-2 py-1">
              <ThumbsDown className="h-3 w-3 mr-1" /> {comments?.filter(c => c.sentiment === "negative").length || 0}
            </Badge>
          </div>
          
          {/* Comments table */}
          <div className="flex-1 border rounded-lg">
            <ScrollArea className="h-[400px]">
              {comments && comments.length > 0 ? (
                <Table>
                  <TableHeader className="sticky top-0 bg-white border-b">
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[80px] text-center">Sentiment</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead className="w-[60px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments.map((comment) => (
                      <TableRow key={comment._id} className="hover:bg-gray-50">
                        <TableCell className="text-sm font-medium py-3">
                          {format(comment.createdAt, "MMM d, yyyy")}
                          <div className="text-xs text-gray-500">
                            {format(comment.createdAt, "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <div className="flex justify-center">
                            {getSentimentIcon(comment.sentiment)}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="text-sm">{comment.text}</div>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(comment._id)}
                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No comments yet. Add your first interaction note.</p>
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Add comment form */}
          <div className="mt-6 pt-4 border-t sticky bottom-0 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
                    Add new interaction
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="e.g., Followed up today, no response yet."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Sentiment
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={sentiment === "positive" ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${sentiment === "positive" ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={() => setSentiment("positive")}
                      title="Positive"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant={sentiment === "neutral" ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSentiment("neutral")}
                      title="Neutral"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant={sentiment === "negative" ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${sentiment === "negative" ? "bg-red-600 hover:bg-red-700" : ""}`}
                      onClick={() => setSentiment("negative")}
                      title="Negative"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  Add Comment
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
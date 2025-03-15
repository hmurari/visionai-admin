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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageCircle, ThumbsUp, ThumbsDown, Minus, Trash2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DealComments({ dealId, isOpen, onClose }) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [sentiment, setSentiment] = useState("neutral");
  
  const comments = useQuery(api.dealComments.getComments, { dealId });
  const addComment = useMutation(api.dealComments.addComment);
  const deleteComment = useMutation(api.dealComments.deleteComment);
  
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
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Deal Communication History
          </DialogTitle>
          <DialogDescription>
            Track all customer interactions and sentiment over time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <ThumbsUp className="h-3 w-3 mr-1" /> {comments?.filter(c => c.sentiment === "positive").length || 0} Positive
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                <Minus className="h-3 w-3 mr-1" /> {comments?.filter(c => c.sentiment === "neutral").length || 0} Neutral
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <ThumbsDown className="h-3 w-3 mr-1" /> {comments?.filter(c => c.sentiment === "negative").length || 0} Negative
              </Badge>
            </div>
          </div>
          
          <ScrollArea className="flex-1 pr-4 max-h-[350px]">
            <div className="space-y-4">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="relative pl-6 pb-8">
                    {/* Timeline connector */}
                    <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {/* Comment dot with sentiment color */}
                    <div className={`absolute left-0 top-2 h-4 w-4 rounded-full border-2 border-white ${
                      comment.sentiment === "positive" ? "bg-green-500" :
                      comment.sentiment === "negative" ? "bg-red-500" : "bg-gray-400"
                    }`}></div>
                    
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-gray-500">
                            {format(comment.createdAt, "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {getSentimentIcon(comment.sentiment)}
                            <span className="text-sm font-medium">
                              {comment.sentiment === "positive" ? "Positive feedback" :
                               comment.sentiment === "negative" ? "Needs attention" : "Neutral interaction"}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(comment._id)}
                          className="h-6 w-6 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-2">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No comments yet. Add your first interaction note.</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="mt-6 pt-4 border-t">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-base font-medium">Add a new interaction</Label>
                <Textarea
                  id="comment"
                  placeholder="e.g., Customer requested more information about pricing..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Label htmlFor="sentiment" className="min-w-24">Customer sentiment:</Label>
                <div className="flex gap-2 flex-1">
                  <Button
                    type="button"
                    variant={sentiment === "positive" ? "default" : "outline"}
                    className={sentiment === "positive" ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setSentiment("positive")}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Positive
                  </Button>
                  <Button
                    type="button"
                    variant={sentiment === "neutral" ? "default" : "outline"}
                    onClick={() => setSentiment("neutral")}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Neutral
                  </Button>
                  <Button
                    type="button"
                    variant={sentiment === "negative" ? "default" : "outline"}
                    className={sentiment === "negative" ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setSentiment("negative")}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Negative
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">
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
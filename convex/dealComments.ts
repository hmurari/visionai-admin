import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a comment to a deal
export const addComment = mutation({
  args: {
    dealId: v.id("deals"),
    text: v.string(),
    sentiment: v.string(), // "positive", "neutral", "negative"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if the deal exists and belongs to this partner
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    if (deal.partnerId !== identity.subject) {
      throw new Error("You don't have permission to comment on this deal");
    }
    
    // Create the comment
    const commentId = await ctx.db.insert("dealComments", {
      dealId: args.dealId,
      partnerId: identity.subject,
      text: args.text,
      sentiment: args.sentiment,
      createdAt: Date.now(),
    });
    
    // Update the deal with the latest comment info
    await ctx.db.patch(args.dealId, {
      lastCommentAt: Date.now(),
      lastCommentSentiment: args.sentiment,
      lastFollowup: Date.now(), // Update lastFollowup for tracking purposes
    });
    
    return commentId;
  },
});

// Get comments for a deal
export const getComments = query({
  args: {
    dealId: v.id("deals"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if the deal exists and belongs to this partner
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // For partners, only show their own deals' comments
    // For admins, show all comments
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.role !== "admin" && deal.partnerId !== identity.subject) {
      throw new Error("You don't have permission to view these comments");
    }
    
    // Get comments for this deal, ordered by creation time (newest first)
    const comments = await ctx.db
      .query("dealComments")
      .withIndex("by_deal", q => q.eq("dealId", args.dealId))
      .order("desc")
      .collect();
    
    return comments;
  },
});

// Delete a comment
export const deleteComment = mutation({
  args: {
    commentId: v.id("dealComments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get the comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    // Check if the user is the owner of the comment or an admin
    if (comment.partnerId !== identity.subject) {
      // Check if user is admin
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
        .unique();
        
      if (!user || user.role !== "admin") {
        throw new Error("You don't have permission to delete this comment");
      }
    }
    
    // Delete the comment
    await ctx.db.delete(args.commentId);
    
    return { success: true };
  },
}); 
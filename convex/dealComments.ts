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
    
    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if the deal exists
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Check permissions: admin can comment on any deal, partners can only comment on their own deals
    if (user.role !== "admin" && deal.partnerId !== identity.subject) {
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
    
    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if the deal exists
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Check permissions: admin can view any deal's comments, partners can only view their own deals' comments
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

// Get all comments (for deals list view)
export const getAllComments = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user) {
      throw new Error("User not found");
    }
    
    // Admin can see all comments, partners can only see comments for their deals
    if (user.role === "admin") {
      // Admin: Get all comments
      const comments = await ctx.db
        .query("dealComments")
        .order("desc")
        .collect();
      
      return comments;
    } else {
      // Partner: Get comments only for their deals
      const comments = await ctx.db
        .query("dealComments")
        .withIndex("by_partner", q => q.eq("partnerId", identity.subject))
        .order("desc")
        .collect();
      
      return comments;
    }
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
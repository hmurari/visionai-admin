import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a new deal
export const registerDeal = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    opportunityAmount: v.number(),
    expectedCloseDate: v.number(),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
    dealStage: v.optional(v.string()),
    lastFollowup: v.optional(v.number()),
    cameraCount: v.optional(v.number()),
    interestedUsecases: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is a partner
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "partner") {
      throw new Error("Only partners can register deals");
    }
    
    const now = Date.now();
    
    return await ctx.db.insert("deals", {
      partnerId: identity.subject,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      customerAddress: args.customerAddress,
      opportunityAmount: args.opportunityAmount,
      expectedCloseDate: args.expectedCloseDate,
      status: args.status || "pending",
      dealStage: args.dealStage || "new",
      lastFollowup: args.lastFollowup || now, // Default to today's date
      cameraCount: args.cameraCount || 0,
      interestedUsecases: args.interestedUsecases || [],
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing deal
export const updateDeal = mutation({
  args: {
    id: v.id("deals"),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    opportunityAmount: v.number(),
    expectedCloseDate: v.number(),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
    dealStage: v.optional(v.string()),
    lastFollowup: v.optional(v.number()),
    cameraCount: v.optional(v.number()),
    interestedUsecases: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get the deal
    const deal = await ctx.db.get(args.id);
    
    // Check if deal exists
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Check if user is the owner of the deal
    if (deal.partnerId !== identity.subject) {
      throw new Error("You can only update your own deals");
    }
    
    // Update the deal
    return await ctx.db.patch(args.id, {
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      customerAddress: args.customerAddress,
      opportunityAmount: args.opportunityAmount,
      expectedCloseDate: args.expectedCloseDate,
      notes: args.notes,
      status: args.status || deal.status,
      dealStage: args.dealStage || deal.dealStage,
      lastFollowup: args.lastFollowup,
      cameraCount: args.cameraCount,
      interestedUsecases: args.interestedUsecases,
      updatedAt: Date.now(),
    });
  },
});

// Delete a deal
export const deleteDeal = mutation({
  args: {
    id: v.id("deals"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get the deal
    const deal = await ctx.db.get(args.id);
    
    // Check if deal exists
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Check if user is the owner of the deal
    if (deal.partnerId !== identity.subject) {
      throw new Error("You can only delete your own deals");
    }
    
    // Delete the deal
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});

// Get all deals for a partner
export const getPartnerDeals = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    return await ctx.db
      .query("deals")
      .withIndex("by_partnerId", q => q.eq("partnerId", identity.subject))
      .order("desc")
      .collect();
  },
}); 
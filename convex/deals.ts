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
      status: "pending",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
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
      .collect();
  },
}); 
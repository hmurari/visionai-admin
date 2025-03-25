import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveQuote = mutation({
  args: {
    customerName: v.string(),
    companyName: v.string(),
    email: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    totalAmount: v.number(),
    cameraCount: v.number(),
    packageName: v.string(),
    subscriptionType: v.string(),
    deploymentType: v.string(),
    quoteData: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.tokenIdentifier;
    
    return ctx.db.insert("quotes", {
      userId,
      customerName: args.customerName,
      companyName: args.companyName,
      email: args.email,
      address: args.address,
      city: args.city,
      state: args.state,
      zip: args.zip,
      totalAmount: args.totalAmount,
      cameraCount: args.cameraCount,
      packageName: args.packageName,
      subscriptionType: args.subscriptionType,
      deploymentType: args.deploymentType,
      quoteData: args.quoteData,
      createdAt: Date.now(),
    });
  },
});

export const getQuotes = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.tokenIdentifier;
    
    return ctx.db
      .query("quotes")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getRecentQuotes = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.tokenIdentifier;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    return ctx.db
      .query("quotes")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("createdAt"), sevenDaysAgo))
      .order("desc")
      .collect();
  },
});

export const getQuoteById = query({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const quote = await ctx.db.get(args.id);
    if (!quote) {
      throw new Error("Quote not found");
    }
    
    if (quote.userId !== identity.tokenIdentifier) {
      throw new Error("Unauthorized");
    }
    
    return quote;
  },
});

export const deleteQuote = mutation({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.tokenIdentifier;
    
    const quote = await ctx.db.get(args.id);
    if (!quote) {
      throw new Error("Quote not found");
    }
    
    if (quote.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args.id);
    return true;
  },
}); 
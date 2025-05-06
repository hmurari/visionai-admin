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
    customerId: v.optional(v.id("customers")),
    totalAmount: v.number(),
    cameraCount: v.number(),
    packageName: v.string(),
    subscriptionType: v.string(),
    deploymentType: v.string(),
    quoteData: v.any(),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Get user info to include in the quote data
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();
    
    // Use existing customer ID if provided, otherwise find or create customer
    let customerId = args.customerId;
    
    if (!customerId) {
      // Try to find existing customer by email
      const existingCustomer = await ctx.db
        .query("customers")
        .withIndex("by_email", q => q.eq("email", args.email))
        .first();
      
      if (existingCustomer) {
        customerId = existingCustomer._id;
      } else {
        // Create new customer
        customerId = await ctx.db.insert("customers", {
          name: args.customerName,
          companyName: args.companyName,
          email: args.email,
          address: args.address,
          city: args.city,
          state: args.state,
          zip: args.zip,
          createdBy: userId,
          createdAt: Date.now(),
        });
      }
    }
    
    // Add user info to quoteData
    const enhancedQuoteData = {
      ...args.quoteData,
      _userInfo: {
        name: user?.name || identity.name || identity.email?.split('@')[0] || "Unknown",
        email: user?.email || identity.email,
        companyName: user?.companyName || "Unknown Company",
        subject: identity.subject,
      }
    };
    
    // Create the quote - only include fields that are in the schema
    return await ctx.db.insert("quotes", {
      customerName: args.customerName,
      companyName: args.companyName,
      email: args.email,
      customerId: customerId,
      totalAmount: args.totalAmount,
      cameraCount: args.cameraCount,
      packageName: args.packageName,
      subscriptionType: args.subscriptionType,
      deploymentType: args.deploymentType,
      quoteData: enhancedQuoteData,
      userId: userId,
      createdAt: args.createdAt || Date.now(),
    });
  },
});

export const getQuotes = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
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
    
    const userId = identity.subject;
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
    
    if (quote.userId !== identity.subject) {
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
    
    const userId = identity.subject;
    
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

export const listQuotes = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    return ctx.db
      .query("quotes")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
}); 
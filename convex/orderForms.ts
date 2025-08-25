import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveOrderForm = mutation({
  args: {
    quoteId: v.optional(v.id("quotes")),
    customerName: v.string(),
    companyName: v.string(),
    email: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    keyTerms: v.object({
      product: v.string(),
      program: v.string(),
      deployment: v.string(),
      initialTerm: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      licenses: v.string(),
      renewal: v.string(),
    }),
    successCriteria: v.string(),
    termsAndConditions: v.string(),
    orderFormData: v.any(),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Get user info to include in the order form data
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
    
    // Add user info to order form data
    const enhancedOrderFormData = {
      ...args.orderFormData,
      _userInfo: {
        name: user?.name || identity.name || identity.email?.split('@')[0] || "Unknown",
        email: user?.email || identity.email,
        companyName: user?.companyName || "Unknown Company",
        subject: identity.subject,
      }
    };
    
    // Create the order form
    return await ctx.db.insert("orderForms", {
      quoteId: args.quoteId,
      customerName: args.customerName,
      companyName: args.companyName,
      email: args.email,
      customerId: customerId,
      keyTerms: args.keyTerms,
      successCriteria: args.successCriteria,
      termsAndConditions: args.termsAndConditions,
      orderFormData: enhancedOrderFormData,
      userId: userId,
      createdAt: args.createdAt || Date.now(),
    });
  }
});

export const getOrderForms = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    return await ctx.db
      .query("orderForms")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  }
});

export const getOrderForm = query({
  args: { orderFormId: v.id("orderForms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const orderForm = await ctx.db.get(args.orderFormId);
    if (!orderForm) {
      throw new Error("Order form not found");
    }
    
    // Check if user has access to this order form
    if (orderForm.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    return orderForm;
  }
});

export const deleteOrderForm = mutation({
  args: { orderFormId: v.id("orderForms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const orderForm = await ctx.db.get(args.orderFormId);
    if (!orderForm) {
      throw new Error("Order form not found");
    }
    
    // Check if user has access to this order form
    if (orderForm.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args.orderFormId);
    return { success: true };
  }
}); 
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new customer
export const create = mutation({
  args: {
    name: v.string(),
    companyName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.tokenIdentifier;
    
    // Check if customer with this email already exists
    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
    
    if (existingCustomer) {
      return existingCustomer._id;
    }
    
    // Create new customer
    return ctx.db.insert("customers", {
      ...args,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

// Update an existing customer
export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const { id, ...fields } = args;
    
    // Update customer
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

// Get all customers for the current user
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.tokenIdentifier;
    
    return ctx.db
      .query("customers")
      .withIndex("by_creator", q => q.eq("createdBy", userId))
      .order("desc")
      .collect();
  },
});

// Search customers by name, company, or email
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.tokenIdentifier;
    const searchTerm = args.searchTerm.toLowerCase();
    
    // Get all customers created by this user
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_creator", q => q.eq("createdBy", userId))
      .collect();
    
    // Filter by search term
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.companyName.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm)
    );
  },
});

// Get a customer by ID
export const getById = query({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    return ctx.db.get(args.id);
  },
});

// Find or create a customer
export const findOrCreate = mutation({
  args: {
    name: v.string(),
    companyName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.tokenIdentifier;
    
    // Try to find by email first
    let customer = await ctx.db
      .query("customers")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
    
    // If not found, try by company name
    if (!customer) {
      customer = await ctx.db
        .query("customers")
        .withIndex("by_company", q => q.eq("companyName", args.companyName))
        .first();
    }
    
    // If found, return the ID
    if (customer) {
      return customer._id;
    }
    
    // Otherwise create a new customer
    return ctx.db.insert("customers", {
      ...args,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

// Delete a customer
export const deleteCustomer = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    const orgId = identity.tokenIdentifier.split("|")[0];
    
    // Check if customer exists
    const customer = await ctx.db.get(args.id);
    if (!customer) {
      throw new Error("Customer not found");
    }
    
    // Check authorization - allow if user created the customer or is in the same org
    // This is more permissive to handle different auth patterns
    if (customer.userId !== userId && customer.orgId !== orgId) {
      // Log the values to help debug
    //   console.log("Customer userId:", customer.userId);
    //   console.log("Current userId:", userId);
    //   console.log("Customer orgId:", customer.orgId);
    //   console.log("Current orgId:", orgId);
      
      // Check if we're using a different auth pattern
      // If the customer doesn't have userId or orgId fields, we'll allow the deletion
      // This is a fallback for existing data
      if (customer.userId === undefined && customer.orgId === undefined) {
        // Allow deletion for backward compatibility
        console.log("Allowing deletion due to missing auth fields");
      } else {
        throw new Error("Not authorized to delete this customer");
      }
    }
    
    // Delete the customer
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});

// Update the createCustomer mutation to ensure proper auth fields are set

export const createCustomer = mutation({
  args: {
    name: v.string(),
    companyName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    industry: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    const orgId = identity.tokenIdentifier.split("|")[0];
    
    // Create the customer with proper auth fields
    const customerId = await ctx.db.insert("customers", {
      ...args,
      userId,
      orgId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(customerId);
  },
}); 
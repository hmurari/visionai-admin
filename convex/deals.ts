import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a new deal
export const registerDeal = mutation({
  args: {
    customerName: v.string(),
    contactName: v.optional(v.string()),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    customerCity: v.optional(v.string()),
    customerState: v.optional(v.string()),
    customerZip: v.optional(v.string()),
    customerCountry: v.optional(v.string()),
    opportunityAmount: v.number(),
    expectedCloseDate: v.number(),
    notes: v.optional(v.string()),
    cameraCount: v.optional(v.number()),
    interestedUsecases: v.optional(v.array(v.string())),
    commissionRate: v.optional(v.number()),
    approvalStatus: v.optional(v.string()),
    progressStatus: v.optional(v.string()),
    lastFollowup: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Create the deal with both status types and expanded address fields
    const deal = await ctx.db.insert("deals", {
      customerName: args.customerName,
      contactName: args.contactName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      customerAddress: args.customerAddress,
      customerCity: args.customerCity,
      customerState: args.customerState,
      customerZip: args.customerZip,
      customerCountry: args.customerCountry,
      opportunityAmount: args.opportunityAmount,
      commissionRate: args.commissionRate || 20, // Default to 20%
      expectedCloseDate: args.expectedCloseDate,
      notes: args.notes,
      partnerId: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      approvalStatus: args.approvalStatus || "new", // Default approval status
      progressStatus: args.progressStatus || "new", // Default progress status
      cameraCount: args.cameraCount,
      interestedUsecases: args.interestedUsecases,
      lastFollowup: args.lastFollowup || Date.now(),
    });
    
    return deal;
  },
});

// Update an existing deal
export const updateDeal = mutation({
  args: {
    id: v.id("deals"),
    customerName: v.optional(v.string()),
    contactName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    customerCity: v.optional(v.string()),
    customerState: v.optional(v.string()),
    customerZip: v.optional(v.string()),
    customerCountry: v.optional(v.string()),
    opportunityAmount: v.optional(v.number()),
    expectedCloseDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    cameraCount: v.optional(v.number()),
    interestedUsecases: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    dealStage: v.optional(v.string()),
    lastFollowup: v.optional(v.number()),
    approvalStatus: v.optional(v.string()),
    progressStatus: v.optional(v.string()),
    commissionRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const { id, ...fields } = args;
    
    // Get the existing deal
    const existingDeal = await ctx.db.get(id);
    if (!existingDeal) {
      throw new Error("Deal not found");
    }
    
    // Check if the user is the owner of the deal
    if (existingDeal.partnerId !== identity.subject) {
      throw new Error("You don't have permission to update this deal");
    }
    
    // Update the deal
    const updatedDeal = await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    });
    
    return updatedDeal;
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

// Get deals for a partner
export const getPartnerDeals = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    // Get deals for this partner using the correct index name "by_partner"
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_partner", q => q.eq("partnerId", identity.subject))
      .order("desc")
      .collect();
    
    return deals;
  },
});

// Update deal status (for partners to update progressStatus only)
export const updateDealStatus = mutation({
  args: { 
    id: v.id("deals"),
    status: v.string(),
    statusType: v.optional(v.string()) // Make statusType optional for backward compatibility
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get the deal
    const deal = await ctx.db.get(args.id);
    
    // Check if the user is the owner of the deal
    if (deal.partnerId !== identity.subject) {
      throw new Error("You don't have permission to update this deal");
    }
    
    // Partners can only update progressStatus
    const updateFields = {
      updatedAt: Date.now()
    };
    
    // If statusType is specified and is "progressStatus", update progressStatus
    // Otherwise, update the legacy status field for backward compatibility
    if (args.statusType === "progressStatus") {
      updateFields.progressStatus = args.status;
    } else {
      // For backward compatibility, update both fields
      updateFields.progressStatus = args.status;
      updateFields.status = args.status; // For backward compatibility
    }
    
    await ctx.db.patch(args.id, updateFields);
    
    return { success: true };
  },
}); 
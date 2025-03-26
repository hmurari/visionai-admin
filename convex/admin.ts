import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all partner applications
export const getPartnerApplications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    return await ctx.db.query("partnerApplications").collect();
  },
});

// Approve partner application
export const approvePartnerApplication = mutation({
  args: { applicationId: v.id("partnerApplications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Get the application
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }
    
    // Update application status
    await ctx.db.patch(args.applicationId, {
      status: "approved",
      reviewedAt: Date.now(),
      reviewedBy: identity.subject,
    });
    
    // Update user role to partner
    const partnerUser = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", application.userId))
      .unique();
      
    if (partnerUser) {
      // Copy all relevant fields from the application to the user profile
      await ctx.db.patch(partnerUser._id, {
        role: "partner",
        companyName: application.companyName,
        partnerStatus: "active",
        joinDate: Date.now(),
        // Copy additional fields from the application
        industryFocus: application.industryFocus,
        annualRevenue: application.annualRevenue,
        reasonForPartnership: application.reasonForPartnership,
        country: application.region, // Use region as country
        website: application.website,
        phone: application.contactPhone,
        // We could also map other fields if needed
      });
    }
    
    return { success: true };
  },
});

// Reject partner application
export const rejectPartnerApplication = mutation({
  args: { applicationId: v.id("partnerApplications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Update application status
    await ctx.db.patch(args.applicationId, {
      status: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: identity.subject,
    });
    
    return { success: true };
  },
});

// Delete learning material
export const deleteLearningMaterial = mutation({
  args: { materialId: v.id("learningMaterials") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    await ctx.db.delete(args.materialId);
    
    return { success: true };
  },
});

// Get all deals
export const getAllDeals = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    return await ctx.db.query("deals").collect();
  },
});

// Register deal
export const registerDeal = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Update deal status to registered
    await ctx.db.patch(args.dealId, {
      status: "registered",
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Close deal
export const closeDeal = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Update deal status
    await ctx.db.patch(args.dealId, {
      status: "closed",
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Add this function to convex/admin.ts
export const getAllUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Return all users
    return await ctx.db.query("users").collect();
  },
});

// Update deal status (admin version)
export const updateDealStatus = mutation({
  args: { 
    dealId: v.id("deals"),
    status: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
    
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can perform this action");
    }
    
    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Update with the new single status
    await ctx.db.patch(args.dealId, {
      status: args.status,
      updatedAt: Date.now()
    });
    
    return { success: true };
  },
});

// Update an existing deal (admin version)
export const updateDeal = mutation({
  args: {
    dealId: v.id("deals"),
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
    commissionRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
    
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can perform this action");
    }
    
    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Prepare update fields
    const updateFields = {};
    
    // Only include fields that are provided
    for (const [key, value] of Object.entries(args)) {
      if (key !== "dealId" && value !== undefined) {
        updateFields[key] = value;
      }
    }
    
    // Always update the updatedAt timestamp
    updateFields.updatedAt = Date.now();
    
    // Update the deal
    await ctx.db.patch(args.dealId, updateFields);
    
    return { success: true };
  },
});

// Delete a deal (admin only)
export const deleteDeal = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Delete the deal
    await ctx.db.delete(args.dealId);
    
    return { success: true };
  },
});

// Update the getAllQuotes function
export const getAllQuotes = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();
    
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Get all quotes
    return ctx.db
      .query("quotes")
      .order("desc")
      .collect();
  },
});

// Update the deleteQuote function
export const deleteQuote = mutation({
  args: { id: v.id("quotes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();
    
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Delete the quote
    await ctx.db.delete(args.id);
    return true;
  },
});

// Delete a partner
export const deletePartner = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Find the partner user
    const partnerUser = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.userId))
      .unique();
      
    if (!partnerUser) {
      throw new Error("Partner not found");
    }
    
    // Delete the partner's application if it exists
    const application = await ctx.db
      .query("partnerApplications")
      .withIndex("by_user_id", q => q.eq("userId", args.userId))
      .first();
      
    if (application) {
      await ctx.db.delete(application._id);
    }
    
    // Reset the user's role to a regular user
    await ctx.db.patch(partnerUser._id, {
      role: "user",
      partnerStatus: undefined,
      companyName: undefined,
      joinDate: undefined,
    });
    
    return { success: true };
  },
}); 
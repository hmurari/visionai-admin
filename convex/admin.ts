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
      await ctx.db.patch(partnerUser._id, {
        role: "partner",
        companyName: application.companyName,
        partnerStatus: "active",
        joinDate: Date.now(),
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

// Approve deal
export const approveDeal = mutation({
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
      approvalStatus: "registered",
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Reject deal
export const rejectDeal = mutation({
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
      status: "rejected",
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

// Update deal status
export const updateDealStatus = mutation({
  args: { 
    dealId: v.id("deals"),
    statusType: v.string(), // "approvalStatus" or "progressStatus"
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
      throw new Error("Admin access required");
    }
    
    // Update the appropriate status field
    const updateFields = {
      updatedAt: Date.now()
    };
    
    if (args.statusType === "approvalStatus") {
      updateFields.approvalStatus = args.status;
    } else if (args.statusType === "progressStatus") {
      updateFields.progressStatus = args.status;
    } else {
      throw new Error("Invalid status type");
    }
    
    await ctx.db.patch(args.dealId, updateFields);
    
    return { success: true };
  },
});

// Update deal (for admin editing)
export const updateDeal = mutation({
  args: {
    dealId: v.id("deals"),
    customerName: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    contactName: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    customerCity: v.optional(v.string()),
    customerState: v.optional(v.string()),
    customerZip: v.optional(v.string()),
    customerCountry: v.optional(v.string()),
    opportunityAmount: v.optional(v.number()),
    commissionRate: v.optional(v.number()),
    expectedCloseDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    approvalStatus: v.optional(v.string()),
    progressStatus: v.optional(v.string()),
    cameraCount: v.optional(v.number()),
    interestedUsecases: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    dealStage: v.optional(v.string()),
    lastFollowup: v.optional(v.number()),
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
      throw new Error("Admin access required");
    }
    
    const { dealId, ...fields } = args;
    
    // Update the deal
    await ctx.db.patch(dealId, {
      ...fields,
      updatedAt: Date.now(),
    });
    
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
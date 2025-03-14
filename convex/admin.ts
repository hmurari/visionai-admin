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
      status: "approved",
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
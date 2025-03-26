import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit partner application
export const submitApplication = mutation({
  args: {
    companyName: v.string(),
    businessType: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    website: v.optional(v.string()),
    reasonForPartnership: v.string(),
    region: v.optional(v.string()),
    annualRevenue: v.optional(v.string()),
    industryFocus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if user already has an application
    const existingApplication = await ctx.db
      .query("partnerApplications")
      .withIndex("by_user_id", q => q.eq("userId", identity.subject))
      .first();
      
    if (existingApplication) {
      throw new Error("You have already submitted an application");
    }
    
    const now = Date.now();
    
    // Create new application with both field structures for compatibility
    const applicationId = await ctx.db.insert("partnerApplications", {
      userId: identity.subject,
      companyName: args.companyName,
      businessType: args.businessType,
      contactName: args.contactName,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      website: args.website,
      reasonForPartnership: args.reasonForPartnership,
      region: args.region,
      annualRevenue: args.annualRevenue,
      industryFocus: args.industryFocus,
      status: "pending",
      createdAt: now,     // New field
      submittedAt: now,   // Old field
      updatedAt: now,     // New field
    });
    
    return applicationId;
  },
});

// Get partner application status
export const getApplicationStatus = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    const application = await ctx.db
      .query("partnerApplications")
      .withIndex("by_user_id", q => q.eq("userId", identity.subject))
      .first();
      
    return application;
  },
});

// Approve partner application
export const approveApplication = mutation({
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
      approvedAt: Date.now(),
      approvedBy: identity.subject,
    });
    
    // Find the user who submitted the application
    const applicantUser = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", application.userId))
      .unique();
    
    if (applicantUser) {
      // Update user role to partner
      await ctx.db.patch(applicantUser._id, {
        role: "partner"
      });
    }
    
    return { success: true };
  },
});

// Get all partner applications (for admin)
export const getAllApplications = query({
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
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
    acceptedTermsOfService: v.boolean(),
    acceptedCommissionSchedule: v.boolean(),
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
    
    // Validate that both terms are accepted
    if (!args.acceptedTermsOfService || !args.acceptedCommissionSchedule) {
      throw new Error("You must accept both the Partner Terms of Service and Commission Schedule to proceed");
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
      acceptedTermsOfService: args.acceptedTermsOfService,
      acceptedCommissionSchedule: args.acceptedCommissionSchedule,
      termsAcceptedAt: now,
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

// Update partner application
export const updateApplication = mutation({
  args: {
    companyName: v.optional(v.string()),
    businessType: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    reasonForPartnership: v.optional(v.string()),
    region: v.optional(v.string()),
    annualRevenue: v.optional(v.string()),
    industryFocus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Find the user's application
    const application = await ctx.db
      .query("partnerApplications")
      .withIndex("by_user_id", q => q.eq("userId", identity.subject))
      .first();
      
    if (!application) {
      throw new Error("Application not found");
    }
    
    // Don't allow editing if application is already approved or rejected
    if (application.status !== "pending") {
      throw new Error("Cannot edit application after it has been reviewed");
    }
    
    // Update the application
    const now = Date.now();
    await ctx.db.patch(application._id, {
      ...args,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

// Accept new terms for existing partners
export const acceptNewTerms = mutation({
  args: {
    acceptedTermsOfService: v.boolean(),
    acceptedCommissionSchedule: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Find the user's application
    const application = await ctx.db
      .query("partnerApplications")
      .withIndex("by_user_id", q => q.eq("userId", identity.subject))
      .first();
      
    if (!application) {
      throw new Error("Partner application not found");
    }
    
    // Only approved partners should be updating terms
    if (application.status !== "approved") {
      throw new Error("Only approved partners can accept new terms");
    }
    
    // Validate that both terms are accepted
    if (!args.acceptedTermsOfService || !args.acceptedCommissionSchedule) {
      throw new Error("You must accept both the Partner Terms of Service and Commission Schedule to proceed");
    }
    
    const now = Date.now();
    
    // Update the application with new terms acceptance
    await ctx.db.patch(application._id, {
      acceptedTermsOfService: args.acceptedTermsOfService,
      acceptedCommissionSchedule: args.acceptedCommissionSchedule,
      termsAcceptedAt: now,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

// Check if partner needs to accept new terms
export const needsToAcceptNewTerms = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    
    const application = await ctx.db
      .query("partnerApplications")
      .withIndex("by_user_id", q => q.eq("userId", identity.subject))
      .first();
      
    if (!application) {
      return false;
    }
    
    // Internal users are exempt from terms acceptance
    if (application.isInternalUser) {
      return false;
    }
    
    // If approved but hasn't accepted the new terms, they need to accept
    return (
      application.status === "approved" &&
      (!application.acceptedTermsOfService || !application.acceptedCommissionSchedule)
    );
  },
});

// Toggle internal user status (admin only)
export const toggleInternalUser = mutation({
  args: {
    applicationId: v.id("partnerApplications"),
    isInternalUser: v.boolean(),
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
    
    const now = Date.now();
    
    // Update the application
    await ctx.db.patch(args.applicationId, {
      isInternalUser: args.isInternalUser,
      updatedAt: now,
    });
    
    return { success: true };
  },
}); 
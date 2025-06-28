import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    const updateFields: Partial<{
      customerName: string;
      contactName: string;
      customerEmail: string;
      customerPhone: string;
      customerAddress: string;
      customerCity: string;
      customerState: string;
      customerZip: string;
      customerCountry: string;
      opportunityAmount: number;
      expectedCloseDate: number;
      notes: string;
      cameraCount: number;
      interestedUsecases: string[];
      commissionRate: number;
      status: string;
      dealStage: string;
      updatedAt: number;
    }> = {};
    
    // Only include fields that are provided
    for (const [key, value] of Object.entries(args)) {
      if (key !== "dealId" && value !== undefined) {
        (updateFields as any)[key] = value;
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

// Admin: Create and assign deal to partner
export const createAndAssignDeal = mutation({
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
    assignedPartnerId: v.string(), // Partner to assign the deal to
    status: v.optional(v.string()),
    dealStage: v.optional(v.string()),
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
    
    // Verify that the assigned partner exists and is a partner
    const assignedPartner = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.assignedPartnerId))
      .unique();
      
    if (!assignedPartner) {
      throw new Error("Assigned partner not found");
    }
    
    if (assignedPartner.role !== "partner") {
      throw new Error("Assigned user is not a partner");
    }
    
    // Create the deal and assign it to the partner
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
      partnerId: args.assignedPartnerId, // Assign to the specified partner
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: args.status || "assigned", // New status for admin-assigned deals
      dealStage: args.dealStage || "prospecting",
      cameraCount: args.cameraCount,
      interestedUsecases: args.interestedUsecases,
      lastFollowup: Date.now(),
      assignedBy: identity.subject, // Track which admin assigned the deal
    });
    
    return deal;
  },
});

// Admin: Reassign deal to different partner
export const reassignDeal = mutation({
  args: {
    dealId: v.id("deals"),
    newPartnerId: v.string(),
    reassignmentNotes: v.optional(v.string()),
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
    
    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Verify that the new partner exists and is a partner
    const newPartner = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.newPartnerId))
      .unique();
      
    if (!newPartner) {
      throw new Error("New partner not found");
    }
    
    if (newPartner.role !== "partner") {
      throw new Error("Assigned user is not a partner");
    }
    
    // Update the deal with new partner assignment
    await ctx.db.patch(args.dealId, {
      partnerId: args.newPartnerId,
      updatedAt: Date.now(),
      status: "reassigned",
      notes: args.reassignmentNotes ? 
        `${deal.notes || ""}\n\nReassigned by admin: ${args.reassignmentNotes}` : 
        deal.notes,
      reassignedBy: identity.subject,
      reassignedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Admin: Get all deals by a specific partner
export const getDealsByPartner = query({
  args: { partnerId: v.string() },
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
    
    // Get all deals for the specified partner
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_partner", q => q.eq("partnerId", args.partnerId))
      .order("desc")
      .collect();
    
    return deals;
  },
});

// Admin: Get partner performance summary
export const getPartnerPerformanceSummary = query({
  args: { partnerId: v.string() },
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
    
    // Get partner information
    const partner = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.partnerId))
      .unique();
      
    if (!partner) {
      throw new Error("Partner not found");
    }
    
    // Get all deals for this partner
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_partner", q => q.eq("partnerId", args.partnerId))
      .collect();
    
    // Calculate performance metrics
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + deal.opportunityAmount, 0);
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    
    const dealsByStatus = deals.reduce((acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1;
      return acc;
    }, {});
    
    const closedDeals = deals.filter(deal => deal.status === "closed" || deal.status === "won");
    const closedValue = closedDeals.reduce((sum, deal) => sum + deal.opportunityAmount, 0);
    const conversionRate = totalDeals > 0 ? (closedDeals.length / totalDeals) * 100 : 0;
    
    const totalCommission = closedDeals.reduce((sum, deal) => 
      sum + (deal.opportunityAmount * (deal.commissionRate || 20) / 100), 0
    );
    
    return {
      partner: {
        name: partner.name,
        email: partner.email,
        companyName: partner.companyName,
        joinDate: partner.joinDate,
      },
      metrics: {
        totalDeals,
        totalValue,
        averageDealSize,
        closedDeals: closedDeals.length,
        closedValue,
        conversionRate,
        totalCommission,
        dealsByStatus,
      },
      recentDeals: deals.slice(0, 5), // Last 5 deals
    };
  },
});

// Admin: Get all partners with deal counts
export const getPartnersWithDealCounts = query({
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
    
    // Get all partners
    const allUsers = await ctx.db.query("users").collect();
    const partners = allUsers.filter(user => user.role === "partner");
    
    // Get deal counts for each partner
    const partnersWithCounts = await Promise.all(
      partners.map(async (partner) => {
        const deals = await ctx.db
          .query("deals")
          .withIndex("by_partner", q => q.eq("partnerId", partner.tokenIdentifier))
          .collect();
          
        const activeDealCount = deals.filter(deal => 
          !["closed", "won", "lost", "cancelled"].includes(deal.status)
        ).length;
        
        const closedDealCount = deals.filter(deal => 
          ["closed", "won"].includes(deal.status)
        ).length;
        
        const totalValue = deals.reduce((sum, deal) => sum + deal.opportunityAmount, 0);
        
        return {
          ...partner,
          dealCounts: {
            total: deals.length,
            active: activeDealCount,
            closed: closedDealCount,
            totalValue,
          },
        };
      })
    );
    
    return partnersWithCounts;
  },
});

// Admin: Assign existing deal to partner
export const assignExistingDeal = mutation({
  args: {
    dealId: v.id("deals"),
    partnerId: v.string(),
    assignmentNotes: v.optional(v.string()),
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
    
    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }
    
    // Get the target partner
    const partner = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.partnerId))
      .unique();
      
    if (!partner || partner.role !== "partner") {
      throw new Error("Invalid partner");
    }
    
    // Update the deal with assignment information
    await ctx.db.patch(args.dealId, {
      partnerId: args.partnerId,
      assignedBy: identity.subject,
      assignedAt: Date.now(),
      status: "assigned",
      assignmentNotes: args.assignmentNotes,
    });
    
    // Schedule email notification
    try {
      await ctx.scheduler.runAfter(0, api.email.sendDealAssignmentEmail, {
        dealId: args.dealId,
        partnerEmail: partner.email,
        partnerName: partner.name || "Partner",
        partnerCompanyName: partner.companyName || "Unknown Company",
        assignedBy: user.name || user.email || "Admin",
        assignmentNotes: args.assignmentNotes,
        dealDetails: {
          customerName: deal.customerName,
          opportunityAmount: deal.opportunityAmount,
          expectedCloseDate: deal.expectedCloseDate,
          cameraCount: deal.cameraCount,
          interestedUsecases: deal.interestedUsecases,
          notes: deal.notes,
          commissionRate: deal.commissionRate,
        },
      });
    } catch (emailError) {
      console.error("Error scheduling email:", emailError);
      // Don't throw here - deal assignment should succeed even if email fails
    }
    
    return { success: true };
  },
});

// Get all partners with comprehensive information
export const getAllPartners = query({
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
    
    // Get all users with partner role
    const allUsers = await ctx.db.query("users").collect();
    const partners = allUsers.filter(user => user.role === "partner");
    
    // Get partner applications and deal counts for each partner
    const partnersWithDetails = await Promise.all(
      partners.map(async (partner) => {
        // Get partner application
        const application = await ctx.db
          .query("partnerApplications")
          .withIndex("by_user_id", q => q.eq("userId", partner.tokenIdentifier))
          .first();
          
        // Get deal counts
        const deals = await ctx.db
          .query("deals")
          .withIndex("by_partner", q => q.eq("partnerId", partner.tokenIdentifier))
          .collect();
          
        const activeDealCount = deals.filter(deal => 
          !["closed", "won", "lost", "cancelled"].includes(deal.status)
        ).length;
        
        const closedDealCount = deals.filter(deal => 
          ["closed", "won"].includes(deal.status)
        ).length;
        
        const totalValue = deals.reduce((sum, deal) => sum + deal.opportunityAmount, 0);
        const closedValue = deals
          .filter(deal => ["closed", "won"].includes(deal.status))
          .reduce((sum, deal) => sum + deal.opportunityAmount, 0);
        
        return {
          ...partner,
          application,
          dealCounts: {
            total: deals.length,
            active: activeDealCount,
            closed: closedDealCount,
            totalValue,
            closedValue,
          },
        };
      })
    );
    
    return partnersWithDetails;
  },
});

// Update partner details
export const updatePartner = mutation({
  args: {
    partnerId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    companyName: v.optional(v.string()),
    businessType: v.optional(v.string()),
    website: v.optional(v.string()),
    country: v.optional(v.string()),
    industryFocus: v.optional(v.string()),
    annualRevenue: v.optional(v.string()),
    partnerStatus: v.optional(v.string()),
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
    
    // Find the partner user
    const partnerUser = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.partnerId))
      .unique();
      
    if (!partnerUser) {
      throw new Error("Partner not found");
    }
    
    if (partnerUser.role !== "partner") {
      throw new Error("User is not a partner");
    }
    
    // Update the partner user
    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.email !== undefined) updateData.email = args.email;
    if (args.phone !== undefined) updateData.phone = args.phone;
    if (args.companyName !== undefined) updateData.companyName = args.companyName;
    if (args.website !== undefined) updateData.website = args.website;
    if (args.country !== undefined) updateData.country = args.country;
    if (args.industryFocus !== undefined) updateData.industryFocus = args.industryFocus;
    if (args.annualRevenue !== undefined) updateData.annualRevenue = args.annualRevenue;
    if (args.partnerStatus !== undefined) updateData.partnerStatus = args.partnerStatus;
    
    await ctx.db.patch(partnerUser._id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    // Also update the partner application if it exists
    const application = await ctx.db
      .query("partnerApplications")
      .withIndex("by_user_id", q => q.eq("userId", args.partnerId))
      .first();
      
    if (application) {
      const appUpdateData: any = {};
      if (args.companyName !== undefined) appUpdateData.companyName = args.companyName;
      if (args.businessType !== undefined) appUpdateData.businessType = args.businessType;
      if (args.phone !== undefined) appUpdateData.contactPhone = args.phone;
      if (args.website !== undefined) appUpdateData.website = args.website;
      if (args.country !== undefined) appUpdateData.region = args.country;
      if (args.industryFocus !== undefined) appUpdateData.industryFocus = args.industryFocus;
      if (args.annualRevenue !== undefined) appUpdateData.annualRevenue = args.annualRevenue;
      
      if (Object.keys(appUpdateData).length > 0) {
        await ctx.db.patch(application._id, {
          ...appUpdateData,
          updatedAt: Date.now(),
        });
      }
    }
    
    return { success: true };
  },
});

// Disable/Enable partner
export const togglePartnerStatus = mutation({
  args: { 
    partnerId: v.string(),
    disable: v.boolean(),
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
    
    // Find the partner user
    const partnerUser = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.partnerId))
      .unique();
      
    if (!partnerUser) {
      throw new Error("Partner not found");
    }
    
    if (partnerUser.role !== "partner") {
      throw new Error("User is not a partner");
    }
    
    // Update partner status
    await ctx.db.patch(partnerUser._id, {
      partnerStatus: args.disable ? "disabled" : "active",
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
}); 
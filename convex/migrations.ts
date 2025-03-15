import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Migration to add approvalStatus and progressStatus to existing deals
export const migrateDealsToNewSchema = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all deals
    const deals = await ctx.db.query("deals").collect();
    
    // Update each deal to add the required fields
    for (const deal of deals) {
      // Map the old status to new status fields
      let approvalStatus = "new";
      let progressStatus = "new";
      
      // If the deal has a status field, map it to the appropriate new fields
      if (deal.status) {
        if (deal.status === "won" || deal.status === "lost") {
          progressStatus = deal.status;
        } else if (deal.status === "pending") {
          progressStatus = "in_progress";
        }
      }
      
      // If the deal has a dealStage field, use it to determine approvalStatus
      if (deal.dealStage && deal.dealStage !== "new") {
        approvalStatus = "registered";
      }
      
      // Update the deal with the new fields
      await ctx.db.patch(deal._id, {
        approvalStatus,
        progressStatus,
      });
    }
    
    return { migrated: deals.length };
  },
});

// Migration to add createdAt to users without it
export const migrateUsersSchema = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();
    
    let migratedCount = 0;
    
    // Update each user that doesn't have createdAt
    for (const user of users) {
      if (user.createdAt === undefined) {
        // Use joinDate if available, otherwise use current timestamp
        const createdAt = user.joinDate || Date.now();
        
        await ctx.db.patch(user._id, {
          createdAt,
        });
        
        migratedCount++;
      }
    }
    
    return { migrated: migratedCount };
  },
});

// Migration to remove old status fields
export const removeOldStatusFields = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all deals
    const deals = await ctx.db.query("deals").collect();
    
    let migratedCount = 0;
    
    // Update each deal to remove old fields
    for (const deal of deals) {
      const updateObj = {};
      
      // Check if old fields exist and need to be removed
      if (deal.status !== undefined) {
        updateObj.status = undefined;
      }
      
      if (deal.dealStage !== undefined) {
        updateObj.dealStage = undefined;
      }
      
      // Only update if there are fields to remove
      if (Object.keys(updateObj).length > 0) {
        await ctx.db.patch(deal._id, updateObj);
        migratedCount++;
      }
    }
    
    return { migrated: migratedCount };
  },
});

// Migration to add createdAt to partner applications
export const migratePartnerApplications = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all partner applications
    const applications = await ctx.db.query("partnerApplications").collect();
    
    let migratedCount = 0;
    
    // Update each application that doesn't have createdAt
    for (const app of applications) {
      if (app.createdAt === undefined) {
        // Use submittedAt if available, otherwise use current timestamp
        const createdAt = app.submittedAt || Date.now();
        
        await ctx.db.patch(app._id, {
          createdAt,
        });
        
        migratedCount++;
      }
    }
    
    return { migrated: migratedCount };
  },
}); 
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Migration to update the admin.updateDeal function to accept contactName
export const addContactNameToAdminUpdateDeal = mutation({
  args: {},
  handler: async (ctx) => {
    // This is a schema migration, so we don't need to modify any data
    // The actual change will be in the admin.ts file
    
    return { 
      success: true, 
      message: "Migration complete. Please update the admin.ts file to include contactName in the updateDeal function."
    };
  },
}); 
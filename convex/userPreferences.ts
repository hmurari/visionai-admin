import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user preference for showing the progress tracker
export const getProgressTrackerPreference = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { showTracker: true, hasSeenConfetti: false };
    }
    
    const userId = identity.tokenIdentifier;
    
    // Check if user has a preference
    const preference = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_and_key", (q) => 
        q.eq("userId", userId).eq("key", "progressTracker")
      )
      .first();
    
    if (!preference) {
      return { showTracker: true, hasSeenConfetti: false };
    }
    
    return {
      showTracker: preference.showTracker ?? true,
      hasSeenConfetti: preference.hasSeenConfetti ?? false
    };
  },
});

// Update user preference for showing the progress tracker
export const updateProgressTrackerPreference = mutation({
  args: {
    showTracker: v.optional(v.boolean()),
    hasSeenConfetti: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.tokenIdentifier;
    
    // Check if user already has a preference
    const existingPreference = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_and_key", (q) => 
        q.eq("userId", userId).eq("key", "progressTracker")
      )
      .first();
    
    if (existingPreference) {
      // Update existing preference
      await ctx.db.patch(existingPreference._id, {
        ...(args.showTracker !== undefined ? { showTracker: args.showTracker } : {}),
        ...(args.hasSeenConfetti !== undefined ? { hasSeenConfetti: args.hasSeenConfetti } : {}),
        updatedAt: Date.now(),
      });
    } else {
      // Create new preference
      await ctx.db.insert("userPreferences", {
        userId,
        key: "progressTracker",
        showTracker: args.showTracker ?? true,
        hasSeenConfetti: args.hasSeenConfetti ?? false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return true;
  },
}); 
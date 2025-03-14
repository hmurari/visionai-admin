import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Make a user an admin (for development purposes only)
export const makeAdmin = mutation({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update the user role to admin
    await ctx.db.patch(user._id, {
      role: "admin"
    });
    
    return { success: true, message: "User is now an admin" };
  },
}); 
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store user information from Clerk
export const store = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if user already exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (user !== null) {
      // User already exists, return the ID
      return user._id;
    }

    // Extract name from email if name is not provided
    const userName = identity.name || identity.email?.split('@')[0] || 'User';

    // Create a new user
    return await ctx.db.insert("users", {
      name: userName, // Use the extracted name or fallback
      email: identity.email,
      image: identity.pictureUrl,
      tokenIdentifier: identity.subject,
      role: "user", // Default role
      createdAt: Date.now(), // Add the current timestamp
    });
  },
});

// Get user by token
export const getUserByToken = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();
  },
});

export const createOrUpdateUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    // Check if user exists by token identifier (primary method)
    let existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.subject)
      )
      .unique();

    // If not found by token, check by email (fallback for when Clerk token changes)
    if (!existingUser && identity.email) {
      const allUsers = await ctx.db.query("users").collect();
      existingUser = allUsers.find(u => u.email === identity.email) || null;
      
      // If found by email but token is different, update the token
      if (existingUser) {
        console.log(`Updating tokenIdentifier for user ${identity.email} from ${existingUser.tokenIdentifier} to ${identity.subject}`);
        await ctx.db.patch(existingUser._id, {
          tokenIdentifier: identity.subject,
        });
      }
    }

    // Extract name from email if name is not provided
    const userName = identity.name || identity.email?.split('@')[0] || 'User';

    if (existingUser) {
      // Update if needed
      if (existingUser.name !== identity.name || existingUser.email !== identity.email) {
        await ctx.db.patch(existingUser._id, {
          name: userName, // Use the extracted name or fallback
          email: identity.email,
        });
      }
      return existingUser;
    }

    // Create new user only if not found by token OR email
    const userId = await ctx.db.insert("users", {
      name: userName, // Use the extracted name or fallback
      email: identity.email,
      image: identity.pictureUrl,
      tokenIdentifier: identity.subject,
      role: "user", // Default role
      createdAt: Date.now(), // Add the current timestamp
    });

    return await ctx.db.get(userId);
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companySize: v.optional(v.string()),
    industryFocus: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    website: v.optional(v.string()),
    annualRevenue: v.optional(v.string()),
    reasonForPartnership: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
      
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update the user profile
    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });
    
    // If this is a partner, also update their application if it exists
    if (user.role === "partner") {
      const application = await ctx.db
        .query("partnerApplications")
        .withIndex("by_user_id", q => q.eq("userId", identity.subject))
        .first();
        
      if (application) {
        // Map user profile fields to application fields
        const applicationUpdates = {
          companyName: args.companyName,
          website: args.website,
          reasonForPartnership: args.reasonForPartnership,
          region: args.country, // Map country to region
          annualRevenue: args.annualRevenue,
          industryFocus: args.industryFocus,
          contactPhone: args.phone,
          updatedAt: Date.now(),
        };
        
        // Only include fields that were actually provided
        const filteredUpdates = Object.entries(applicationUpdates)
          .filter(([key, value]) => value !== undefined)
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
          
        if (Object.keys(filteredUpdates).length > 0) {
          await ctx.db.patch(application._id, filteredUpdates);
        }
      }
    }
    
    return { success: true };
  },
});
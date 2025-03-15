import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add learning material (admin only)
export const addMaterial = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    link: v.string(),
    type: v.string(),
    tags: v.array(v.string()),
    featured: v.optional(v.boolean()),
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
    
    return await ctx.db.insert("learningMaterials", {
      title: args.title,
      description: args.description,
      link: args.link,
      type: args.type,
      tags: args.tags,
      uploadedBy: identity.subject,
      uploadedAt: Date.now(),
      featured: args.featured || false,
    });
  },
});

// Get all learning materials
export const getAllMaterials = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
    
    // For development purposes, allow all authenticated users to access materials
    // In production, you might want to restrict this to partners and admins
    // if (!user || (user.role !== "partner" && user.role !== "admin")) {
    //   throw new Error("Only partners can access learning materials");
    // }
    
    return await ctx.db.query("learningMaterials").collect();
  },
});

// Get learning materials by type
export const getMaterialsByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
    
    // For development purposes, allow all authenticated users to access materials
    // if (!user || (user.role !== "partner" && user.role !== "admin")) {
    //   throw new Error("Only partners can access learning materials");
    // }
    
    return await ctx.db
      .query("learningMaterials")
      .withIndex("by_type", q => q.eq("type", args.type))
      .collect();
  },
});

// Get learning materials by tags
export const getMaterialsByTags = query({
  args: { tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Get user info to check role
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.subject))
      .unique();
    
    // For development purposes, allow all authenticated users to access materials
    // if (!user || (user.role !== "partner" && user.role !== "admin")) {
    //   throw new Error("Only partners can access learning materials");
    // }
    
    const materials = await ctx.db.query("learningMaterials").collect();
    return materials.filter(material => 
      material.tags.some(tag => args.tags.includes(tag))
    );
  },
});

// Update learning material (admin only)
export const updateMaterial = mutation({
  args: {
    id: v.id("learningMaterials"),
    title: v.string(),
    description: v.string(),
    link: v.string(),
    type: v.string(),
    tags: v.array(v.string()),
    featured: v.optional(v.boolean()),
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
    
    // Check if material exists
    const material = await ctx.db.get(args.id);
    if (!material) {
      throw new Error("Material not found");
    }
    
    return await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      link: args.link,
      type: args.type,
      tags: args.tags,
      featured: args.featured || false,
      updatedAt: Date.now(),
    });
  },
});

// Delete learning material (admin only)
export const deleteMaterial = mutation({
  args: {
    id: v.id("learningMaterials"),
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
    
    // Check if material exists
    const material = await ctx.db.get(args.id);
    if (!material) {
      throw new Error("Material not found");
    }
    
    return await ctx.db.delete(args.id);
  },
}); 
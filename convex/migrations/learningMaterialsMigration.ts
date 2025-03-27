import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Export all learning materials to a JSON format
export const exportLearningMaterials = action({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Check if user is admin
    const user = await ctx.runQuery(api.users.getUserByToken, {
      tokenIdentifier: identity.subject
    });
      
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    // Get all learning materials from the database
    const materials = await ctx.runQuery(api.learningMaterials.getAllMaterials);
    
    // Convert to a format suitable for import (removing internal IDs)
    const exportData = materials.map(material => ({
      title: material.title,
      description: material.description,
      link: material.link,
      type: material.type,
      tags: material.tags,
      featured: material.featured || false,
      uploadedBy: material.uploadedBy,
      uploadedAt: material.uploadedAt,
      updatedAt: material.updatedAt,
    }));
    
    return exportData;
  },
});

// Import learning materials from provided data
export const importLearningMaterials = mutation({
  args: {
    materials: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        link: v.string(),
        type: v.string(),
        tags: v.array(v.string()),
        featured: v.optional(v.boolean()),
        uploadedBy: v.string(),
        uploadedAt: v.number(),
        updatedAt: v.optional(v.number()),
      })
    ),
    clearExisting: v.optional(v.boolean()),
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
    
    // If clearExisting is true, delete all existing learning materials
    if (args.clearExisting) {
      const existingMaterials = await ctx.db.query("learningMaterials").collect();
      for (const material of existingMaterials) {
        await ctx.db.delete(material._id);
      }
    } else {
      // Get existing materials to check for duplicates
      const existingMaterials = await ctx.db.query("learningMaterials").collect();
      
      // Create a map of titles to existing materials
      const existingMaterialsByTitle = new Map();
      for (const material of existingMaterials) {
        existingMaterialsByTitle.set(material.title, material);
      }
      
      // Delete any materials that will be replaced by newer versions
      for (const newMaterial of args.materials) {
        const existingMaterial = existingMaterialsByTitle.get(newMaterial.title);
        if (existingMaterial) {
          await ctx.db.delete(existingMaterial._id);
        }
      }
    }
    
    // Insert all materials
    const insertedIds = [];
    for (const material of args.materials) {
      const id = await ctx.db.insert("learningMaterials", {
        title: material.title,
        description: material.description,
        link: material.link,
        type: material.type,
        tags: material.tags,
        uploadedBy: material.uploadedBy,
        uploadedAt: material.uploadedAt,
        updatedAt: material.updatedAt || material.uploadedAt,
        featured: material.featured || false,
      });
      insertedIds.push(id);
    }
    
    return { count: insertedIds.length, ids: insertedIds };
  },
}); 
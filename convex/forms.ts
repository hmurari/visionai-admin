import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const submitForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Form submission received:", args);

    // Store the form submission in the forms table
    return await ctx.db.insert("forms", {
      name: args.name,
      email: args.email,
      message: args.message,
      createdAt: Date.now(),
    });
  },
});

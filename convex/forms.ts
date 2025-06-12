import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const submitForm = mutation({
  args: { data: v.any() },
  handler: async (ctx, args) => {
    // Store form submission in the database
    const formSubmissionId = await ctx.db.insert("formSubmissions", {
      data: args.data,
      submittedAt: Date.now()
    });
    
    return formSubmissionId;
  },
});

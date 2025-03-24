import { query } from "./_generated/server";

export const getRecentQuotes = query({
  handler: async (ctx) => {
    // Get recent quotes, ordered by creation time
    return ctx.db
      .query("quotes")
      .order("desc")
      .take(10); // Adjust the number as needed
  },
}); 
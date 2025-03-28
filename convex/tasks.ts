import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all task lists for the current user
export const getLists = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    return ctx.db
      .query("taskLists")
      .withIndex("by_creator_order", q => q.eq("createdBy", userId))
      .order("asc")
      .collect();
  },
});

// Create a new task list
export const createList = mutation({
  args: {
    name: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Get the current number of lists to determine order if not provided
    let order = args.order;
    if (order === undefined) {
      const existingLists = await ctx.db
        .query("taskLists")
        .withIndex("by_creator", q => q.eq("createdBy", userId))
        .collect();
      
      order = existingLists.length;
    }
    
    const id = await ctx.db.insert("taskLists", {
      name: args.name,
      createdBy: userId,
      createdAt: Date.now(),
      order,
    });
    
    return id;
  },
});

// Get tasks for a specific list
export const getTasks = query({
  args: {
    listId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    return ctx.db
      .query("tasks")
      .withIndex("by_list", q => 
        q.eq("createdBy", userId).eq("listId", args.listId)
      )
      .collect();
    // Note: We're not sorting here because we'll sort in the client
    // This gives us more flexibility with the UI sorting
  },
});

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    customerName: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    listId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    return ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      customerId: args.customerId,
      customerName: args.customerName,
      dueDate: args.dueDate,
      status: "todo",
      createdBy: userId,
      createdAt: Date.now(),
      listId: args.listId,
    });
  },
});

// Update a task
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    customerName: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Get the task to verify ownership
    const task = await ctx.db.get(args.id);
    if (!task || task.createdBy !== userId) {
      throw new Error("Task not found or unauthorized");
    }
    
    // Track completion time if status is changing to completed
    const completedAt = args.status === "completed" && task.status !== "completed" 
      ? Date.now() 
      : args.status === "todo" ? undefined : task.completedAt;
    
    return ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.customerId !== undefined && { customerId: args.customerId }),
      ...(args.customerName !== undefined && { customerName: args.customerName }),
      ...(args.dueDate !== undefined && { dueDate: args.dueDate }),
      ...(args.status !== undefined && { status: args.status }),
      completedAt,
      updatedAt: Date.now(),
    });
  },
});

// Delete a task
export const deleteTask = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Get the task to verify ownership
    const task = await ctx.db.get(args.id);
    if (!task || task.createdBy !== userId) {
      throw new Error("Task not found or unauthorized");
    }
    
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});

// Delete a list and all its tasks
export const deleteList = mutation({
  args: {
    id: v.id("taskLists"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Get the list to verify ownership
    const list = await ctx.db.get(args.id);
    if (!list || list.createdBy !== userId) {
      throw new Error("List not found or unauthorized");
    }
    
    // Get all tasks in this list
    const tasksInList = await ctx.db
      .query("tasks")
      .withIndex("by_list", q => 
        q.eq("createdBy", userId).eq("listId", args.id)
      )
      .collect();
    
    // Delete all tasks in the list
    for (const task of tasksInList) {
      await ctx.db.delete(task._id);
    }
    
    // Delete the list
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});

// Add a new function to clean up old completed tasks
export const cleanupCompletedTasks = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Calculate timestamp for 24 hours ago
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Find completed tasks older than 24 hours
    const tasksToDelete = await ctx.db
      .query("tasks")
      .withIndex("by_completed_at", q => 
        q.eq("createdBy", userId)
         .gt("completedAt", 0) // Must have a completedAt timestamp
         .lt("completedAt", oneDayAgo) // Completed more than a day ago
      )
      .collect();
    
    // Delete the old completed tasks
    let deletedCount = 0;
    for (const task of tasksToDelete) {
      await ctx.db.delete(task._id);
      deletedCount++;
    }
    
    return { deletedCount };
  },
});

// Initialize default list if none exists
export const initializeDefaultList = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Check if user already has any lists
    const existingLists = await ctx.db
      .query("taskLists")
      .withIndex("by_creator", q => q.eq("createdBy", userId))
      .collect();
    
    // Only create default list if user has no lists
    if (existingLists.length === 0) {
      const defaultListId = await ctx.db.insert("taskLists", {
        name: "My Tasks",
        createdBy: userId,
        createdAt: Date.now(),
        order: 0,
      });
      
      return { created: true, defaultListId };
    }
    
    return { created: false, defaultListId: existingLists[0]._id };
  },
});

// Update list order
export const updateListOrder = mutation({
  args: {
    lists: v.array(
      v.object({
        id: v.id("taskLists"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    
    // Update the order of each list
    for (const item of args.lists) {
      const list = await ctx.db.get(item.id);
      
      // Verify ownership
      if (!list || list.createdBy !== userId) {
        throw new Error("List not found or unauthorized");
      }
      
      // Update the order
      await ctx.db.patch(item.id, {
        order: item.order,
      });
    }
    
    return { success: true };
  },
}); 
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    companyName: v.optional(v.string()),
    partnerStatus: v.optional(v.string()),
    joinDate: v.optional(v.number()),
  }).index("by_token", ["tokenIdentifier"]),
  
  // Learning materials
  learningMaterials: defineTable({
    title: v.string(),
    description: v.string(),
    link: v.string(),
    type: v.string(), // "presentation", "document", "video", "link", etc.
    tags: v.array(v.string()),
    uploadedBy: v.string(), // userId
    uploadedAt: v.number(),
    updatedAt: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  })
    .index("by_type", ["type"])
    .index("by_tags", ["tags"])
    .index("by_uploadedBy", ["uploadedBy"]),
  
  // Deal registrations
  deals: defineTable({
    partnerId: v.string(), // userId of the partner
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    opportunityAmount: v.number(),
    expectedCloseDate: v.number(), // timestamp
    status: v.string(), // "pending", "approved", "rejected", "closed"
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_partnerId", ["partnerId"])
    .index("by_status", ["status"]),
  
  subscriptions: defineTable({
    userId: v.optional(v.string()),
    stripeId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    currency: v.optional(v.string()),
    interval: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    amount: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    canceledAt: v.optional(v.number()),
    customerCancellationReason: v.optional(v.string()),
    customerCancellationComment: v.optional(v.string()),
    metadata: v.optional(v.any()),
    customFieldData: v.optional(v.any()),
    customerId: v.optional(v.string()),
  })
    .index("userId", ["userId"])
    .index("stripeId", ["stripeId"]),
  webhookEvents: defineTable({
    type: v.string(),
    stripeEventId: v.string(),
    createdAt: v.string(),
    modifiedAt: v.string(),
    data: v.any(),
  })
    .index("type", ["type"])
    .index("stripeEventId", ["stripeEventId"]),
  invoices: defineTable({
    createdTime: v.optional(v.number()), // Timestamp as number
    invoiceId: v.string(),
    subscriptionId: v.string(),
    amountPaid: v.string(),
    amountDue: v.string(),
    currency: v.string(),
    status: v.string(),
    email: v.string(),
    userId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_invoiceId", ["invoiceId"])
    .index("by_subscriptionId", ["subscriptionId"]),
  forms: defineTable({
    name: v.string(),
    email: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }),
  // Partner applications - changed userId to string to match existing data
  partnerApplications: defineTable({
    userId: v.string(), // Changed from v.id("users") to v.string()
    companyName: v.string(),
    businessType: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    website: v.optional(v.string()),
    reasonForPartnership: v.string(),
    region: v.optional(v.string()),
    status: v.string(),
    createdAt: v.optional(v.number()),
    submittedAt: v.optional(v.number()),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.string()),
    rejectedAt: v.optional(v.number()),
    rejectedBy: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),
});

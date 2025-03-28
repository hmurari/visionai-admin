import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Import your migrations
import * as migrations from "./migrations";

// Export your migrations so they're accessible via the CLI
export { migrations };

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    role: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companySize: v.optional(v.string()),
    industry: v.optional(v.string()),
    industryFocus: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    website: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    image: v.optional(v.string()),
    joinDate: v.optional(v.number()),
    partnerStatus: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    annualRevenue: v.optional(v.string()),
    reasonForPartnership: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),
  
  deals: defineTable({
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    contactName: v.optional(v.string()),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    customerCity: v.optional(v.string()),
    customerState: v.optional(v.string()),
    customerZip: v.optional(v.string()),
    customerCountry: v.optional(v.string()),
    opportunityAmount: v.number(),
    expectedCloseDate: v.number(),
    notes: v.optional(v.string()),
    partnerId: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    status: v.string(),
    lastFollowup: v.optional(v.number()),
    cameraCount: v.optional(v.number()),
    interestedUsecases: v.optional(v.array(v.string())),
    lastCommentAt: v.optional(v.number()),
    lastCommentSentiment: v.optional(v.string()),
    commissionRate: v.optional(v.number()),
    dealStage: v.optional(v.string()),
  }).index("by_partner", ["partnerId"]).index("by_customer", ["customerId"]),
  
  learningMaterials: defineTable({
    title: v.string(),
    description: v.string(),
    link: v.string(),
    type: v.string(),
    tags: v.array(v.string()),
    uploadedBy: v.string(),
    uploadedAt: v.number(),
    updatedAt: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  })
    .index("by_type", ["type"])
    .index("by_tags", ["tags"])
    .index("by_uploadedBy", ["uploadedBy"]),
  
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
    createdTime: v.optional(v.number()),
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
  
  partnerApplications: defineTable({
    userId: v.string(),
    companyName: v.string(),
    businessType: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    website: v.optional(v.string()),
    reasonForPartnership: v.string(),
    region: v.optional(v.string()),
    annualRevenue: v.optional(v.string()),
    industryFocus: v.optional(v.string()),
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

  dealComments: defineTable({
    dealId: v.id("deals"),
    partnerId: v.string(),
    text: v.string(),
    sentiment: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_deal", ["dealId"]).index("by_partner", ["partnerId"]),

  quotes: defineTable({
    userId: v.string(),
    customerId: v.optional(v.id("customers")),
    customerName: v.string(),
    companyName: v.string(),
    email: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    totalAmount: v.number(),
    cameraCount: v.number(),
    packageName: v.string(),
    subscriptionType: v.string(),
    deploymentType: v.string(),
    quoteData: v.any(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_created", ["createdAt"])
    .index("by_customer", ["customerId"]),

  customers: defineTable({
    name: v.string(),
    companyName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zip: v.optional(v.string()),
    country: v.optional(v.string()),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_company", ["companyName"])
    .index("by_creator", ["createdBy"])
    .index("by_created", ["createdAt"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    customerId: v.optional(v.id("customers")),
    customerName: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: v.string(), // "todo" or "completed"
    completedAt: v.optional(v.number()), // New field to track when a task was completed
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    listId: v.string(), // to organize tasks into different lists/tabs
  })
    .index("by_creator", ["createdBy"])
    .index("by_list", ["createdBy", "listId"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["createdBy", "status"])
    .index("by_completed_at", ["createdBy", "completedAt"]), // New index to query by completion time

  taskLists: defineTable({
    name: v.string(),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    order: v.number(), // for sorting lists
  })
    .index("by_creator", ["createdBy"]),
});

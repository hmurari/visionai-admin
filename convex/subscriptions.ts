import { v } from "convex/values";
import Stripe from "stripe";
import { api, internal } from "./_generated/api";
import {
    action,
    httpAction,
    mutation,
    query
} from "./_generated/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = action({
    args: { priceId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.runQuery(api.users.getUserByToken, {
            tokenIdentifier: identity.subject
        });

        if (!user) {
            throw new Error("User not found");
        }

        const metadata = {
            userId: user.tokenIdentifier, // DO NOT FORGET THIS
            email: user.email,
        }

        const checkout = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{ price: args.priceId, quantity: 1, }],
            metadata,
            mode: "subscription",
            customer_email: user.email,
            allow_promotion_codes: true,
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        return checkout;
    },
});

export const paymentWebhook = httpAction(async (ctx, request) => {
    try {
        const body = await request.text();
        const sig = request.headers.get("Stripe-Signature");

        if (!sig) {
            return new Response(
                JSON.stringify({ error: "No Stripe-Signature header" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // track events and based on events store data
        await ctx.runAction(api.subscriptions.webhooksHandler, {
            body,
            sig
        });

        return new Response(
            JSON.stringify({ message: "Webhook received!" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ error: "Webhook processing failed" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
});

export const getProducts = action({
    handler: async (ctx) => {
        try {
            const plans = await stripe.plans.list({
                active: true,
            });

            return plans;
        } catch (error) {
            console.error("Error getting products:", error);
            throw error;
        }
    }
});

export const getUserSubscriptionStatus = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { hasActiveSubscription: false };
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.subject)
            )
            .unique();

        if (!user) {
            return { hasActiveSubscription: false };
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
            .first();

        const hasActiveSubscription = subscription?.status === "active";
        return { hasActiveSubscription };
    }
});

export const getUserSubscription = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const userId = identity.subject;
        
        // First try to find by userId
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
        
        if (subscription) {
            return subscription;
        }
        
        // If not found by userId, try to find by partnerId
        // (This is for backward compatibility)
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_partner", (q) => q.eq("partnerId", userId))
            .first();
    },
});

export const getUserDashboardUrl = action({
    handler: async (ctx, args: { customerId: string }) => {
        try {
            
            const session = await stripe.billingPortal.sessions.create({
                customer: args.customerId,
                return_url: process.env.FRONTEND_URL, // URL to redirect to after the customer is done in the portal
            });

            return { url: session.url };

        } catch (error) {
            console.error("Error creating customer session:", error);
            throw new Error("Failed to create customer session");
        }
    }
});

export const handleSubscriptionCreated = mutation({
    args: { webhookData: v.any() },
    async handler(ctx, args) {
        const { webhookData } = args;
        const subscriptionData = webhookData.data.object;

        // Check if subscription already exists
        const existingSub = await ctx.db
            .query("subscriptions")
            .withIndex("stripeId", (q) => q.eq("stripeId", subscriptionData.id))
            .first();

        if (existingSub) {
            return await ctx.db.patch(existingSub._id, {
                status: subscriptionData.status,
                metadata: subscriptionData.metadata || {},
                userId: subscriptionData.metadata?.userId,
                currentPeriodStart: subscriptionData.current_period_start,
                currentPeriodEnd: subscriptionData.current_period_end,
            });
        }

        // Create new subscription
        return await ctx.db.insert("subscriptions", {
            stripeId: subscriptionData.id,
            stripePriceId: subscriptionData.plan.id,
            currency: subscriptionData.currency,
            interval: subscriptionData.plan.interval,
            userId: subscriptionData.metadata?.userId,
            status: subscriptionData.status,
            currentPeriodStart: subscriptionData.current_period_start,
            currentPeriodEnd: subscriptionData.current_period_end,
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            amount: subscriptionData.plan.amount,
            startedAt: subscriptionData.start_date,
            endedAt: subscriptionData.ended_at || undefined,
            canceledAt: subscriptionData.canceled_at || undefined,
            customerCancellationReason: subscriptionData.cancellation_details?.reason || undefined,
            customerCancellationComment: subscriptionData.cancellation_details?.comment || undefined,
            metadata: subscriptionData.metadata || {},
            customerId: subscriptionData.customer
        });
    },
});

export const handleSubscriptionUpdated = mutation({
    args: { webhookData: v.any() },
    async handler(ctx, args) {
        const { webhookData } = args;
        const subscriptionData = webhookData.data.object;

        const existingSub = await ctx.db
            .query("subscriptions")
            .withIndex("stripeId", (q) => q.eq("stripeId", subscriptionData.id))
            .first();

        if (existingSub) {
            return await ctx.db.patch(existingSub._id, {
                amount: subscriptionData.plan.amount,
                status: subscriptionData.status,
                currentPeriodStart: subscriptionData.current_period_start,
                currentPeriodEnd: subscriptionData.current_period_end,
                cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
                metadata: subscriptionData.metadata || {},
                userId: subscriptionData.metadata?.userId || existingSub.userId,
                customerCancellationReason: subscriptionData.cancellation_details?.reason || undefined,
                customerCancellationComment: subscriptionData.cancellation_details?.comment || undefined,
            });
        }
    },
});

export const handleCheckoutSessionCompleted = action({
    args: { webhookData: v.any() },
    async handler(ctx, args) {
        const { webhookData } = args;
        const session = webhookData.data.object;

        console.log("SESSION_DEBUG:", session);

        // Mark the checkout link as used if it exists
        if (session.id) {
            const checkoutLink = await ctx.db
                .query("checkoutLinks")
                .withIndex("by_session", (q) => q.eq("sessionId", session.id))
                .first();
            
            if (checkoutLink) {
                await ctx.db.patch(checkoutLink._id, { isUsed: true });
            }
        }

        if (session.subscription) {
            // Implement retry logic
            let checkoutSub = null;
            let attempts = 0;
            const maxAttempts = 5;
            const delayMs = 1000; // 1 second delay between attempts

            while (attempts < maxAttempts) {
                checkoutSub = await ctx.runQuery(internal.subscriptions.getSubscriptionByStripeId, {
                    stripeId: session.subscription
                });

                console.log(`CHECKOUT_SUB_DEBUG (Attempt ${attempts + 1}):`, checkoutSub);

                if (checkoutSub) {
                    break;
                }

                // Use proper sleep function for actions
                await new Promise(resolve => setTimeout(resolve, delayMs));
                attempts++;
            }

            if (checkoutSub) {
                console.log("patching checkoutSub");
                // Only update if payment is successful
                if (session.payment_status === "paid") {
                    // Make sure to include the partnerId from the session metadata
                    return await ctx.runMutation(internal.subscriptions.updateSubscription, {
                        id: checkoutSub._id,
                        status: "active",
                        metadata: session.metadata || checkoutSub.metadata,
                        userId: session.metadata?.userId || checkoutSub.userId,
                        partnerId: session.metadata?.partnerId || checkoutSub.partnerId,
                    });
                }
            } else {
                console.log("Failed to find subscription after", maxAttempts, "attempts");
            }
        }
    },
});

export const getSubscriptionByStripeId = query({
    args: { stripeId: v.string() },
    async handler(ctx, args) {
        return await ctx.db
            .query("subscriptions")
            .withIndex("stripeId", (q) => q.eq("stripeId", args.stripeId))
            .first();
    },
});

export const updateSubscription = mutation({
    args: {
        id: v.id("subscriptions"),
        status: v.string(),
        metadata: v.any(),
        userId: v.string(),
        partnerId: v.optional(v.string()),
    },
    async handler(ctx, args) {
        return await ctx.db.patch(args.id, {
            status: args.status,
            metadata: args.metadata,
            userId: args.userId,
            ...(args.partnerId && { partnerId: args.partnerId }),
        });
    },
});

export const storeWebhookEvent = mutation({
    args: {
        type: v.string(),
        stripeEventId: v.string(),
        created: v.string(),
        modifiedAt: v.string(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("webhookEvents", args);
    },
});

export const handleInvoicePaymentSucceeded = mutation({
    args: { webhookData: v.any() },
    async handler(ctx, args) {
        const { webhookData } = args;
        const invoice = webhookData.data.object;

        // Get the subscription if it exists, but don't require it
        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("stripeId", (q) => q.eq("stripeId", invoice.subscription))
            .first();

        // Create invoice record regardless of subscription status
        return await ctx.db.insert("invoices", {
            createdTime: invoice.created,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            amountPaid: invoice.amount_paid.toString(),
            amountDue: invoice.amount_due.toString(),
            currency: invoice.currency,
            status: invoice.status,
            email: invoice.customer_email,
            // Use subscription metadata if available, otherwise use customer email as identifier
            userId: subscription?.metadata?.userId
        });
    },
});

export const handleInvoicePaymentFailed = mutation({
    args: { webhookData: v.any() },
    async handler(ctx, args) {
        const { webhookData } = args;
        const invoice = webhookData.data.object;

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("stripeId", (q) => q.eq("stripeId", invoice.subscription))
            .first();

        if (subscription) {
            return await ctx.db.patch(subscription._id, {
                status: "past_due",
            });
        }
    },
});

export const handleSubscriptionDeleted = mutation({
    args: { webhookData: v.any() },
    async handler(ctx, args) {
        const { webhookData } = args;
        const info = webhookData.data.object;

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("stripeId", (q) => q.eq("stripeId", info.id))
            .first();

        if (subscription) {
            return await ctx.db.patch(subscription._id, {
                status: info.status,
            });
        }
    }
});

export const webhooksHandler = action({
    args: { body: v.string(), sig: v.string() },
    async handler(ctx, args) {
        const event = await stripe.webhooks.constructEventAsync(
            args.body,
            args.sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        const webhookData = JSON.parse(args.body);

        // Store webhook event
        await ctx.runMutation(api.subscriptions.storeWebhookEvent, {
            type: event.type,
            stripeEventId: webhookData.id,
            createdAt: webhookData.created,
            data: webhookData
        });

        switch (event.type) {
            case 'customer.subscription.created':
                return await ctx.runMutation(api.subscriptions.handleSubscriptionCreated, { webhookData });

            case 'customer.subscription.updated':
                return await ctx.runMutation(api.subscriptions.handleSubscriptionUpdated, { webhookData });

            case 'customer.subscription.deleted':
                console.log("deleted", webhookData);
                return await ctx.runMutation(api.subscriptions.handleSubscriptionDeleted, { webhookData });

            case "checkout.session.completed":
                const session = event.data.object;
                
                // Check if this was a subscription with a pending starter kit
                if (session.metadata?.starterKitPending === 'true' && session.customer) {
                    // Create an invoice item for the starter kit
                    await stripe.invoiceItems.create({
                        customer: session.customer,
                        price: session.metadata.starterKitPriceId,
                        description: 'Starter Kit (one-time purchase)',
                    });
                    
                    // Create and pay the invoice immediately
                    const invoice = await stripe.invoices.create({
                        customer: session.customer,
                        auto_advance: true,
                        collection_method: 'charge_automatically',
                        description: 'Starter Kit for Vision AI',
                    });
                    
                    await stripe.invoices.pay(invoice.id);
                }
                
                // Continue with your existing checkout.session.completed handling
                break;

            case "invoice.payment_succeeded":
                return await ctx.runMutation(api.subscriptions.handleInvoicePaymentSucceeded, { webhookData });

            case "invoice.payment_failed":
                return await ctx.runMutation(api.subscriptions.handleInvoicePaymentFailed, { webhookData });

            default:
                console.log(`Unhandled event type: ${event.type}`);
                break;
        }
    },
});

// Get all subscriptions for a partner - fetches directly from Stripe
export const getPartnerSubscriptions = query({
    args: { partnerId: v.string() },
    handler: async (ctx, args) => {
        // We'll use this as a lightweight query that returns quickly
        // The actual Stripe data will be fetched client-side
        const subscriptionRefs = await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
            .collect();
        
        return subscriptionRefs;
    }
});

// Add a function to fetch ALL subscriptions for a partner directly from Stripe
export const getAllPartnerSubscriptionsFromStripe = action({
    args: { partnerId: v.string() },
    handler: async (ctx, args) => {
        try {
            // Fetch all subscriptions from Stripe with simpler expand paths
            const subscriptions = await stripe.subscriptions.list({
                expand: ['data.customer', 'data.items.data.price'],
                limit: 100 // Adjust as needed
            });
            
            // Filter subscriptions by partnerId in metadata
            const partnerSubscriptions = subscriptions.data.filter(
                sub => sub.metadata?.partnerId === args.partnerId
            );
            
            // For each subscription, ensure we have a record in our database
            for (const sub of partnerSubscriptions) {
                const firstItem = sub.items.data[0];
                if (!firstItem) continue;
                
                // Get product details in a separate call if needed
                let productId = '';
                let productName = '';
                
                if (firstItem.price && typeof firstItem.price !== 'string') {
                    productId = firstItem.price.product as string;
                    
                    // Optionally fetch product details if needed
                    try {
                        const product = await stripe.products.retrieve(productId);
                        productName = product.name || '';
                    } catch (err) {
                        console.error(`Error fetching product ${productId}:`, err);
                    }
                }
                
                // Determine subscription type from price ID or metadata
                let subscriptionType = sub.metadata?.subscriptionType || 'monthly';
                
                // Calculate the total amount correctly
                let totalAmount = 0;
                if (typeof firstItem.price !== 'string' && firstItem.price.unit_amount) {
                    totalAmount = firstItem.price.unit_amount * (firstItem.quantity || 1);
                }
                
                // Store or update the subscription in our database
                await ctx.runMutation(internal.subscriptions.upsertSubscription, {
                    customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
                    subscriptionId: sub.id,
                    status: sub.status,
                    currentPeriodEnd: sub.current_period_end * 1000,
                    priceId: typeof firstItem.price === 'string' ? firstItem.price : firstItem.price.id,
                    productId,
                    partnerId: args.partnerId,
                    quoteId: sub.metadata?.quoteId,
                    customerName: typeof sub.customer === 'string' ? 'Unknown' : sub.customer.name || 'Unknown',
                    customerEmail: typeof sub.customer === 'string' ? 'Unknown' : sub.customer.email || 'Unknown',
                    cameraCount: firstItem.quantity || 1,
                    subscriptionType,
                    includesStarterKit: sub.metadata?.includesStarterKit === 'true',
                    totalAmount,
                    metadata: sub.metadata || {},
                    createdAt: sub.created * 1000,
                    updatedAt: Date.now(),
                });
            }
            
            return partnerSubscriptions;
        } catch (error) {
            console.error("Error fetching subscriptions from Stripe:", error);
            throw new Error(`Failed to fetch subscriptions: ${error.message}`);
        }
    }
});

// Add a separate action to fetch subscription details from Stripe
export const getSubscriptionDetails = action({
    args: { subscriptionId: v.string() },
    handler: async (ctx, args) => {
        try {
            const stripeSubscription = await stripe.subscriptions.retrieve(
                args.subscriptionId,
                { expand: ['customer', 'items.data.price.product'] }
            );
            
            return stripeSubscription;
        } catch (error) {
            console.error(`Error fetching subscription ${args.subscriptionId}:`, error);
            return null;
        }
    }
});

// Get subscription references from our database
export const getPartnerSubscriptionRefs = query({
    args: { partnerId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
            .order("desc")
            .collect();
    }
});

// Get a single subscription by ID
export const getSubscription = query({
    args: { subscriptionId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .filter((q) => q.eq(q.field("subscriptionId"), args.subscriptionId))
            .first();
    }
});

// Store minimal subscription data in our database
export const upsertSubscription = mutation({
    args: {
        customerId: v.string(),
        subscriptionId: v.string(),
        status: v.string(),
        currentPeriodEnd: v.number(),
        priceId: v.string(),
        productId: v.string(),
        partnerId: v.string(),
        quoteId: v.optional(v.string()),
        customerName: v.string(),
        customerEmail: v.string(),
        cameraCount: v.number(),
        subscriptionType: v.string(),
        includesStarterKit: v.boolean(),
        totalAmount: v.number(),
        metadata: v.any(),
        createdAt: v.number(),
        updatedAt: v.number(),
    },
    handler: async (ctx, args) => {
        // Check if subscription already exists
        const existing = await ctx.db
            .query("subscriptions")
            .withIndex("by_subscription", (q) => q.eq("subscriptionId", args.subscriptionId))
            .first();
        
        if (existing) {
            // Update existing subscription
            return await ctx.db.patch(existing._id, {
                status: args.status,
                currentPeriodEnd: args.currentPeriodEnd,
                cameraCount: args.cameraCount,
                totalAmount: args.totalAmount,
                updatedAt: args.updatedAt,
            });
        } else {
            // Create new subscription
            return await ctx.db.insert("subscriptions", {
                customerId: args.customerId,
                subscriptionId: args.subscriptionId,
                status: args.status,
                currentPeriodEnd: args.currentPeriodEnd,
                priceId: args.priceId,
                productId: args.productId,
                partnerId: args.partnerId,
                quoteId: args.quoteId,
                customerName: args.customerName,
                customerEmail: args.customerEmail,
                cameraCount: args.cameraCount,
                subscriptionType: args.subscriptionType,
                includesStarterKit: args.includesStarterKit,
                totalAmount: args.totalAmount,
                metadata: args.metadata,
                createdAt: args.createdAt,
                updatedAt: args.updatedAt,
            });
        }
    },
});

// Get a URL to manage a subscription
export const getSubscriptionManageUrl = action({
    args: { 
        customerId: v.string(),
        returnUrl: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const { customerId } = args;
        
        try {
            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: args.returnUrl || `${process.env.FRONTEND_URL}/subscriptions`,
            });
            
            return { url: session.url };
        } catch (error) {
            console.error("Error creating billing portal session:", error);
            throw new Error(`Failed to create billing portal session: ${error.message}`);
        }
    },
});

// Add this function to test subscription creation
export const createTestSubscription = action({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }
        
        const userId = identity.subject;
        
        // Create a test customer in Stripe
        const customer = await stripe.customers.create({
            email: "test@example.com",
            name: "Test Customer",
            metadata: {
                partnerId: userId
            }
        });
        
        // Create a test subscription in Stripe
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: process.env.VISIONAI_MONTHLY_PRICE_ID,
                    quantity: 5
                }
            ],
            metadata: {
                partnerId: userId,
                quoteId: "test_quote_" + Date.now()
            }
        });
        
        // Store minimal reference in our database
        await ctx.runMutation(internal.subscriptions.upsertSubscription, {
            customerId: customer.id,
            subscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end * 1000,
            priceId: process.env.VISIONAI_MONTHLY_PRICE_ID!,
            productId: "prod_test",
            partnerId: userId,
            quoteId: "test_quote_" + Date.now(),
            customerName: "Test Customer",
            customerEmail: "test@example.com",
            cameraCount: 5,
            subscriptionType: "monthly",
            includesStarterKit: false,
            totalAmount: 49900,
            metadata: subscription.metadata,
        });
        
        return { success: true };
    },
});

// Generate a unique checkout link for a customer that attributes to the partner
export const generateCustomerCheckoutLink = action({
  args: { 
    quoteId: v.string(),
    customerEmail: v.string(),
    cameraCount: v.number(),
    subscriptionType: v.string(),
    discountPercentage: v.optional(v.number()),
    partnerId: v.string(),
    starterKitIncluded: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      quoteId,
      customerEmail,
      cameraCount,
      subscriptionType,
      discountPercentage = 0,
      partnerId,
      starterKitIncluded = false,
    } = args;

    // Define price IDs based on subscription type
    const priceIds = {
      starterKit: process.env.VISIONAI_STARTER_KIT_PRICE_ID,
      monthly: process.env.VISIONAI_MONTHLY_PRICE_ID,
      yearly: process.env.VISIONAI_YEARLY_PRICE_ID,
      threeYear: process.env.VISIONAI_THREE_YEAR_PRICE_ID,
    };

    // Create a coupon if discount is applied
    let couponId = null;
    if (discountPercentage > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: 'forever',
        name: `Quote ${quoteId} Special Discount`,
      });
      couponId = coupon.id;
    }

    // Add metadata to include quoteId and partnerId
    const metadata = {
      quoteId,
      cameraCount,
      subscriptionType,
      includesStarterKit: starterKitIncluded ? 'true' : 'false',
      partnerId,
    };

    // Determine subscription price ID
    let subscriptionPriceId;
    switch (subscriptionType) {
      case 'yearly':
        subscriptionPriceId = priceIds.yearly;
        break;
      case 'threeYear':
        subscriptionPriceId = priceIds.threeYear;
        break;
      default:
        subscriptionPriceId = priceIds.monthly;
    }

    // Create a checkout session that doesn't expire immediately
    // Note: Stripe requires expires_at to be less than 24 hours from creation
    // We'll store a longer expiration in our database for display purposes
    const sessionOptions = {
      payment_method_types: ['card'],
      line_items: [{
        price: subscriptionPriceId,
        quantity: cameraCount,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/quotes/${quoteId}`,
      customer_email: customerEmail,
      metadata,
      // Set expiration to 23 hours from now (just under Stripe's 24-hour limit)
      expires_at: Math.floor(Date.now() / 1000) + (23 * 60 * 60),
    };

    // Apply discount if needed
    if (couponId) {
      sessionOptions.discounts = [{ coupon: couponId }];
    }

    // If starter kit is included, add it as metadata to process later
    if (starterKitIncluded) {
      sessionOptions.metadata.starterKitPending = 'true';
      sessionOptions.metadata.starterKitPriceId = priceIds.starterKit;
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionOptions);
    
    // Calculate a display expiration date (30 days from now)
    // This is just for UI purposes and doesn't affect the actual Stripe session
    const displayExpiresAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString();
    
    // Store the checkout link in our database for tracking
    await ctx.runMutation(internal.subscriptions.storeCheckoutLink, {
      quoteId,
      partnerId,
      customerEmail,
      checkoutUrl: session.url,
      sessionId: session.id,
      // Store the actual Stripe expiration
      expiresAt: new Date(session.expires_at * 1000).toISOString(),
      // Store our display expiration separately
      displayExpiresAt,
      createdAt: new Date().toISOString(),
    });

    return { 
      sessionId: session.id, 
      url: session.url,
      // Return the display expiration for UI
      expiresAt: displayExpiresAt
    };
  },
});

// Store checkout link in database
export const storeCheckoutLink = mutation({
  args: {
    quoteId: v.string(),
    partnerId: v.string(),
    customerEmail: v.string(),
    checkoutUrl: v.string(),
    sessionId: v.string(),
    expiresAt: v.string(),
    displayExpiresAt: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("checkoutLinks", {
      quoteId: args.quoteId,
      partnerId: args.partnerId,
      customerEmail: args.customerEmail,
      checkoutUrl: args.checkoutUrl,
      sessionId: args.sessionId,
      expiresAt: args.expiresAt,
      displayExpiresAt: args.displayExpiresAt,
      createdAt: args.createdAt,
      isUsed: false,
    });
  },
});

// Get checkout link for a quote
export const getCheckoutLinkForQuote = query({
  args: { quoteId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("checkoutLinks")
      .filter((q) => q.eq(q.field("quoteId"), args.quoteId))
      .order("desc")
      .first();
  },
});

// Get all checkout links for a partner
export const getPartnerCheckoutLinks = query({
  args: { partnerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("checkoutLinks")
      .withIndex("by_partner", (q) => q.eq("partnerId", args.partnerId))
      .order("desc")
      .collect();
  },
});
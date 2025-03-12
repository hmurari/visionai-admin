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
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.subject)
            )
            .unique();

        if (!user) {
            return null;
        }

        const subscription = await ctx.db
            .query("subscriptions")
            .withIndex("userId", (q) => q.eq("userId", user.tokenIdentifier))
            .first();

        return subscription;
    }
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
                    return await ctx.runMutation(internal.subscriptions.updateSubscription, {
                        id: checkoutSub._id,
                        status: "active",
                        metadata: session.metadata || checkoutSub.metadata,
                        userId: session.metadata?.userId || checkoutSub.userId,
                    });
                }
            } else {
                console.log("Failed to find subscription after", maxAttempts, "attempts");
                // You might want to store this in a separate table for failed webhooks to retry later
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
    },
    async handler(ctx, args) {
        return await ctx.db.patch(args.id, {
            status: args.status,
            metadata: args.metadata,
            userId: args.userId,
        });
    },
});

export const storeWebhookEvent = mutation({
    args: {
        type: v.string(),
        stripeEventId: v.string(),
        created: v.number(),
        data: v.any()
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("webhookEvents", {
            type: args.type,
            stripeEventId: args.stripeEventId,
            createdAt: new Date(args.created * 1000).toISOString(),
            modifiedAt: new Date(args.created * 1000).toISOString(),
            data: args.data,
        });
    }
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
            created: webhookData.created,
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
                return await ctx.runAction(api.subscriptions.handleCheckoutSessionCompleted, { webhookData });

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
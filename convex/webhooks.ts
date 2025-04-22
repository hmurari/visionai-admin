import { v } from "convex/values";
import Stripe from "stripe";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// This is now a helper function that will be called by the HTTP handler
export const processWebhook = action({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        args.body,
        args.signature,
        endpointSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }
    
    // Store the event for debugging purposes
    await ctx.runMutation(internal.subscriptions.storeWebhookEvent, {
      type: event.type,
      stripeEventId: event.id,
      created: new Date(event.created * 1000).toISOString(),
      modifiedAt: new Date().toISOString(),
      data: event.data.object,
    });
    
    // Process the event based on its type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(ctx, event);
        break;
        
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(ctx, event);
        break;
        
      // Add other event types as needed
    }
    
    return { success: true };
  },
});

// Handle checkout.session.completed event
async function handleCheckoutSessionCompleted(ctx, event) {
  const session = event.data.object;
  
  // Check if this was a subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    // Retrieve the subscription details
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription,
      { expand: ['items.data.price.product'] }
    );
    
    // Get metadata
    const quoteId = session.metadata?.quoteId;
    let partnerId = session.metadata?.partnerId;
    
    if (!partnerId) {
      console.error("No partner ID found for subscription");
      return;
    }
    
    // Get the first subscription item
    const firstItem = subscription.items.data[0];
    
    // Determine subscription type from price ID
    let subscriptionType = 'monthly';
    if (firstItem.price.id === process.env.VISIONAI_YEARLY_PRICE_ID) {
      subscriptionType = 'yearly';
    } else if (firstItem.price.id === process.env.VISIONAI_THREE_YEAR_PRICE_ID) {
      subscriptionType = 'threeYear';
    }
    
    // Store minimal subscription reference
    await ctx.runMutation(internal.subscriptions.upsertSubscription, {
      customerId: subscription.customer,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end * 1000,
      priceId: firstItem.price.id,
      productId: firstItem.price.product,
      partnerId,
      quoteId: quoteId || undefined,
      customerName: session.customer_details?.name || 'Unknown',
      customerEmail: session.customer_details?.email || session.customer_email || 'Unknown',
      cameraCount: firstItem.quantity,
      subscriptionType,
      includesStarterKit: session.metadata?.includesStarterKit === 'true',
      totalAmount: 0, // We'll fetch this from Stripe when needed
      metadata: session.metadata || {},
    });
  }
}

// Handle subscription updated/deleted events
async function handleSubscriptionUpdated(ctx, event) {
  const subscriptionData = event.data.object;
  
  // Find the subscription in our database
  const existingSubscription = await ctx.runQuery(
    internal.subscriptions.getSubscription, 
    { subscriptionId: subscriptionData.id }
  );
  
  if (existingSubscription) {
    // Update only the status and end date
    await ctx.runMutation(internal.subscriptions.upsertSubscription, {
      customerId: existingSubscription.customerId,
      subscriptionId: existingSubscription.subscriptionId,
      status: subscriptionData.status,
      currentPeriodEnd: subscriptionData.current_period_end * 1000,
      priceId: existingSubscription.priceId,
      productId: existingSubscription.productId,
      partnerId: existingSubscription.partnerId,
      quoteId: existingSubscription.quoteId,
      customerName: existingSubscription.customerName,
      customerEmail: existingSubscription.customerEmail,
      cameraCount: existingSubscription.cameraCount,
      subscriptionType: existingSubscription.subscriptionType,
      includesStarterKit: existingSubscription.includesStarterKit,
      totalAmount: existingSubscription.totalAmount,
      metadata: existingSubscription.metadata,
    });
  }
}
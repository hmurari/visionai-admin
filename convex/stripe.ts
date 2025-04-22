import { v } from "convex/values";
import Stripe from "stripe";
import { action, query } from "./_generated/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create a checkout session for one-time purchase + subscription
export const createCheckoutSession = action({
  args: {
    quoteId: v.string(),
    customerEmail: v.string(),
    starterKitIncluded: v.boolean(),
    cameraCount: v.number(),
    subscriptionType: v.string(), // 'monthly', 'yearly', or 'threeYear'
    discountPercentage: v.number(),
    partnerId: v.string(),
  },
  handler: async (ctx, args) => {
    const {
      quoteId,
      customerEmail,
      starterKitIncluded,
      cameraCount,
      subscriptionType,
      discountPercentage,
      partnerId,
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

    // For subscription products
    if (cameraCount > 0) {
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

      // Create subscription checkout session
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
      };

      // Apply discount if needed
      if (couponId) {
        sessionOptions.discounts = [{ coupon: couponId }];
      }

      // If starter kit is included, add it as metadata to process later
      if (starterKitIncluded) {
        // We'll handle the one-time purchase after subscription is created
        sessionOptions.metadata.starterKitPending = 'true';
        sessionOptions.metadata.starterKitPriceId = priceIds.starterKit;
      }

      const session = await stripe.checkout.sessions.create(sessionOptions);
      return { sessionId: session.id, url: session.url };
    } 
    // For one-time purchase only (no subscription)
    else if (starterKitIncluded) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceIds.starterKit,
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5173/quotes/${quoteId}`,
        customer_email: customerEmail,
        metadata,
        discounts: couponId ? [{ coupon: couponId }] : undefined,
      });
      return { sessionId: session.id, url: session.url };
    }
    
    // If we get here, there's nothing to purchase
    throw new Error("No products selected for checkout");
  },
});

// Retrieve a checkout session
export const getCheckoutSession = action({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await stripe.checkout.sessions.retrieve(args.sessionId);
    return session;
  },
}); 